// Geocoding utility functions for location-based features using Google Maps API

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id?: string;
  types?: string[];
}

export interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Get coordinates from an address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found. Using fallback geocoding.');
      return fallbackGeocodeAddress(address);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        types: result.types,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn('No results found for address:', address);
      return null;
    } else {
      throw new Error(`Geocoding API error: ${data.status}`);
    }
  } catch (error) {
    console.error('Google Maps geocoding error:', error);
    // Fallback to mock data if API fails
    return fallbackGeocodeAddress(address);
  }
}

/**
 * Fallback geocoding with mock data for major Indian cities
 */
function fallbackGeocodeAddress(address: string): GeocodingResult | null {
  const mockCoordinates: { [key: string]: GeocodingResult } = {
    'delhi': { latitude: 28.6139, longitude: 77.2090, formatted_address: 'New Delhi, Delhi, India' },
    'mumbai': { latitude: 19.0760, longitude: 72.8777, formatted_address: 'Mumbai, Maharashtra, India' },
    'bangalore': { latitude: 12.9716, longitude: 77.5946, formatted_address: 'Bangalore, Karnataka, India' },
    'chennai': { latitude: 13.0827, longitude: 80.2707, formatted_address: 'Chennai, Tamil Nadu, India' },
    'kolkata': { latitude: 22.5726, longitude: 88.3639, formatted_address: 'Kolkata, West Bengal, India' },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867, formatted_address: 'Hyderabad, Telangana, India' },
    'pune': { latitude: 18.5204, longitude: 73.8567, formatted_address: 'Pune, Maharashtra, India' },
    'ahmedabad': { latitude: 23.0225, longitude: 72.5714, formatted_address: 'Ahmedabad, Gujarat, India' },
    'jaipur': { latitude: 26.9124, longitude: 75.7873, formatted_address: 'Jaipur, Rajasthan, India' },
    'goa': { latitude: 15.2993, longitude: 74.1240, formatted_address: 'Goa, India' },
    'agra': { latitude: 27.1767, longitude: 78.0081, formatted_address: 'Agra, Uttar Pradesh, India' },
  };

  const normalizedAddress = address.toLowerCase().trim();
  
  for (const [key, coords] of Object.entries(mockCoordinates)) {
    if (normalizedAddress.includes(key)) {
      return coords;
    }
  }

  return null;
}

/**
 * Get place autocomplete suggestions using Google Places API
 */
export async function getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY || !input.trim()) {
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=geocode&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK') {
      return data.predictions.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        structured_formatting: prediction.structured_formatting,
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Places autocomplete error:', error);
    return [];
  }
}

/**
 * Get place details using Google Places API
 */
export async function getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,place_id,types&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Place details API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        types: result.types,
      };
    }

    return null;
  } catch (error) {
    console.error('Google Place details error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access to search nearby hotels.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}
