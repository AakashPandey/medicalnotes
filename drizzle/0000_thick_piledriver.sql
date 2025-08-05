CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blob_path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"linked_note_id" uuid DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_linked_note_id_notes_id_fk" FOREIGN KEY ("linked_note_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;