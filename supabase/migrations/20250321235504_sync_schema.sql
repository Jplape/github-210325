-- Create audit log function
CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $_$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
END;
$_$ LANGUAGE plpgsql;

-- Create audit triggers for all tables
DO $main$
DECLARE
    tbl text;
BEGIN
    -- Create helper function
    CREATE OR REPLACE FUNCTION create_audit_trigger(tbl_name text)
    RETURNS void
    LANGUAGE plpgsql
    AS $_$
    BEGIN
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(tbl_name || '_audit_trigger') || ' ON ' || quote_ident(tbl_name) || ';';
        EXECUTE 'CREATE TRIGGER ' || quote_ident(tbl_name || '_audit_trigger') ||
            ' AFTER INSERT OR UPDATE OR DELETE ON ' || quote_ident(tbl_name) ||
            ' FOR EACH ROW EXECUTE FUNCTION log_audit();';
    END;
    $_$;

    -- Create triggers for all tables
    FOR tbl IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('schema_migrations', 'audit_log')
    ) 
    LOOP
        PERFORM create_audit_trigger(tbl);
    END LOOP;
END;
$main$;
