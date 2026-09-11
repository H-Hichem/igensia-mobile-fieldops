import { useCallback } from 'react';

// Necessite @capacitor/geolocation (npm i @capacitor/geolocation) et la permission
// de localisation declaree sur iOS/Android.
export function useCurrentPosition() {
  const getCurrentPosition = useCallback(async () => {
    // TODO récupérer la position actuelle à l'aide de @capacitor/geolocation :
    const currentPosition = { longitude: 4.8095159, latitude: 45.7648829 };
    return currentPosition;
  }, []);

  return { getCurrentPosition };
}
