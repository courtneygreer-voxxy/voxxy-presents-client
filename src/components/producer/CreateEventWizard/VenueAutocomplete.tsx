import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import googlePlacesService, { PlacePrediction, LocationData } from '@/services/googlePlacesService';

interface VenueAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (locationData: LocationData, venueName: string) => void;
  error?: string;
  placeholder?: string;
}

export default function VenueAutocomplete({
  value,
  onChange,
  onLocationSelect,
  error,
  placeholder = 'Search for a venue...',
}: VenueAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
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
        const results = await googlePlacesService.searchPlaces(value, 'establishment');
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search failed:', error);
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
      // Get detailed place info including coordinates
      const placeDetails = await googlePlacesService.getPlaceDetails(place.place_id);

      // Parse into standardized format
      const locationData = googlePlacesService.parseLocationData(place, placeDetails);

      // Notify parent component of location data AND venue name for atomic update
      onLocationSelect(locationData, place.structured_formatting.main_text);
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      // Still update the venue name even if details fetch fails
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
          className={`w-full px-3 py-2 pl-8 text-sm rounded-lg bg-background/10 border ${
            error ? 'border-red-500' : 'border-border'
          } text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
        />

        {/* Icon */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/60">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-muted/95 backdrop-blur-sm border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-3 py-2 transition-colors border-b border-border last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-purple-500/20 text-foreground'
                  : 'text-foreground/90 hover:bg-background/5'
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-foreground/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {place.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-foreground/60 truncate">
                    {place.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isOpen && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1.5 bg-muted/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 text-center text-foreground/60 text-sm">
          No venues found. Try a different search.
        </div>
      )}
    </div>
  );
}
