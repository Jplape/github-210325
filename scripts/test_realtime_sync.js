import { createClient } from '@supabase/supabase-js'
import minimist from 'minimist'
import 'dotenv/config'

// Configuration des tests
const args = minimist(process.argv.slice(2), {
  iterations: 1000,
  concurrency: 50,
  delay: 100
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

// Création et authentification de l'utilisateur de test
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD
})

if (signUpError && signUpError.message !== 'User already registered') {
  throw signUpError
}

const { error: signInError } = await supabase.auth.signInWithPassword({
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD
})

if (signInError) {
  throw signInError
}

// Fonction de test individuel
async function runSingleTest(testId) {
  try {
    const startTime = Date.now()
    
    // 1. Création de tâche
    const { data: task } = await supabase
      .from('tasks')
      .insert({ 
        title: `Test ${testId}`,
        user_id: supabase.auth.user()?.id 
      })
      .select()
      .single()

    // 2. Abonnement aux changements
    const channel = supabase
      .channel(`test_channel_${testId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${task.id}`
      }, (payload) => {
        console.log(`[${testId}] Changement reçu après ${Date.now() - startTime}ms`)
      })
      .subscribe()

    // 3. Simulation de modification
    setTimeout(async () => {
      await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', task.id)
      
      channel.unsubscribe()
    }, args.delay)

    return { success: true, duration: Date.now() - startTime }
  } catch (error) {
    return { success: false, error }
  }
}

// Lancement des tests concurrents
async function runStressTest() {
  console.log(`Démarrage des tests: ${args.iterations} itérations, ${args.concurrency} concurrents`)
  
  const results = []
  const activeTests = new Set()
  
  for (let i = 0; i < args.iterations; i++) {
    while (activeTests.size >= args.concurrency) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const testId = i
    activeTests.add(testId)
    
    runSingleTest(testId)
      .then(result => {
        results.push(result)
        activeTests.delete(testId)
      })
  }

  // Attente fin des tests
  while (activeTests.size > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Analyse des résultats
  const successes = results.filter(r => r.success)
  const avgDuration = successes.reduce((sum, r) => sum + r.duration, 0) / successes.length
  
  console.log(`\nRésultats:`)
  console.log(`- Réussite: ${successes.length}/${results.length}`)
  console.log(`- Latence moyenne: ${avgDuration.toFixed(2)}ms`)
}

runStressTest()