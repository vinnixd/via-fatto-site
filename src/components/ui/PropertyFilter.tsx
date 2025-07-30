import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PropertyFilter as PropertyFilterType } from '@/types/property';

interface PropertyFilterProps {
  onFilterChange: (filters: PropertyFilterType) => void;
  onSearch: (query: string) => void;
}

const PropertyFilter = ({ onFilterChange, onSearch }: PropertyFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropertyFilterType>({});

  const propertyTypes = [
    { value: '', label: 'Todos os tipos' },
    { value: 'casa', label: 'Casa' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'rural', label: 'Rural' },
  ];

  const cities = [
    { value: '', label: 'Todas as cidades' },
    { value: 'São Paulo', label: 'São Paulo' },
    { value: 'Barueri', label: 'Barueri' },
    { value: 'Osasco', label: 'Osasco' },
    { value: 'Guarulhos', label: 'Guarulhos' },
  ];

  const priceRanges = [
    { min: undefined, max: undefined, label: 'Qualquer preço' },
    { min: 0, max: 500000, label: 'Até R$ 500.000' },
    { min: 500000, max: 1000000, label: 'R$ 500.000 - R$ 1.000.000' },
    { min: 1000000, max: 2000000, label: 'R$ 1.000.000 - R$ 2.000.000' },
    { min: 2000000, max: undefined, label: 'Acima de R$ 2.000.000' },
  ];

  const bedroomOptions = [
    { value: undefined, label: 'Qualquer quantidade' },
    { value: 1, label: '1+ quarto' },
    { value: 2, label: '2+ quartos' },
    { value: 3, label: '3+ quartos' },
    { value: 4, label: '4+ quartos' },
    { value: 5, label: '5+ quartos' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilterType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setSearchQuery('');
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white border border-border rounded-xl shadow-md p-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar por localização, características..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-1.5 text-sm"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter size={18} />
          <span>Filtros Avançados</span>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-destructive hover:text-red-700 transition-colors text-sm"
          >
            <X size={16} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
          className="input-field"
        >
          {propertyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={filters.city || ''}
          onChange={(e) => handleFilterChange({ city: e.target.value || undefined })}
          className="input-field"
        >
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>

        <select
          value={filters.bedrooms || ''}
          onChange={(e) => handleFilterChange({ bedrooms: e.target.value ? Number(e.target.value) : undefined })}
          className="input-field"
        >
          {bedroomOptions.map((option) => (
            <option key={option.value} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const selectedRange = priceRanges[Number(e.target.value)];
            handleFilterChange({
              minPrice: selectedRange.min,
              maxPrice: selectedRange.max
            });
          }}
          className="input-field"
        >
          {priceRanges.map((range, index) => (
            <option key={index} value={index}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preço Mínimo
              </label>
              <input
                type="number"
                placeholder="R$ 0"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preço Máximo
              </label>
              <input
                type="number"
                placeholder="R$ 999.999.999"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Área Mínima (m²)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minArea || ''}
                onChange={(e) => handleFilterChange({ minArea: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Área Máxima (m²)
              </label>
              <input
                type="number"
                placeholder="999999"
                value={filters.maxArea || ''}
                onChange={(e) => handleFilterChange({ maxArea: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Suítes
              </label>
              <select
                value={filters.suites || ''}
                onChange={(e) => handleFilterChange({ suites: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ suíte</option>
                <option value="2">2+ suítes</option>
                <option value="3">3+ suítes</option>
                <option value="4">4+ suítes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vagas de Garagem
              </label>
              <select
                value={filters.garages || ''}
                onChange={(e) => handleFilterChange({ garages: e.target.value ? Number(e.target.value) : undefined })}
                className="input-field w-full"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ vaga</option>
                <option value="2">2+ vagas</option>
                <option value="3">3+ vagas</option>
                <option value="4">4+ vagas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              const getFilterLabel = () => {
                switch (key) {
                  case 'type':
                    return `Tipo: ${propertyTypes.find(t => t.value === value)?.label || value}`;
                  case 'city':
                    return `Cidade: ${value}`;
                  case 'bedrooms':
                    return `${value}+ quartos`;
                  case 'suites':
                    return `${value}+ suítes`;
                  case 'garages':
                    return `${value}+ vagas`;
                  case 'minPrice':
                    return `Min: R$ ${Number(value).toLocaleString('pt-BR')}`;
                  case 'maxPrice':
                    return `Max: R$ ${Number(value).toLocaleString('pt-BR')}`;
                  case 'minArea':
                    return `Min: ${value}m²`;
                  case 'maxArea':
                    return `Max: ${value}m²`;
                  default:
                    return `${key}: ${value}`;
                }
              };

              return (
                <span
                  key={key}
                  className="badge-feature flex items-center space-x-1"
                >
                  <span>{getFilterLabel()}</span>
                  <button
                    onClick={() => handleFilterChange({ [key]: undefined })}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilter;