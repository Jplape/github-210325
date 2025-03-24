# Checklist d'Intégration Supabase - Fonctionnalité Temps Réel

## 1. Activation de Realtime (Dashboard)
**Prérequis**:
- Accès admin au projet Supabase
- Migrations RLS appliquées (20250325000000_enable_rls_for_tasks.sql)

**Étapes**:
1. Se connecter à https://supabase.com/dashboard
2. Sélectionner le projet concerné
3. Naviguer vers Database → Replication
4. Activer Realtime pour la table `tasks`
5. Configurer les événements à suivre :
   - [ ] INSERT
   - [ ] UPDATE  
   - [ ] DELETE
6. Sauvegarder les modifications

**Bonnes pratiques**:
- Limiter les abonnements aux colonnes essentielles
- Activer le filtre RLS pour la sécurité
- Documenter la configuration dans REALTIME_SETUP.md

## 2. Validation de l'Environnement
**Tests obligatoires**:
1. Vérifier la connexion client :
```bash
node scripts/test_realtime_sync.js
```
2. Contrôler :
   - Latence des événements (<500ms)
   - Isolation des données entre utilisateurs
   - Journalisation des erreurs

## 3. Déploiement en Production
**Checklist pré-production**:
- [ ] Configurer les variables d'environnement
- [ ] Vérifier les quotas du projet
- [ ] Activer le monitoring
- [ ] Documenter les procédures de rollback

## 4. Maintenance
**Actions récurrentes**:
- Surveiller la consommation des abonnements
- Auditer les politiques RLS trimestriellement
- Mettre à jour la documentation des schémas