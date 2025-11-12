CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notes" text,
	"diagnosis" text,
	"prescription" text,
	"referral" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"appointment_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;