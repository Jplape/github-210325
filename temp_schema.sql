

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_audit_trigger"("tbl_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(tbl_name || '_audit_trigger') || ' ON ' || quote_ident(tbl_name) || ';';
        EXECUTE 'CREATE TRIGGER ' || quote_ident(tbl_name || '_audit_trigger') ||
            ' AFTER INSERT OR UPDATE OR DELETE ON ' || quote_ident(tbl_name) ||
            ' FOR EACH ROW EXECUTE FUNCTION log_audit();';
    END;
    $$;


ALTER FUNCTION "public"."create_audit_trigger"("tbl_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_audit"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_user" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "app_user_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'technician'::"text", 'manager'::"text"])))
);


ALTER TABLE "public"."app_user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_conversation" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_conversation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_message" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_message" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "contact_info" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "contact_email" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "serial_number" "text" NOT NULL,
    "model" "text" NOT NULL,
    "installation_date" timestamp with time zone NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "equipment_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intervention" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "intervention_check" CHECK (("end_time" > "start_time")),
    CONSTRAINT "intervention_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "valid_intervention_duration" CHECK ((("end_time" - "start_time") <= '24:00:00'::interval))
);


ALTER TABLE "public"."intervention" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intervention_user" (
    "intervention_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."intervention_user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interventions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "task_id" "uuid",
    "date" timestamp without time zone NOT NULL,
    "duration" interval,
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."interventions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_contract" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" "uuid" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "terms" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "maintenance_contract_check" CHECK (("end_date" > "start_date"))
);


ALTER TABLE "public"."maintenance_contract" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" "uuid" NOT NULL,
    "maintenance_date" timestamp with time zone NOT NULL,
    "description" "text" NOT NULL,
    "technician" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."maintenance_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "intervention_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "report_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'finalized'::"text"])))
);


ALTER TABLE "public"."report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "intervention_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."statistics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_name" "text" NOT NULL,
    "value" numeric NOT NULL,
    "date" timestamp without time zone NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" "uuid",
    "intervention_id" "uuid",
    "description" "text" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "task_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."task" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" NOT NULL,
    "due_date" timestamp without time zone,
    "assigned_to" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_user"
    ADD CONSTRAINT "app_user_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."app_user"
    ADD CONSTRAINT "app_user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_conversation"
    ADD CONSTRAINT "chat_conversation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client"
    ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "public"."intervention"
    ADD CONSTRAINT "intervention_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intervention_user"
    ADD CONSTRAINT "intervention_user_pkey" PRIMARY KEY ("intervention_id", "user_id");



ALTER TABLE ONLY "public"."interventions"
    ADD CONSTRAINT "interventions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_contract"
    ADD CONSTRAINT "maintenance_contract_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_history"
    ADD CONSTRAINT "maintenance_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."statistics"
    ADD CONSTRAINT "statistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_contract"
    ADD CONSTRAINT "unique_equipment_contract" UNIQUE ("equipment_id", "start_date");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "app_user_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."app_user" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "chat_conversation_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."chat_conversation" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "chat_message_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."chat_message" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "client_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."client" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "clients_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "equipment_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."equipment" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "intervention_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."intervention" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "intervention_user_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."intervention_user" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "interventions_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."interventions" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "maintenance_contract_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."maintenance_contract" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "maintenance_history_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."maintenance_history" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "report_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "reports_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "statistics_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."statistics" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "task_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."task" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "tasks_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "teams_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



CREATE OR REPLACE TRIGGER "users_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intervention"
    ADD CONSTRAINT "intervention_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intervention_user"
    ADD CONSTRAINT "intervention_user_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "public"."intervention"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intervention_user"
    ADD CONSTRAINT "intervention_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interventions"
    ADD CONSTRAINT "interventions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."interventions"
    ADD CONSTRAINT "interventions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id");



ALTER TABLE ONLY "public"."maintenance_contract"
    ADD CONSTRAINT "maintenance_contract_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_history"
    ADD CONSTRAINT "maintenance_history_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "public"."intervention"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "public"."interventions"("id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "public"."intervention"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."create_audit_trigger"("tbl_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_trigger"("tbl_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_audit_trigger"("tbl_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "service_role";


















GRANT ALL ON TABLE "public"."app_user" TO "anon";
GRANT ALL ON TABLE "public"."app_user" TO "authenticated";
GRANT ALL ON TABLE "public"."app_user" TO "service_role";



GRANT ALL ON TABLE "public"."chat_conversation" TO "anon";
GRANT ALL ON TABLE "public"."chat_conversation" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_conversation" TO "service_role";



GRANT ALL ON TABLE "public"."chat_message" TO "anon";
GRANT ALL ON TABLE "public"."chat_message" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_message" TO "service_role";



GRANT ALL ON TABLE "public"."client" TO "anon";
GRANT ALL ON TABLE "public"."client" TO "authenticated";
GRANT ALL ON TABLE "public"."client" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."equipment" TO "anon";
GRANT ALL ON TABLE "public"."equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment" TO "service_role";



GRANT ALL ON TABLE "public"."intervention" TO "anon";
GRANT ALL ON TABLE "public"."intervention" TO "authenticated";
GRANT ALL ON TABLE "public"."intervention" TO "service_role";



GRANT ALL ON TABLE "public"."intervention_user" TO "anon";
GRANT ALL ON TABLE "public"."intervention_user" TO "authenticated";
GRANT ALL ON TABLE "public"."intervention_user" TO "service_role";



GRANT ALL ON TABLE "public"."interventions" TO "anon";
GRANT ALL ON TABLE "public"."interventions" TO "authenticated";
GRANT ALL ON TABLE "public"."interventions" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_contract" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_contract" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_contract" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_history" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_history" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_history" TO "service_role";



GRANT ALL ON TABLE "public"."report" TO "anon";
GRANT ALL ON TABLE "public"."report" TO "authenticated";
GRANT ALL ON TABLE "public"."report" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."statistics" TO "anon";
GRANT ALL ON TABLE "public"."statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."statistics" TO "service_role";



GRANT ALL ON TABLE "public"."task" TO "anon";
GRANT ALL ON TABLE "public"."task" TO "authenticated";
GRANT ALL ON TABLE "public"."task" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
