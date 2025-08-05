import { notes } from "@/lib/db/schema";
import Link from "next/link";
import { db } from "@/lib/db/db.config";
import { Button } from "@/components/ui/button";
import NotesTable from "@/components/note/NotesTable";
import { desc } from "drizzle-orm";

type Note = {
  id: string;
  note: string;
  status: string;
  createdAt: string | Date;
};

export default async function NotesPage() {
  let allNotes: Note[] = [];
  let error: unknown = null;
  try {
    allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt));
  } catch (err) {
    error = err;
    console.error("DB error:", err);
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white mb-6">
        
        <span className="text-lg font-bold tracking-tight">Medical Notes</span>
        <Link href="/notes/create">
          <Button variant="default" className="font-semibold">
            Create Note
          </Button>
        </Link>
      </header>

      <div className="p-6">
        {error ? (
          <p className="text-red-500">Failed to load notes. Please try again later.</p>
        ) : (
          <NotesTable notes={allNotes} />
        )}
      </div>
    </div>
  );
}
