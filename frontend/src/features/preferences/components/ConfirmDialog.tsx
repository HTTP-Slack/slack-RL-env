import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
