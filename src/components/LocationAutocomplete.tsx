import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSuggestion {
  display_name: string;
  name: string;
  type: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export const LocationAutocomplete = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "City or Remote",
  className,
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Common locations for quick access
  const quickLocations = [
    "Remote",
    "Bangalore, India",
    "Mumbai, India",
    "Delhi, India",
    "Hyderabad, India",
    "Chennai, India",
    "Pune, India",
    "Kolkata, India",
    "New York, USA",
    "San Francisco, USA",
    "London, UK",
  ];

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check if it's "remote" - no need to fetch
    if (query.toLowerCase().includes("remote")) {
      setSuggestions([{ display_name: "Remote", name: "Remote", type: "work_mode" }]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&featuretype=city`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      
      const cityResults: LocationSuggestion[] = data
        .filter((item: any) => 
          item.type === "city" || 
          item.type === "town" || 
          item.type === "village" ||
          item.class === "place"
        )
        .map((item: any) => ({
          display_name: formatLocation(item),
          name: item.name || item.display_name.split(",")[0],
          type: item.type,
        }));

      setSuggestions(cityResults);
    } catch (error) {
      console.error("Location fetch error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (item: any): string => {
    const parts = [];
    if (item.name) parts.push(item.name);
    if (item.address?.state) parts.push(item.address.state);
    if (item.address?.country) parts.push(item.address.country);
    return parts.join(", ") || item.display_name.split(",").slice(0, 3).join(",");
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        e.preventDefault();
      }
      onKeyDown?.(e);
      return;
    }

    const itemsToShow = suggestions.length > 0 ? suggestions : quickLocations.map(loc => ({ display_name: loc, name: loc, type: "quick" }));

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < itemsToShow.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : itemsToShow.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < itemsToShow.length) {
          handleSelect(itemsToShow[highlightedIndex].display_name);
        } else {
          setIsOpen(false);
          onKeyDown?.(e);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        onKeyDown?.(e);
    }
  };

  const showDropdown = isOpen && (suggestions.length > 0 || (value.length === 0 && quickLocations.length > 0));
  const itemsToShow = suggestions.length > 0 
    ? suggestions 
    : quickLocations.map(loc => ({ display_name: loc, name: loc, type: "quick" }));

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={20} />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleInputKeyDown}
        className={cn("pl-10", className)}
      />
      
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" size={16} />
      )}

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.length === 0 && value.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b">
              Popular Locations
            </div>
          )}
          {itemsToShow.map((item, index) => (
            <button
              key={`${item.display_name}-${index}`}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors",
                highlightedIndex === index && "bg-muted"
              )}
              onClick={() => handleSelect(item.display_name)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin size={14} className="text-muted-foreground shrink-0" />
              <span className="truncate">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
