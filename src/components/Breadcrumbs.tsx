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
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      <Link 
        to="/" 
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label="Página inicial"
      >
        <Home size={16} />
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight size={14} className="mx-1 text-muted-foreground" />
          {item.href ? (
            <Link 
              to={item.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
