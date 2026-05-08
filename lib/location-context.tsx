import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

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

const DELHI_FALLBACK: LocationData = {
  lat: 28.6139,
  lon: 77.209,
  name: 'New Delhi (default — allow location for accuracy)',
  isManual: false,
};

async function reverseGeocode(lat: number, lon: number): Promise<string | undefined> {
  try {
    if (Platform.OS === 'web') {
      // Use free nominatim reverse geocoding on web
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? '';
      const state = data.address?.state ?? '';
      return city ? `${city}${state ? ', ' + state : ''}` : undefined;
    } else {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      return geo ? `${geo.city ?? ''}${geo.region ? ', ' + geo.region : ''}` : undefined;
    }
  } catch {
    return undefined;
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchGPS() {
    setLoading(true);
    setError(null);

    // Web: use browser Geolocation API directly
    if (Platform.OS === 'web') {
      if (!navigator?.geolocation) {
        setError('Geolocation not supported by this browser.');
        setLocation(DELHI_FALLBACK);
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const name = await reverseGeocode(latitude, longitude);
          setLocation({ lat: latitude, lon: longitude, name, isManual: false });
          setLoading(false);
        },
        (err) => {
          setError('Location access denied. Enable location in your browser for accurate timings.');
          setLocation(DELHI_FALLBACK);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
      return;
    }

    // Native (iOS / Android)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enter manually.');
        setLocation(DELHI_FALLBACK);
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const name = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude, name, isManual: false });
    } catch {
      setError('Could not get location.');
      setLocation(DELHI_FALLBACK);
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
