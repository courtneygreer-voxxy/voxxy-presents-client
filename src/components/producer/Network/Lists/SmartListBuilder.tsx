import { useState, useEffect } from 'react';
import { Filter, MapPin, Tag, Users } from 'lucide-react';
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

  // Fetch available filter options
  useEffect(() => {
    fetchFilterOptions();
  }, [organizationId]);

  // Update matching count when filters change
  useEffect(() => {
    const hasAnyFilters =
      (filters.categories && filters.categories.length > 0) ||
      (filters.locations && filters.locations.length > 0) ||
      (filters.tags && filters.tags.length > 0);

    if (hasAnyFilters) {
      fetchMatchingCount();
    } else {
      setMatchingCount(null);
    }
  }, [filters, organizationId]);

  const fetchFilterOptions = async () => {
    try {
      // Fetch all contacts to extract unique values
      const response = await vendorContactsApi.getAll(organizationId, {
        per_page: 1000, // Get a large number to extract all unique values
      });

      const contacts = response.vendor_contacts || [];

      // Extract unique categories
      const categories = Array.from(
        new Set(contacts.flatMap((c) => c.categories || []))
      ).sort();

      // Extract unique locations
      const locations = Array.from(
        new Set(contacts.map((c) => c.location).filter(Boolean))
      ).sort() as string[];

      // Extract unique tags
      const tags = Array.from(
        new Set(contacts.flatMap((c) => c.tags || []))
      ).sort();

      setAvailableFilters({
        categories,
        locations,
        tags,
      });
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchMatchingCount = async () => {
    try {
      setLoadingCount(true);

      // Build query params based on filters
      const params: any = { per_page: 1 }; // We only need the count, not the data

      // For categories, we can only filter by one at a time in the current API
      // So we'll fetch all and count client-side for accurate results
      const response = await vendorContactsApi.getAll(organizationId, {
        per_page: 1000,
      });

      let matchingContacts = response.vendor_contacts || [];

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        matchingContacts = matchingContacts.filter((contact) =>
          contact.categories?.some((cat) => filters.categories?.includes(cat))
        );
      }

      // Apply location filter
      if (filters.locations && filters.locations.length > 0) {
        matchingContacts = matchingContacts.filter((contact) =>
          filters.locations?.includes(contact.location || '')
        );
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        matchingContacts = matchingContacts.filter((contact) =>
          contact.tags?.some((tag) => filters.tags?.includes(tag))
        );
      }

      setMatchingCount(matchingContacts.length);
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

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Filter className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Smart List Filters
            </p>
            <p className="text-xs text-white/60">
              Select filters below to automatically include contacts that match ANY of your selected criteria.
              The list will update automatically as your network changes.
            </p>
          </div>
        </div>
      </div>

      {/* Matching Count Preview */}
      {matchingCount !== null && (
        <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-4 py-3 border border-white/10">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-white/60">
            Currently matching:
          </span>
          <span className="font-semibold text-white">
            {loadingCount ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1" />
            ) : (
              `${matchingCount} ${matchingCount === 1 ? 'contact' : 'contacts'}`
            )}
          </span>
        </div>
      )}

      {/* Categories Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400" />
          <label className="text-sm font-medium text-white">
            Categories
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableFilters.categories.length > 0 ? (
            availableFilters.categories.map((category) => {
              const isSelected = filters.categories?.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => handleToggleCategory(category)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    border
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{category}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-white/40 col-span-2">
              No categories found in your network
            </p>
          )}
        </div>
      </div>

      {/* Locations Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <label className="text-sm font-medium text-white">
            Locations
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {availableFilters.locations.length > 0 ? (
            availableFilters.locations.map((location) => {
              const isSelected = filters.locations?.includes(location);
              return (
                <button
                  key={location}
                  onClick={() => handleToggleLocation(location)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    border
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="truncate">{location}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-white/40 col-span-2">
              No locations found in your network
            </p>
          )}
        </div>
      </div>

      {/* Tags Filter */}
      {availableFilters.tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <label className="text-sm font-medium text-white">
              Tags
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {availableFilters.tags.map((tag) => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    border
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="truncate">{tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
