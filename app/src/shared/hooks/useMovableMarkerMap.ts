import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap } from '@capacitor/google-maps';

interface Position {
  latitude: number;
  longitude: number;
}

interface UseMovableMarkerMapOptions {
  // null tant que la position initiale (ex. GPS) n'est pas encore connue - la
  // carte n'est creee qu'une fois qu'elle l'est.
  initialPosition: Position | null;
  zoom?: number;
}

// Meme pattern que SessionMap.tsx (API imperative @capacitor/google-maps, id
// genere a chaque execution de l'effet via crypto.randomUUID() pour eviter la
// collision entre les deux montages de React.StrictMode en dev), factorise
// ici car utilise par deux ecrans avec le meme besoin : un marqueur unique
// qu'on peut deplacer en tapant sur la carte ou via un bouton "recentrer"
// (position.setPosition).
export function useMovableMarkerMap({ initialPosition, zoom = 16 }: UseMovableMarkerMapOptions) {
  const mapElementRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerIdRef = useRef<string | null>(null);
  const [position, setPositionState] = useState<Position | null>(initialPosition);

  // Deplace le marqueur existant (ou le pose au centre s'il n'existe pas
  // encore) et recentre la camera. Utilise a la fois par le clic sur la carte
  // et par le bouton "recentrer sur la position actuelle".
  const moveMarkerTo = useCallback(async (next: Position) => {
    const map = mapRef.current;
    if (!map) return;
    await map.setCamera({ coordinate: { lat: next.latitude, lng: next.longitude } });
    if (markerIdRef.current) await map.removeMarker(markerIdRef.current);
    markerIdRef.current = await map.addMarker({
      coordinate: { lat: next.latitude, lng: next.longitude },
    });
  }, []);

  // Cree la carte + le marqueur initial des que initialPosition est connue -
  // une seule fois (hasCreatedRef), pas a chaque fois que initialPosition
  // changerait de reference.
  useEffect(() => {
    const createMap = async () => {
      if (!initialPosition || !mapElementRef.current) return;
      const createdMap = await GoogleMap.create({
        id: `movable-marker-map-${crypto.randomUUID()}`,
        element: mapElementRef.current!,
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        config: {
          center: { lat: initialPosition.latitude, lng: initialPosition.longitude },
          zoom,
        },
      });

      markerIdRef.current = await createdMap.addMarker({
        coordinate: { lat: initialPosition.latitude, lng: initialPosition.longitude },
      });

      await createdMap.setOnMapClickListener((event) => {
        // ATTENTION : meme reserve que dans SessionMap.tsx sur la
        // documentation des callbacks du plugin - on caste plutot que de se
        // fier strictement au type fourni pour latitude/longitude.
        const { latitude, longitude } = event as unknown as {
          latitude?: number;
          longitude?: number;
        };
        if (latitude == null || longitude == null) return;
        const next = { latitude, longitude };
        setPositionState(next);
        moveMarkerTo(next);
      });

      mapRef.current = createdMap;
      return () => {
        createdMap?.destroy();
        mapRef.current = null;
      };
    };
    createMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapElementRef, initialPosition]);

  // Expose pour le bouton "recentrer" : deplace le marqueur et met a jour
  // l'etat, sans attendre le prochain clic sur la carte.
  const setPosition = useCallback(
    (next: Position) => {
      setPositionState(next);
      moveMarkerTo(next);
    },
    [moveMarkerTo]
  );

  return { mapElementRef, position, setPosition };
}
