"use client";
import Link from "next/link";
import { useState } from "react";
export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-md bg-[#191815] px-4 py-2.5 text-sm font-medium text-[#faf7f2] transition hover:opacity-85 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Header({
  workspace = "proove.now",
  action,
}: {
  workspace?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-[#dfdbd2] px-5 py-4 md:px-10">
      <Link href="/" className="text-xl font-semibold tracking-[-.04em]">
        {workspace}
      </Link>
      <nav className="flex items-center gap-5 text-sm text-[#726d63]">
        <Link href="/dashboard" className="hover:text-[#191815]">
          Dashboard
        </Link>
        <Link
          href="/settings/integrations"
          className="hidden hover:text-[#191815] sm:block"
        >
          Settings
        </Link>
        {action}
      </nav>
    </header>
  );
}
export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        {...props}
        className="rounded-md border border-[#cfc9be] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#191815] focus:ring-2 focus:ring-[#191815]/10"
      />
    </label>
  );
}
export function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        {...props}
        className="min-h-28 rounded-md border border-[#cfc9be] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#191815] focus:ring-2 focus:ring-[#191815]/10"
      />
    </label>
  );
}
export function CopyButton({
  value,
  children = "Copy",
}: {
  value: string;
  children?: React.ReactNode;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="text-sm underline underline-offset-4"
    >
      {done ? "Copied" : children}
    </button>
  );
}
