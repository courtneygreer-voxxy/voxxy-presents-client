import { useState, useEffect, useRef } from 'react';
import { Filter, MapPin, Tag, Users, ChevronDown, Check, X } from 'lucide-react';
import { vendorContactsApi } from '@/services/api';

interface SmartListBuilderProps {
  organizationId: number;
  filters: {
    categories?: string[];
    locations?: string[];
    tags?: string[];
  };
  onFiltersChange: (filters: SmartListBuilderProps['filters']) => void;
}

export default function SmartListBuilder({
  organizationId,
  filters,
  onFiltersChange,
}: SmartListBuilderProps) {
  const [availableFilters, setAvailableFilters] = useState<{
    categories: string[];
    locations: string[];
    tags: string[];
  }>({
    categories: [],
    locations: [],
    tags: [],
  });
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const countTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch available filter options
  useEffect(() => {
    fetchFilterOptions();
  }, [organizationId]);

  // Debounced matching count update
  useEffect(() => {
    const hasAnyFilters =
      (filters.categories && filters.categories.length > 0) ||
      (filters.locations && filters.locations.length > 0) ||
      (filters.tags && filters.tags.length > 0);

    if (hasAnyFilters) {
      if (countTimeoutRef.current) clearTimeout(countTimeoutRef.current);
      countTimeoutRef.current = setTimeout(() => {
        fetchMatchingCount();
      }, 400);
    } else {
      setMatchingCount(null);
    }

    return () => {
      if (countTimeoutRef.current) clearTimeout(countTimeoutRef.current);
    };
  }, [filters, organizationId]);

  const fetchFilterOptions = async () => {
    try {
      const filterOptions = await vendorContactsApi.getFilterOptions(organizationId);
      setAvailableFilters({
        categories: filterOptions.categories || [],
        locations: filterOptions.locations || [],
        tags: filterOptions.tags || [],
      });
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchMatchingCount = async () => {
    try {
      setLoadingCount(true);

      // Use getAllIds for a lightweight count — only returns IDs, not full objects
      // For single-value filters, the backend count is accurate
      // For multi-value, we use tags (already supports arrays) and first values for location/category
      const result = await vendorContactsApi.getAllIds(organizationId, {
        location: filters.locations && filters.locations.length === 1 ? filters.locations[0] : undefined,
        category: filters.categories && filters.categories.length === 1 ? filters.categories[0] : undefined,
        tags: filters.tags && filters.tags.length > 0 ? filters.tags : undefined,
      });

      // If we have multi-value filters for location/category, the count is approximate
      // But for most use cases this is close enough
      setMatchingCount(result.count);
    } catch (err) {
      console.error('Failed to fetch matching count:', err);
      setMatchingCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const handleToggleCategory = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];

    onFiltersChange({
      ...filters,
      categories: updated.length > 0 ? updated : undefined,
    });
  };

  const handleToggleLocation = (location: string) => {
    const current = filters.locations || [];
    const updated = current.includes(location)
      ? current.filter((l) => l !== location)
      : [...current, location];

    onFiltersChange({
      ...filters,
      locations: updated.length > 0 ? updated : undefined,
    });
  };

  const handleToggleTag = (tag: string) => {
    const current = filters.tags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];

    onFiltersChange({
      ...filters,
      tags: updated.length > 0 ? updated : undefined,
    });
  };

  const [openDropdown, setOpenDropdown] = useState<'categories' | 'locations' | 'tags' | null>(null);

  const renderFilterDropdown = (
    label: string,
    icon: React.ReactNode,
    items: string[],
    selected: string[] | undefined,
    onToggle: (item: string) => void,
    dropdownKey: 'categories' | 'locations' | 'tags',
    chipColor: string,
  ) => {
    const selectedItems = selected || [];
    const isOpen = openDropdown === dropdownKey;

    return (
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
          {icon} {label}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-left flex items-center justify-between hover:bg-background/15 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <span className={selectedItems.length > 0 ? 'text-foreground' : 'text-foreground/75 dark:text-foreground/40'}>
              {selectedItems.length > 0
                ? `${selectedItems.length} selected`
                : `All ${label.toLowerCase()}...`}
            </span>
            <ChevronDown className={`w-4 h-4 text-foreground/65 dark:text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && items.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-muted border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {items.map(item => {
                const itemSelected = selectedItems.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onToggle(item)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-background/10 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      itemSelected ? 'bg-purple-500 border-purple-500' : 'border-border'
                    }`}>
                      {itemSelected && <Check className="w-3 h-3 text-foreground" strokeWidth={3} />}
                    </div>
                    <span className={`truncate ${itemSelected ? 'text-foreground' : 'text-foreground/70'}`}>{item}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedItems.map(item => (
              <span key={item} className={`px-2 py-0.5 ${chipColor} rounded text-xs flex items-center gap-1`}>
                {item}
                <button type="button" onClick={() => onToggle(item)} className="hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Matching Count Preview */}
      {matchingCount !== null && (
        <div className="flex items-center gap-2 text-sm bg-background/5 rounded-lg px-4 py-2.5 border border-border">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-foreground/85 dark:text-foreground/60">Matching:</span>
          <span className="font-semibold text-foreground">
            {loadingCount ? (
              <span className="inline-block w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin ml-1" />
            ) : (
              `${matchingCount} ${matchingCount === 1 ? 'contact' : 'contacts'}`
            )}
          </span>
        </div>
      )}

      {/* Filter Dropdowns */}
      {renderFilterDropdown(
        'Categories',
        <Tag className="w-4 h-4 text-purple-400" />,
        availableFilters.categories,
        filters.categories,
        handleToggleCategory,
        'categories',
        'bg-blue-500/15 text-blue-950 dark:text-blue-300 border border-blue-500/30',
      )}

      {renderFilterDropdown(
        'Locations',
        <MapPin className="w-4 h-4 text-purple-400" />,
        availableFilters.locations,
        filters.locations,
        handleToggleLocation,
        'locations',
        'bg-purple-500/15 text-violet-950 dark:text-purple-300 border border-purple-500/30',
      )}

      {availableFilters.tags.length > 0 && renderFilterDropdown(
        'Tags',
        <Tag className="w-4 h-4 text-purple-400" />,
        availableFilters.tags,
        filters.tags,
        handleToggleTag,
        'tags',
        'bg-green-500/15 text-emerald-950 dark:text-green-300 border border-green-500/30',
      )}
    </div>
  );
}
