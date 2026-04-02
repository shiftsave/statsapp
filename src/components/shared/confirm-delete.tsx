"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDelete({
  action,
  title,
  description,
  hiddenFields,
}: {
  action: (formData: FormData) => void;
  title: string;
  description: string;
  hiddenFields: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="size-12 rounded-[1rem] border-white/10 text-white hover:bg-white/10"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
        size="icon"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Delete</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-[#bdd0e7]">{description}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-2">
            <DialogClose
              render={<Button className="min-h-12 rounded-[1rem] uppercase tracking-[0.14em]" variant="outline" />}
            >
              Cancel
            </DialogClose>
            <form action={action}>
              {Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))}
              <Button
                className="min-h-12 rounded-[1rem] bg-red-600 uppercase tracking-[0.14em] text-white hover:bg-red-700"
                onClick={() => setOpen(false)}
                type="submit"
              >
                Delete
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
