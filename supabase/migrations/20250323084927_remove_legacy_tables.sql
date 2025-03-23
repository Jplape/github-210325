-- Vérification et suppression des contraintes de clé étrangère
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'intervention_reports') THEN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'intervention_reports'::regclass AND conname = 'intervention_reports_intervention_id_fkey') THEN
            ALTER TABLE intervention_reports
                DROP CONSTRAINT intervention_reports_intervention_id_fkey;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interventions') THEN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'interventions'::regclass AND conname = 'interventions_equipment_id_fkey') THEN
            ALTER TABLE interventions
                DROP CONSTRAINT interventions_equipment_id_fkey;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'interventions'::regclass AND conname = 'interventions_client_id_fkey') THEN
            ALTER TABLE interventions
                DROP CONSTRAINT interventions_client_id_fkey;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'equipment') THEN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'equipment'::regclass AND conname = 'equipment_client_id_fkey') THEN
            ALTER TABLE equipment
                DROP CONSTRAINT equipment_client_id_fkey;
        END IF;
    END IF;
END $$;

-- Suppression des tables dans l'ordre correct en tenant compte des dépendances
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'intervention_reports') THEN
        DROP TABLE intervention_reports;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'interventions') THEN
        DROP TABLE interventions CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'equipment') THEN
        DROP TABLE equipment CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients') THEN
        DROP TABLE clients CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tasks') THEN
        DROP TABLE tasks CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reports') THEN
        DROP TABLE reports CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teams') THEN
        DROP TABLE teams CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        DROP TABLE users CASCADE;
    END IF;
END $$;