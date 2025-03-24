# Guide de Test de la Synchronisation Temps Réel

## Prérequis
- Supabase démarré localement
- Realtime activé pour la table `tasks`
- Politiques RLS configurées

## Étapes de test

1. **Lancer le script de test**:
```bash
node scripts/test_realtime_sync.js
```

2. **Vérifier les logs**:
- Le script doit afficher:
  - La nouvelle tâche créée
  - L'événement de changement reçu
  - La tâche récupérée après 5 secondes

3. **Test multi-clients**:
- Ouvrir deux terminaux
- Lancer le script dans les deux terminaux
- Vérifier que les changements s'affichent dans les deux instances

4. **Vérification des politiques RLS**:
```sql
-- Vérifier que RLS est activé
SELECT * FROM pg_policies WHERE tablename = 'tasks';

-- Tester avec différents rôles
SET ROLE authenticated;
SELECT * FROM tasks;
```

## Résultats attendus
- Les changements doivent apparaître en temps réel
- Les données doivent être isolées par utilisateur
- Les performances doivent rester stables