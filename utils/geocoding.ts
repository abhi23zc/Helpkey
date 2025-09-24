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
 * Note: This requires Google Maps JavaScript SDK to be loaded
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    if (!address.trim() || !window.google || !window.google.maps || !window.google.maps.geocoding) {
      console.warn('Google Maps SDK not loaded. Using fallback geocoding.');
      return fallbackGeocodeAddress(address);
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.geocoding.Geocoder();
      
      geocoder.geocode(
        { address: address },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            resolve({
              latitude: result.geometry.location.lat(),
              longitude: result.geometry.location.lng(),
              formatted_address: result.formatted_address,
              place_id: result.place_id,
              types: result.types,
            });
          } else {
            console.warn('Geocoding failed:', status);
            resolve(fallbackGeocodeAddress(address));
          }
        }
      );
    });
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
 * Note: This requires Google Maps JavaScript SDK to be loaded
 */
export async function getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
  try {
    if (!input.trim() || !window.google || !window.google.maps || !window.google.maps.places) {
      return [];
    }

    return new Promise((resolve) => {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: input,
          types: ['geocode'],
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            const results = predictions.map((prediction) => ({
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: prediction.structured_formatting,
            }));
            resolve(results);
          } else {
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('Google Places autocomplete error:', error);
    return [];
  }
}

/**
 * Get place details using Google Places API
 * Note: This requires Google Maps JavaScript SDK to be loaded
 */
export async function getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
  try {
    if (!placeId || !window.google || !window.google.maps || !window.google.maps.places) {
      return null;
    }

    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'place_id', 'types'],
        },
        (place, status) => {
          if (status === 'OK' && place) {
            const result = {
              latitude: place.geometry?.location?.lat() || 0,
              longitude: place.geometry?.location?.lng() || 0,
              formatted_address: place.formatted_address || '',
              place_id: place.place_id || '',
              types: place.types || [],
            };
            resolve(result);
          } else {
            resolve(null);
          }
        }
      );
    });
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
