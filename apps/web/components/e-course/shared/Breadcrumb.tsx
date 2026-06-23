import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[#525252] flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="flex-none text-[#3a3a3a]" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#00d4ff] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#a3a3a3]" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
