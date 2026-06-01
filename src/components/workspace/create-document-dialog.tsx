"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocument } from "@/app/dashboard/[workspaceId]/actions/create-document";

interface CreateDocumentDialogProps {
  workspaceId: string;
  parentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDocumentDialog({
  workspaceId,
  parentId,
  open,
  onOpenChange,
}: CreateDocumentDialogProps) {
  const [title, setTitle] = useState("Untitled");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("Untitled");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    await createDocument(
      workspaceId,
      parentId ?? null,
      title.trim() || "Untitled",
    );

    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Page</DialogTitle>
          <DialogDescription>
            Enter a title for your new page. If you leave it empty, it will be
            created as Untitled.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pageTitle" className="text-sm font-medium">
              Page Title
            </label>
            <Input
              id="pageTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
