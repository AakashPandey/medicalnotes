"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { updateNote } from "@/lib/actions/updateNote";

import { NavHeader } from "./header";
import { marked } from "marked";

type Props = {
  note: {
    id: string;
    note: string;
    imageUrl?: string | null;
  };
};

export function EditNoteForm({ note }: Props) {
  const [value, setValue] = useState(note.note);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(() => {
      updateNote({ id: note.id, note: value }).then(() => {
        router.refresh();
      });
    });
  };

  return (
    <div>
      <NavHeader></NavHeader>

      <div className="max-w-7xl mx-auto mt-10 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1 p-4 flex items-center border-none shadow-none">
              {note.imageUrl ? (
                <img
                  src={note.imageUrl}
                  alt="Linked"
                  className="rounded  object-contain  w-full"
                />
              ) : (
                <div className="text-gray-400 text-center w-full mt-[25%]">No image</div>
              )}
            </Card>
            <Card className="flex-1 p-4 flex flex-col border-none shadow-none">
              {isPending ? (
                <Skeleton className="w-full h-[200px]" />
              ) : (
                <div
                  className="prose prose-sm max-w-full  h-screen w-full overflow-auto border rounded bg-gray-100 p-3"
                  style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: note ? marked(value) : '<span class="text-gray-400">Markdown supported</span>' }}
                />
              )}
            </Card>
          </div>
          {/* <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || !value.trim()}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
