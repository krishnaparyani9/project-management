import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const styleByVariant: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30",
  secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
  danger: "bg-rose-700 hover:bg-rose-600 text-white"
};

const Button = ({ children, variant = "primary", className, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        "rounded-lg px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        styleByVariant[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
