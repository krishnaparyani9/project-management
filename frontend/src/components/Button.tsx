import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const styleByVariant: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white shadow-card hover:shadow-lg hover:-translate-y-0.5",
  secondary: "bg-[var(--bg-1)] hover:bg-[var(--bg-2)] text-[var(--text-strong)] border border-[var(--border)] shadow-soft hover:-translate-y-0.5",
  danger: "bg-[var(--danger)] hover:bg-[var(--danger)]/85 text-white shadow-soft hover:-translate-y-0.5"
};

const Button = ({ children, variant = "primary", className, type = "button", ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-0)]",
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
