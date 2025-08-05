import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import React from "react";

export function NavHeader() {
  return (
    <header className="flex items-center gap-x-4 px-2 py-4 border-b bg-white mb-6">
      <Link href="/" >
        <Button variant="link" className="font-semibold cursor-pointer">
          <ChevronLeft className="mr-2" />
          <span className="text-lg font-bold tracking-tight">Medical Notes</span>
        </Button>
      </Link>
    </header>
  );
}