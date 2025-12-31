import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import googlePlacesService, { PlacePrediction, LocationData } from '@/services/googlePlacesService';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (locationData: LocationData) => void;
  error?: string;
  placeholder?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  error,
  placeholder = 'Search for a city...',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search for cities
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if input is too short
    if (!value || value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Search for cities and regions (not establishments)
        const results = await googlePlacesService.searchPlaces(value, '(cities)');
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('City search failed:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = async (place: PlacePrediction) => {
    setIsLoading(true);
    setIsOpen(false);

    try {
      // For cities, we may not need full details, but fetch for consistency
      const placeDetails = await googlePlacesService.getPlaceDetails(place.place_id);

      // Parse into standardized format
      const locationData = googlePlacesService.parseLocationData(place, placeDetails);

      // Create city display
      const cityDisplay = googlePlacesService.getCityDisplay(locationData);

      // Update location field
      onChange(cityDisplay || place.structured_formatting.main_text);

      // Notify parent if callback provided
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      // Still update the location even if details fetch fails
      onChange(place.structured_formatting.main_text);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-10 rounded-lg bg-white/5 border ${
            error ? 'border-red-500' : 'border-white/10'
          } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
        />

        {/* Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 transition-colors border-b border-white/10 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-purple-500/20 text-white'
                  : 'text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-white/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {place.structured_formatting.main_text}
                  </div>
                  {place.structured_formatting.secondary_text && (
                    <div className="text-sm text-white/60 truncate">
                      {place.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isOpen && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl p-4 text-center text-white/60">
          No cities found. Try a different search.
        </div>
      )}
    </div>
  );
}
