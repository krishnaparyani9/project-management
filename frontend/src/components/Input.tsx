import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-body)]">{label}</span>
      <input
        id={id}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-1)]/80 px-4 py-3 text-sm text-[var(--text-body)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] hover:border-[color:var(--primary-light)]/50 focus:border-[var(--primary)] focus:ring-4 focus:ring-[color:var(--primary)]/12"
        {...props}
      />
    </label>
  );
};

export default Input;
