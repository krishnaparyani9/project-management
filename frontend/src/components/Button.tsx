import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const styleByVariant: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200",
  secondary: "bg-white/10 hover:bg-white/20 text-slate-200 border border-slate-600",
  danger: "bg-rose-600 hover:bg-rose-500 text-white"
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
