// Google Maps API TypeScript declarations

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
    }

    interface MapOptions {
      zoom?: number;
      center?: LatLng | LatLngLiteral;
      mapTypeId?: MapTypeId;
      styles?: MapTypeStyle[];
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain',
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Array<{ [key: string]: any }>;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
      addListener(eventName: string, handler: Function): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      zIndex?: number;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface Symbol {
      path: SymbolPath | string;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4,
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string | Element): void;
      open(map?: Map, anchor?: Marker): void;
    }

    interface InfoWindowOptions {
      content?: string | Element;
      position?: LatLng | LatLngLiteral;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setMap(map: Map | null): void;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        componentRestrictions?: ComponentRestrictions;
      }

      interface ComponentRestrictions {
        country?: string | string[];
      }

      interface AutocompletePrediction {
        place_id: string;
        description: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        place_id?: string;
        formatted_address?: string;
        geometry?: {
          location?: LatLng;
        };
        types?: string[];
      }

      const PlacesServiceStatus: {
        OK: 'OK';
        ZERO_RESULTS: 'ZERO_RESULTS';
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT';
        REQUEST_DENIED: 'REQUEST_DENIED';
        INVALID_REQUEST: 'INVALID_REQUEST';
        UNKNOWN_ERROR: 'UNKNOWN_ERROR';
      };
    }

    namespace geocoding {
      class Geocoder {
        geocode(
          request: GeocoderRequest,
          callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
        ): void;
      }

      interface GeocoderRequest {
        address?: string;
        location?: LatLng | LatLngLiteral;
      }

      interface GeocoderResult {
        formatted_address: string;
        geometry: {
          location: LatLng;
        };
        place_id: string;
        types: string[];
      }

      const GeocoderStatus: {
        OK: 'OK';
        ZERO_RESULTS: 'ZERO_RESULTS';
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT';
        REQUEST_DENIED: 'REQUEST_DENIED';
        INVALID_REQUEST: 'INVALID_REQUEST';
        UNKNOWN_ERROR: 'UNKNOWN_ERROR';
      };
    }
  }
}

export {};
