import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

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
      className={`flex items-center gap-2 text-sm leading-none whitespace-nowrap overflow-hidden min-w-0 ${className}`}
    >
      <Link
        to="/"
        className="inline-flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors leading-none"
        aria-label="Página inicial"
      >
        <Home className="block h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center min-w-0 leading-none">
          <span
            className="inline-flex items-center justify-center flex-shrink-0 text-muted-foreground leading-none"
            aria-hidden="true"
          >
            ›
          </span>
          {item.href ? (
            <Link
              to={item.href}
              className="inline-flex items-center min-w-0 truncate text-muted-foreground hover:text-primary transition-colors leading-none"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="inline-flex items-center min-w-0 truncate text-foreground font-medium leading-none"
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
