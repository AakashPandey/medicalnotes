"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type Note = {
  id: string;
  note: string;
  status: string;
  createdAt: string | Date;
};

type NotesTableProps = {
  notes: Note[];
};

export default function NotesTable({ notes }: NotesTableProps) {
  const router = useRouter();

  return (
    <table className="w-full border rounded-md text-sm">
      <thead className=" text-left ">
        <tr>
          <th className="p-3">ID</th>
          <th className="p-3">Created At</th>
          {/* <th className="p-3">Status</th> */}
          <th className="p-3">Note</th>
        </tr>
      </thead>
      <tbody>
        {notes.map((note) => (
          <tr
            key={note.id}
            className="border-t cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/notes/${note.id}`)}
          >
            <td className="p-3 text-blue-700 font-medium">#{note.id.slice(0, 6)}</td>
            <td className="p-3">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </td>
            {/* <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${note.status === "completed" ? "bg-green-100 text-green-800" :
                  note.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"}
              `}>
                {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
              </span>
            </td> */}
            <td className="p-3 truncate max-w-[300px]">
              {note.note.split("\n")[0].slice(0, 200)}{note.note.length > 200 ? "..." : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
