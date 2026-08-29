import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface NoteEditorDialogProps {
    /** The item being annotated, or null when the editor is closed. */
    title: string | null;
    initialNote: string;
    onClose: () => void;
    onSave: (note: string) => void;
}

/**
 * A focused editor for one cart line's note, rather than a cramped inline box.
 * Remounted per item via `key` so the draft always starts from that note.
 */
export function NoteEditorDialog({
    title,
    initialNote,
    onClose,
    onSave,
}: NoteEditorDialogProps) {
    const [draft, setDraft] = useState(initialNote);

    return (
        <Dialog
            open={title !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-sans">Add a note</DialogTitle>
                    <DialogDescription>
                        {title === null ? '' : `For ${title}`}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSave(draft.trim());
                    }}
                    className="flex flex-col gap-3"
                >
                    <textarea
                        autoFocus
                        rows={3}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="e.g. no onions, extra sauce"
                        className="w-full resize-none rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    />

                    <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        Save note
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
