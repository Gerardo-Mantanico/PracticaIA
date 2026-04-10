import Link from "next/link";
import React from "react";

type StripedCardProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  stripe: string;
  href?: string;
  actionText?: string;
  compact?: boolean;
  children: React.ReactNode;
};

export default function StripedCard({
  title,
  icon: Icon,
  tone,
  stripe,
  href,
  actionText,
  compact = false,
  children,
}: Readonly<StripedCardProps>) {
  const content = (
    <>
      <div className={`absolute inset-y-0 left-0 w-1.5 ${stripe}`} />
      <div className={`flex ${compact ? "min-h-16" : "min-h-32"} flex-col justify-between`}>
        <div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">{children}</div>
        </div>
        {actionText && (
          <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700 dark:group-hover:text-brand-300">
            {actionText} →
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 ${compact ? "p-3 pl-4" : "p-5 pl-6"} transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/3 dark:hover:border-brand-700`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 ${compact ? "p-3 pl-4" : "p-5 pl-6"} dark:border-gray-800 dark:bg-white/3`}>
      {content}
    </div>
  );
}
