import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export const Modal = ({ open, onClose, title, children }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingProgrammatically = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      closingProgrammatically.current = true;
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        // Only call onClose for user-initiated closes (ESC key).
        // Skip when we called dialog.close() programmatically to avoid double-toggle.
        if (closingProgrammatically.current) {
          closingProgrammatically.current = false;
          return;
        }
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="backdrop:bg-black/50 bg-detail-bg p-0 m-auto max-w-[min(640px,90vw)] max-h-[85vh] w-full rounded-lg overflow-hidden flex flex-col [&:not([open])]:hidden"
    >
      <div className="flex items-center justify-between p-4 pb-2 shrink-0">
        {title ? (
          <h2 className="text-sm font-semibold text-text-dim m-0">{title}</h2>
        ) : (
          <span />
        )}
        <button
          onClick={onClose}
          className="bg-none border-none text-xl text-text-faint cursor-pointer px-1 leading-none hover:text-error"
        >
          &times;
        </button>
      </div>
      <div className="overflow-y-auto px-4 pb-4 flex-1 min-h-0">
        {children}
      </div>
    </dialog>
  );
};
