import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const styleByVariant: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white shadow-card",
  secondary: "bg-[var(--bg-1)] hover:bg-[var(--bg-2)] text-[var(--text-strong)] border border-[var(--border)] shadow-soft",
  danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-soft"
};

const Button = ({ children, variant = "primary", className, type = "button", ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2",
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
