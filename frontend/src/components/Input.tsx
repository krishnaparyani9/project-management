import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-brand-300 transition focus:ring"
        {...props}
      />
    </label>
  );
};

export default Input;
