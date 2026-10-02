import { useEffect } from 'react';
import Icon from './Icon';

const Modal = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className={`relative bg-surface-container-lowest rounded-xl shadow-card-hover w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-space-lg py-space-md">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-space-sm px-space-lg py-space-md border-t border-outline-variant">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
