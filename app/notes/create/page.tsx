"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/actions/uploadImage";
import { createNote } from "@/lib/actions/createNote";
import { imageScanAI } from "@/lib/actions/imageScan";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NavHeader } from "@/components/note/header";
import { Eye, Pencil } from "lucide-react";
import React from "react";
import { marked } from "marked";

export default function CreateNotePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImage, setUploadedImage] = useState<null | { id: string; blobPath: string }>(null);
  const [showPreview, setShowPreview] = useState(true);

  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    // Clean up old preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const localPreview = URL.createObjectURL(selectedFile);
    setPreviewUrl(localPreview);
    setFile(selectedFile);
    setNote("⏳ Scanning image, this could take a while...");
    setUploadedImage(null);

    try {
      const uploaded = await uploadImage(selectedFile);
      setUploadedImage(uploaded);

      const scanResult = await imageScanAI({ imageUrl: uploaded.blobPath });
      setNote(scanResult || "");
    } catch (err) {
      console.error("Image upload or scan failed", err);
      alert("Image upload or scan failed.");
      setNote("");
    }
  };

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setLoading(true);

    const imageId = uploadedImage?.id ?? null;

    startTransition(() => {
      createNote({ note, imageId }).then(() => {
        setNote("");
        setFile(null);
        setUploadedImage(null);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);

        setLoading(false);
        router.push("/");
      });
    });
  };

  return (
    <div>
      {/* Header */}
      <NavHeader></NavHeader>
      {/* Main Content */}
      <div className="flex flex-col gap-4 p-6">
        {/* File Upload & Note Textarea Side-by-Side */}
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Image Upload Card */}
          <Card className="flex-1 p-4 flex justify-start items-center border-none shadow-none">
            <div className="flex flex-col items-center">
              {!previewUrl ? (
                <label className="cursor-pointer text-center text-blue-700 mt-[25%]">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div>
                    <svg className="mx-auto mb-2" width="36" height="36" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7z" />
                      <path d="M5 18h14v2H5z" />
                    </svg>
                    <p>Click to Upload and Auto Generate Note</p>
                    <p className="text-sm text-gray-500">Image files only</p>
                  </div>
                </label>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 rounded shadow object-contain border"
                />
              )}
            </div>
          </Card>
          {/* Notes Textarea Card */}
          <Card className="flex-1 p-4 border-none shadow-none relative">
            <div className="flex justify-end mb-1">
              <Button
                variant="outline"
                
                aria-label={showPreview ? "Switch to edit" : "Show markdown preview"}
                onClick={() => setShowPreview((v) => !v)}
                className="text-gray-600 hover:text-blue-700"
              >
                {showPreview ? <div className="flex flex-row gap-2 p-4"><Pencil size={20} /> <span>Write Note</span></div>: <div className="flex flex-row gap-2 p-4"><Eye size={20} /> <span>Show Preview</span></div>}
              </Button>
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-full h-6 rounded" />
                <Skeleton className="w-full h-full rounded" />
              </div>
            ) : showPreview ? (
              <div
                className="prose prose-sm max-w-full min-h-[200px] h-[60vh] w-full overflow-auto border rounded bg-gray-100 p-3"
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: note ? marked(note) : '<span class="text-gray-400">Markdown supported</span>' }}
              />
            ) : (
              <Textarea
                placeholder="Write a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-[70vh] w-full"
              />
            )}
          </Card>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || loading || !note.trim()}>
            {isPending || loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
