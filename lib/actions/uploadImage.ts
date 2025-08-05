"use server";

import { db } from "@/lib/db/db.config";
import { images } from "@/lib/db/schema";
import { del, put } from "@vercel/blob";
import { eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File) {
  // 1. Delete orphaned images (unlinked)
  const orphanImages = await db.select().from(images).where(isNull(images.linkedNoteId));

  for (const orphan of orphanImages) {
    try {
      await del(orphan.blobPath); // delete from Vercel Blob
    } catch (err) {
      console.warn(`Failed to delete blob: ${orphan.blobPath}`, err);
    }

    await db.delete(images).where(eq(images.id, orphan.id));
  }

  // Generate a unique filename with extension
  const originalName = file.name;
  const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
  const uniqueName = uuidv4() + ext;

  // 2. Upload new image to Vercel Blob
  const blob = await put(uniqueName, file, {
    access: "public", // or "private" if needed
  });

  // 3. Insert image record in DB
  const result = await db
    .insert(images)
    .values({
      blobPath: blob.url,
      linkedNoteId: null,
    })
    .returning({ id: images.id, blobPath: images.blobPath });

  return result[0];
}
