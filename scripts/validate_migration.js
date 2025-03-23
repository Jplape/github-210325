import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

async function validateMigration() {
  try {
    // Validate core tables
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('*', { count: 'exact' })
      
    if (equipmentError) throw equipmentError
      
    const { data: clientData, error: clientError } = await supabase
      .from('client')
      .select('*', { count: 'exact', head: true })
      
    if (clientError) throw clientError
      
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      
    if (userError) throw userError

    // Validate relationships
    const maintenanceContracts = await supabase
      .from('maintenance_contract')
      .select('equipment_id')
      .not('equipment_id', 'is', null)

    const interventions = await supabase
      .from('intervention')
      .select('client_id')
      .not('client_id', 'is', null)

    console.log('Validation Results:')
    console.log(`- Equipment records: ${equipmentData.count}`)
    console.log(`- Client records: ${clientData.count}`)
    console.log(`- User records: ${userData.count}`)
    console.log(`- Maintenance contracts with equipment: ${maintenanceContracts.data.length}`)
    console.log(`- Interventions with clients: ${interventions.data.length}`)

    // Check for orphaned records
    const orphanedContracts = await supabase
      .from('maintenance_contract')
      .select('equipment_id')
      .is('equipment_id', null)

    if (orphanedContracts.data.length > 0) {
      console.error('Found orphaned maintenance contracts!')
      process.exit(1)
    }

    console.log('Migration validation completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('Validation failed:', err)
    process.exit(1)
  }
}

validateMigration()