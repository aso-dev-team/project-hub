"use client";

import { useState } from "react";

import { RichTextEditor } from "@/components/rich-text/editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface IssueComposerDialogProps {
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { descriptionHtml: string; title: string }) => void;
  open: boolean;
  projectName: string;
}

const INITIAL_DESCRIPTION_HTML = "<p>新しい issue の説明を入力します。</p>";

export function IssueComposerDialog(props: IssueComposerDialogProps): JSX.Element {
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      {props.open ? (
        <DialogContent className="max-w-2xl">
          <IssueComposerForm
            isSubmitting={props.isSubmitting}
            onOpenChange={props.onOpenChange}
            onSubmit={props.onSubmit}
            projectName={props.projectName}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function IssueComposerForm(props: Omit<IssueComposerDialogProps, "open">): JSX.Element {
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState(INITIAL_DESCRIPTION_HTML);
  const canSubmit = title.trim().length > 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Quick add issue</DialogTitle>
        <DialogDescription>
          {props.projectName} に issue を追加します。<kbd className="rounded bg-secondary px-1 py-0.5">C</kbd> か
          <kbd className="ml-1 rounded bg-secondary px-1 py-0.5">⌘/Ctrl + K</kbd> でも開けます。
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Title
          <Input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Shift + shipping notifications by one day"
            value={title}
          />
        </label>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Description</p>
          <RichTextEditor onChange={setDescriptionHtml} value={descriptionHtml} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => props.onOpenChange(false)} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || props.isSubmitting}
            onClick={() =>
              props.onSubmit({
                descriptionHtml,
                title,
              })
            }
            type="button"
          >
            Create issue
          </Button>
        </div>
      </div>
    </>
  );
}
