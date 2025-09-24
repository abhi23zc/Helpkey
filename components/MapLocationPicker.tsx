'use client';

import { useState, useRef, useEffect } from 'react';
import { getCurrentLocation, getPlaceAutocomplete, getPlaceDetails } from '@/utils/geocoding';
import { useGoogleMaps } from '@/context/GoogleMapsContext';
import toast from 'react-hot-toast';
import type { PlaceAutocompleteResult } from '@/utils/geocoding';

interface MapLocationPickerProps {
  onCoordinatesFound: (latitude: number, longitude: number) => void;
  disabled?: boolean;
  initialLatitude?: string;
  initialLongitude?: string;
}

export default function MapLocationPicker({ 
  onCoordinatesFound, 
  disabled = false, 
  initialLatitude = '', 
  initialLongitude = '' 
}: MapLocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();

  // Initialize map center with existing coordinates or default location
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const lat = parseFloat(initialLatitude);
      const lng = parseFloat(initialLongitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setSelectedLocation({ lat, lng });
      }
    } else {
      // Default to Delhi, India
      setMapCenter({ lat: 28.6139, lng: 77.2090 });
    }
  }, [initialLatitude, initialLongitude]);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      onCoordinatesFound(location.latitude, location.longitude);
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      setSelectedLocation({ lat: location.latitude, lng: location.longitude });
      setShowMap(true);
      
      toast.success(`Location found: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`, {
        duration: 4000,
        position: 'top-right',
      });
    } catch (error: any) {
      toast.error(error.message, {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleShowMap = () => {
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await getPlaceAutocomplete(value);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search result selection
  const handleSearchSelect = async (place: PlaceAutocompleteResult) => {
    setSearchQuery(place.description);
    setShowSearchResults(false);
    
    try {
      const placeDetails = await getPlaceDetails(place.place_id);
      if (placeDetails && mapInstanceRef.current && markerRef.current) {
        const lat = placeDetails.latitude;
        const lng = placeDetails.longitude;
        
        // Center map on selected place
        mapInstanceRef.current.setCenter({ lat, lng });
        markerRef.current.setPosition({ lat, lng });
        setSelectedLocation({ lat, lng });
        onCoordinatesFound(lat, lng);
        
        toast.success(`Found: ${place.structured_formatting.main_text}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      toast.error('Error getting location details', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  // Initialize map when shown
  useEffect(() => {
    if (showMap && isGoogleMapsLoaded && mapRef.current && mapCenter) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add marker at center
      const marker = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        draggable: true,
        title: 'Selected Location',
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="#2563EB" stroke="#FFFFFF" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
              <circle cx="20" cy="20" r="4" fill="#2563EB"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      markerRef.current = marker;

      // Update coordinates when marker is dragged
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          setSelectedLocation({ lat, lng });
          onCoordinatesFound(lat, lng);
          
          toast.success(`Location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      });

      // Update marker when map is clicked
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          marker.setPosition(event.latLng);
          setSelectedLocation({ lat, lng });
          onCoordinatesFound(lat, lng);
          
          toast.success(`Location selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      });
    }
  }, [showMap, isGoogleMapsLoaded, mapCenter, onCoordinatesFound]);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onCoordinatesFound(selectedLocation.lat, selectedLocation.lng);
      setShowMap(false);
      
      toast.success(`Location confirmed: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  // Hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="text-sm">Error loading Google Maps: {loadError}</p>
        <p className="text-xs mt-1">Please check your internet connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={disabled || isGettingLocation}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Getting Location...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use Current Location
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShowMap}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Select on Map
        </button>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Hotel Location</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Search for a place or click on the map to set your hotel location
                  </p>
                </div>
                <button
                  onClick={handleCloseMap}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for a place..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
                
                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSearchSelect(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{result.structured_formatting.main_text}</div>
                        <div className="text-xs text-gray-500 mt-1">{result.structured_formatting.secondary_text}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Map Container */}
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-96 sm:h-[500px] lg:h-[550px]"
                style={{ minHeight: '400px' }}
              />
            </div>
            
            {/* Selected Location Info */}
            {selectedLocation && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Selected Location</p>
                    <p className="text-xs text-gray-600">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseMap}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}