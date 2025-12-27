import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyFilter as PropertyFilterType } from '@/types/property';
import { useAvailableCities } from '@/hooks/useSupabaseData';

interface PropertyFilterProps {
  onFilterChange: (filters: PropertyFilterType) => void;
  onSearch: (query: string) => void;
  initialFilters?: PropertyFilterType;
}

const PropertyFilter = ({ onFilterChange, onSearch, initialFilters }: PropertyFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropertyFilterType>(initialFilters || {});
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: availableCities = [] } = useAvailableCities();

  const propertyTypes = [
    { value: '', label: 'Selecione' },
    { value: 'casa', label: 'Casa' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'rural', label: 'Rural' },
    { value: 'cobertura', label: 'Cobertura' },
    { value: 'flat', label: 'Flat' },
    { value: 'galpao', label: 'Galpão' },
    { value: 'loft', label: 'Loft' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onFilterChange(filters);
    setIsExpanded(false);
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilterType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const handleMinPriceChange = (value: string) => {
    const numValue = value ? Number(value.replace(/\D/g, '')) : undefined;
    handleFilterChange({ minPrice: numValue });
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = value ? Number(value.replace(/\D/g, '')) : undefined;
    handleFilterChange({ maxPrice: numValue });
  };

  const formatCurrency = (value: string | number) => {
    const numbers = String(value).replace(/\D/g, '');
    if (!numbers) return '';
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(numbers));
    return formatted;
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onSearch('');
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            Encontre o seu imóvel ideal
          </h2>
          
          {/* Mobile: Toggle button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            {isExpanded ? <X size={18} /> : <SlidersHorizontal size={18} />}
            <span>{isExpanded ? 'Fechar' : 'Filtros'}</span>
            {hasActiveFilters && !isExpanded && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit}>
          {/* Mobile: Collapsible filters */}
          <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-end">
              {/* Tipo do Imóvel */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2">
                  Tipo do Imóvel
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
                  className="w-full px-3 sm:px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor Mínimo */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2">
                  Valor mínimo
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0"
                  value={filters.minPrice ? formatCurrency(filters.minPrice) : ''}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                />
              </div>

              {/* Valor Máximo */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2">
                  Valor máximo
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0"
                  value={filters.maxPrice ? formatCurrency(filters.maxPrice) : ''}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2">
                  Cidade
                </label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange({ city: e.target.value || undefined })}
                  className="w-full px-3 sm:px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                >
                  <option value="">Todas as cidades</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botões */}
              <div className="flex gap-2 sm:col-span-2 md:col-span-1">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors touch-manipulation flex-shrink-0"
                    aria-label="Limpar filtros"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-neutral-900 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <Search size={18} />
                  <span>Pesquisar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Quick search when collapsed */}
          {!isExpanded && (
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 text-left flex items-center gap-3"
              >
                <Search size={18} />
                <span>Buscar imóveis...</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PropertyFilter;