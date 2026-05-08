import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface LocationData {
  lat: number;
  lon: number;
  name?: string;
  isManual: boolean;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  setManualLocation: (lat: number, lon: number, name?: string) => void;
  refreshGPS: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  loading: true,
  error: null,
  setManualLocation: () => {},
  refreshGPS: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchGPS() {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enter manually.');
        // Fallback: Delhi
        setLocation({ lat: 28.6139, lon: 77.209, name: 'New Delhi (default)', isManual: false });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const name = geo ? `${geo.city ?? ''}${geo.region ? ', ' + geo.region : ''}` : undefined;
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude, name, isManual: false });
    } catch (e) {
      setError('Could not get location.');
      setLocation({ lat: 28.6139, lon: 77.209, name: 'New Delhi (default)', isManual: false });
    } finally {
      setLoading(false);
    }
  }

  function setManualLocation(lat: number, lon: number, name?: string) {
    setLocation({ lat, lon, name, isManual: true });
    setError(null);
    setLoading(false);
  }

  useEffect(() => { fetchGPS(); }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, setManualLocation, refreshGPS: fetchGPS }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
