'use client';

import { useState, useRef, useEffect } from 'react';
import { geocodeAddress, getPlaceAutocomplete, getPlaceDetails } from '@/utils/geocoding';
import { useGoogleMaps } from '@/context/GoogleMapsContext';
import type { PlaceAutocompleteResult } from '@/utils/geocoding';

interface GeocodingHelperProps {
  onCoordinatesFound: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}

export default function GeocodingHelper({ onCoordinatesFound, disabled = false }: GeocodingHelperProps) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<PlaceAutocompleteResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();

  // Handle address input with autocomplete
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setError('');
    setSuccess('');
    
    // Debounce autocomplete requests
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    autocompleteTimeoutRef.current = setTimeout(async () => {
      if (value.trim().length >= 2 && isGoogleMapsLoaded) {
        setIsLoadingAutocomplete(true);
        try {
          const results = await getPlaceAutocomplete(value);
          setAutocompleteResults(results);
          setShowAutocomplete(true);
        } catch (error) {
          console.error('Autocomplete error:', error);
          setAutocompleteResults([]);
        } finally {
          setIsLoadingAutocomplete(false);
        }
      } else {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      }
    }, 300);
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = async (place: PlaceAutocompleteResult) => {
    setAddress(place.description);
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
    // Get coordinates for the selected place
    try {
      const placeDetails = await getPlaceDetails(place.place_id);
      if (placeDetails) {
        onCoordinatesFound(placeDetails.latitude, placeDetails.longitude);
        setSuccess(`Found coordinates: ${placeDetails.latitude.toFixed(6)}, ${placeDetails.longitude.toFixed(6)}`);
        setAddress(''); // Clear the input
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      setError('Error getting coordinates for selected place.');
    }
  };

  const handleGeocode = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await geocodeAddress(address);
      
      if (result) {
        onCoordinatesFound(result.latitude, result.longitude);
        setSuccess(`Found coordinates: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`);
        setAddress(''); // Clear the input
      } else {
        setError('Could not find coordinates for this address. Please enter them manually.');
      }
    } catch (err) {
      setError('Error getting coordinates. Please try again or enter them manually.');
    } finally {
      setIsLoading(false);
    }
  };

  // Hide autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAutocomplete(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter address to get coordinates"
            disabled={disabled || isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={handleGeocode}
            disabled={disabled || isLoading || !address.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Getting...</span>
              </div>
            ) : (
              'Get Coordinates'
            )}
          </button>
        </div>
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && (autocompleteResults.length > 0 || isLoadingAutocomplete) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoadingAutocomplete ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <span className="ml-2 text-sm">Searching...</span>
              </div>
            ) : (
              autocompleteResults.map((place) => (
                <button
                  key={place.place_id}
                  type="button"
                  onClick={() => handleAutocompleteSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <i className="ri-map-pin-line text-gray-400 mr-3 w-4 h-4 flex items-center justify-center"></i>
                    <div>
                      <div className="font-medium text-gray-900">
                        {place.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500">
                        {place.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="text-green-600 text-sm">{success}</p>
      )}
      
      <p className="text-xs text-gray-500">
        💡 Tip: This feature helps you get coordinates automatically. For best results, include city and state/country in your address.
      </p>
    </div>
  );
}
