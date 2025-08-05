import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  note: text("note").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  blobPath: text("blob_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
   linkedNoteId: uuid("linked_note_id")
    .references(() => notes.id, { onDelete: "set null" })
    .default(sql`null`),
});

export const notesRelations = relations(notes, ({ many }) => ({
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  note: one(notes, {
    fields: [images.linkedNoteId],
    references: [notes.id],
  }),
}));
