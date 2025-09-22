'use client';

import { useEffect, useRef, useState } from 'react';

interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  price: number;
  rating: number;
  stars: number;
  image: string;
}

interface HotelsMapProps {
  hotels: Hotel[];
  userLocation?: { lat: number; lng: number };
  radius?: number;
  className?: string;
}

export default function HotelsMap({ hotels, userLocation, radius = 10, className = '' }: HotelsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => console.error('Failed to load Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !hotels.length) return;

    const center = userLocation || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Add user location marker
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      // Add radius circle
      new google.maps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.3,
        strokeWeight: 2,
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        map: mapInstance,
        center: userLocation,
        radius: radius * 1000, // Convert km to meters
      });
    }
  }, [isLoaded, userLocation, radius]);

  // Add hotel markers
  useEffect(() => {
    if (!map || !hotels.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    hotels.forEach(hotel => {
      if (hotel.latitude && hotel.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: hotel.latitude, lng: hotel.longitude },
          map: map,
          title: hotel.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">₹</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          },
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <div class="flex items-center space-x-2 mb-2">
                <img src="${hotel.image}" alt="${hotel.name}" class="w-12 h-12 object-cover rounded">
                <div>
                  <h3 class="font-semibold text-sm">${hotel.name}</h3>
                  <div class="flex items-center">
                    ${Array.from({ length: hotel.stars }, (_, i) => 
                      '<span class="text-yellow-400 text-xs">★</span>'
                    ).join('')}
                    <span class="text-xs text-gray-600 ml-1">${hotel.rating}</span>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-1">${hotel.location}</p>
              <p class="text-xs text-gray-500 mb-2">${hotel.address}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-blue-600">₹${hotel.price}</span>
                ${hotel.distance ? `<span class="text-xs text-green-600">${hotel.distance.toFixed(1)} km</span>` : ''}
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      if (userLocation) bounds.extend(userLocation);
      map.fitBounds(bounds);
    }
  }, [map, hotels]);

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Hotels on Map</h3>
        <p className="text-sm text-gray-600">
          {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
          {userLocation && ` within ${radius} km`}
        </p>
      </div>
      <div ref={mapRef} className="w-full h-96 rounded-b-lg"></div>
    </div>
  );
}
