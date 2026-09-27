import { useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

// Necessite @capacitor/geolocation (npm i @capacitor/geolocation) et la permission
// de localisation declaree sur iOS/Android.
export function useCurrentPosition() {
  const getCurrentPosition = useCallback(async () => {
    // TODO récupérer la position actuelle à l'aide de @capacitor/geolocation :
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    const currentPosition = {
      longitude: coordinates.coords.longitude,
      latitude: coordinates.coords.latitude,
    };

    return currentPosition;
  }, []);

  return { getCurrentPosition };
}