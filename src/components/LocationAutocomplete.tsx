import React, { useState, useEffect } from 'react';
import tzlookup from 'tz-lookup';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: any;
}

export function LocationAutocomplete({ onSelect }: { onSelect: (data: { ciudad: string, latitud: number, longitud: number, timezone: string }) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchLocations, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (r: NominatimResult) => {
    const latitud = parseFloat(r.lat);
    const longitud = parseFloat(r.lon);
    let timezone = "UTC";
    try {
      timezone = tzlookup(latitud, longitud);
    } catch(e) {}
    
    onSelect({
      ciudad: r.display_name,
      latitud,
      longitud,
      timezone
    });
    setQuery(r.display_name);
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribe tu ciudad o región..."
        className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-full py-4 pl-6 pr-6 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
      />
      {results.length > 0 && (
        <ul className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#EAE2D6] rounded-2xl shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
          {results.map((r) => (
            <li
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="px-4 py-3 hover:bg-[#F9F7F1] cursor-pointer text-sm text-stone-700 border-b border-[#EAE2D6] last:border-0"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
