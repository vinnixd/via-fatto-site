import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-nowrap items-center gap-1 text-sm overflow-x-auto whitespace-nowrap ${className}`}
    >
      <Link
        to="/"
        className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Página inicial"
      >
        <Home size={16} />
      </Link>

      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-1 flex-shrink-0">
          <ChevronRight size={14} className="flex-shrink-0 text-muted-foreground" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-foreground font-medium truncate max-w-[40vw]"
              aria-current="page"
              title={item.label}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
