import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({ open, title, children, onClose }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button className="text-slate-500 hover:text-slate-900" onClick={onClose}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
