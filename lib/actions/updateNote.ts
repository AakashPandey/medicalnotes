"use server";

import { db } from "@/lib/db/db.config";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type UpdateNoteInput = {
  id: string;
  note: string;
};

export async function updateNote(input: UpdateNoteInput) {
  if (!input.note || input.note.trim() === "") {
    throw new Error("Note content is required");
  }

  await db
    .update(notes)
    .set({ note: input.note.trim() })
    .where(eq(notes.id, input.id));

  revalidatePath("/");
}
