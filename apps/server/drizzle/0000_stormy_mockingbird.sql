CREATE TABLE IF NOT EXISTS "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"donor_email" varchar(255) NOT NULL,
	"blood_group" varchar(5) NOT NULL,
	"units" integer NOT NULL,
	"location" varchar(120) NOT NULL,
	"donated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"blood_group" varchar(5) PRIMARY KEY NOT NULL,
	"units" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "inventory_blood_group_check" CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
	CONSTRAINT "inventory_units_check" CHECK ("inventory"."units" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"blood_group" varchar(5) NOT NULL,
	"units" integer NOT NULL,
	"location" varchar(120) NOT NULL,
	"donor_email" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"urgency" varchar(20) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "requests_blood_group_check" CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
	CONSTRAINT "requests_units_check" CHECK ("requests"."units" > 0),
	CONSTRAINT "requests_status_check" CHECK ("requests"."status" IN ('pending','approved','rejected','fulfilled')),
	CONSTRAINT "requests_urgency_check" CHECK ("requests"."urgency" IN ('low','normal','high','critical'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(20) DEFAULT 'donor' NOT NULL,
	"phone" varchar(30),
	"hospital_name" varchar(150),
	"blood_group" varchar(5) NOT NULL,
	"location" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('donor','hospital','admin')),
	CONSTRAINT "users_blood_group_check" CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-'))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "donations" ADD CONSTRAINT "donations_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_uniq" ON "users" USING btree (lower("email"));
--> statement-breakpoint
INSERT INTO inventory (blood_group, units) VALUES
  ('A+', 0),
  ('A-', 0),
  ('B+', 0),
  ('B-', 0),
  ('O+', 0),
  ('O-', 0),
  ('AB+', 0),
  ('AB-', 0)
ON CONFLICT (blood_group) DO NOTHING;
