"use server";

import { db } from "@/lib/db/db.config";
import { notes, images } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

type CreateNoteInput = {
  note: string;
  imageId: string | null;
};

export async function createNote(input: CreateNoteInput) {
  if (!input.note || input.note.trim() === "") {
    throw new Error("Note content is required");
  }

  const [newNote] = await db
    .insert(notes)
    .values({
      note: input.note,
    })
    .returning({ id: notes.id });

  // If an imageId is provided, link it to the new note
  if (input.imageId) {
    await db
      .update(images)
      .set({ linkedNoteId: newNote.id })
      .where(eq(images.id, input.imageId));
  }

  revalidatePath("/");
  return newNote.id;
}
