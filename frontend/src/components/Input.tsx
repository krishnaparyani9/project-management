import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--text-body)]">{label}</span>
      <input
        id={id}
        className="w-full rounded-lg border border-slate-700 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
        {...props}
      />
    </label>
  );
};

export default Input;
