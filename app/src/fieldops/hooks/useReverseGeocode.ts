import { useEffect, useState } from 'react';

interface Position {
  latitude: number;
  longitude: number;
}

// Reverse geocoding via l'API REST Google Maps Geocoding (pas besoin du SDK JS charge).
// Necessite VITE_GOOGLE_MAPS_API_KEY avec l'API Geocoding activee.
export function useReverseGeocode(position: Position | null) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!position) return;
    setIsLoading(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.latitude},${position.longitude}&key=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setAddress(data.results?.[0]?.formatted_address ?? null))
      .catch(() => setAddress(null))
      .finally(() => setIsLoading(false));
    // On ne redeclenche que si la position change reellement, pas a chaque re-render
    // (un nouvel objet {latitude, longitude} identique en valeur serait sinon recreee).
  }, [position?.latitude, position?.longitude]);

  return { address, isLoading };
}
