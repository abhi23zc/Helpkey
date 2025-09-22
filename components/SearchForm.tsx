
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPlaceAutocomplete, getPlaceDetails, getCurrentLocation } from '@/utils/geocoding';
import type { PlaceAutocompleteResult } from '@/utils/geocoding';

// Helper to format date as yyyy-mm-dd
function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function SearchForm() {
  // Set default check-in to today, check-out to 2 days after
  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(today.getDate() + 2);

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(twoDaysLater));
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState('10'); // in kilometers
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<PlaceAutocompleteResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Ensure check-out is always at least 2 days after check-in
  useEffect(() => {
    const checkInDate = new Date(checkIn);
    const minCheckOutDate = new Date(checkInDate);
    minCheckOutDate.setDate(checkInDate.getDate() + 2);
    if (new Date(checkOut) < minCheckOutDate) {
      setCheckOut(formatDate(minCheckOutDate));
    }
  }, [checkIn]);

  // Get current location using utility function
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError('');

    try {
      const location = await getCurrentLocation();
      setCurrentLocation({ lat: location.latitude, lng: location.longitude });
      setUseCurrentLocation(true);
      setDestination(''); // Clear destination when using current location
      setShowAutocomplete(false); // Hide autocomplete
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Unable to get your location.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle destination input with autocomplete
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    
    if (value.trim()) {
      setUseCurrentLocation(false);
      setCurrentLocation(null);
      setLocationError('');
      
      // Debounce autocomplete requests
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
      
      autocompleteTimeoutRef.current = setTimeout(async () => {
        if (value.trim().length >= 2) {
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
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = async (place: PlaceAutocompleteResult) => {
    setDestination(place.description);
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
    // Get coordinates for the selected place
    try {
      const placeDetails = await getPlaceDetails(place.place_id);
      if (placeDetails) {
        // You could optionally use these coordinates for more precise searching
        console.log('Selected place coordinates:', placeDetails);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
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

  const handleSearch = () => {
    // Pass all params in query string
    const params = new URLSearchParams();
    
    if (useCurrentLocation && currentLocation) {
      // Use current location for nearby search
      params.append('lat', currentLocation.lat.toString());
      params.append('lng', currentLocation.lng.toString());
      params.append('radius', searchRadius);
      params.append('nearby', 'true');
    } else if (destination.trim()) {
      // Use destination search
      params.append('location', destination.trim());
    }
    
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);
    if (rooms) params.append('rooms', rooms);

    router.push(`/hotels${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <i className="ri-map-pin-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <input
              type="text"
              value={useCurrentLocation ? 'Current Location' : destination}
              onChange={handleDestinationChange}
              placeholder="Where do you want to go?"
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={useCurrentLocation}
            />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Use current location"
            >
              {isGettingLocation ? (
                <i className="ri-loader-4-line w-4 h-4 animate-spin"></i>
              ) : (
                <i className="ri-crosshair-line w-4 h-4"></i>
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
                autocompleteResults.map((place, index) => (
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
          
          {locationError && (
            <p className="text-red-500 text-xs mt-1">{locationError}</p>
          )}
          {useCurrentLocation && currentLocation && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-gray-600">Search radius:</span>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <i className="ri-calendar-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <input
              type="date"
              value={checkIn}
              min={formatDate(today)}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <div className="relative">
            <i className="ri-calendar-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <input
              type="date"
              value={checkOut}
              min={formatDate(new Date(new Date(checkIn).setDate(new Date(checkIn).getDate() + 2)))}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guests
            </label>
            <div className="relative">
              <i className="ri-user-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
              <span className="absolute right-5 top-3 text-gray-500 text-xs pointer-events-none">{guests} </span>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rooms
            </label>
            <div className="relative">
              <i className="ri-hotel-bed-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
              <span className="absolute right-5 top-3 text-gray-500 text-xs pointer-events-none">{rooms}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-search-line w-5 h-5 flex items-center justify-center"></i>
          <span>Search Hotels</span>
        </button>
      </div>
    </div>
  );
}
