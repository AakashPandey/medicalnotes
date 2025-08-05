import { EditNoteForm } from "@/components/note/editNoteForm";
import { db } from "@/lib/db/db.config";
import { notes, images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NotePage(props: Props) {
  const { params } = props;
  const awaitedParams = await params;
  const noteId = awaitedParams.id;
  
  const noteData = await db
    .select({
      id: notes.id,
      note: notes.note,
      imageUrl: images.blobPath,
    })
    .from(notes)
    .leftJoin(images, eq(images.linkedNoteId, notes.id))
    .where(eq(notes.id, noteId))
    .then(res => res[0]);
    
  if (!noteData) {
    return <div className="text-center text-gray-500">Note not found</div>;
  }
  
  return <EditNoteForm note={noteData} />;
}