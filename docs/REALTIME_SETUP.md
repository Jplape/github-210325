# Configuration de Supabase Realtime

## Activation dans le Dashboard

1. Connectez-vous à https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Database" > "Replication"
4. Activez Realtime pour la table `tasks`
5. Sélectionnez les événements à suivre (INSERT, UPDATE, DELETE)

## Configuration côté client

```typescript
// Dans lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Abonnement aux changements
const channel = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, (payload) => {
    console.log('Changement reçu:', payload)
  })
  .subscribe()
```

## Tests recommandés

1. Ouvrir deux onglets/fenêtres avec l'application
2. Modifier une tâche dans un onglet
3. Vérifier que le changement apparaît instantanément dans l'autre onglet