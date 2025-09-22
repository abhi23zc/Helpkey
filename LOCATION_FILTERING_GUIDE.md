# Location-Based Hotel Filtering with Google Maps Integration

This guide explains the enhanced location-based filtering feature that provides customers with a premium experience using Google Maps API for geocoding, places autocomplete, and interactive map visualization.

## Features Implemented

### 1. Enhanced Customer Search Interface (`components/SearchForm.tsx`)

**New Features:**
- **Google Places Autocomplete**: Real-time address suggestions as users type
- **Current Location Button**: One-click location detection with improved error handling
- **Radius Selector**: Flexible search radius options (5km, 10km, 25km, 50km, 100km)
- **Smart UI**: Autocomplete dropdown with structured place information
- **Debounced Search**: Optimized API calls with 300ms debouncing

**How it works:**
1. **Autocomplete Search**: Users type destination → Google Places API provides suggestions
2. **Current Location**: Click crosshair icon → Browser geolocation → Automatic coordinates
3. **Radius Selection**: Choose search radius for nearby hotels
4. **Smart Fallback**: Falls back to mock data if Google Maps API is unavailable

### 2. Enhanced Hotel Search Results (`app/hotels/page.tsx`)

**New Features:**
- **Interactive Map Visualization**: Google Maps showing hotel locations with custom markers
- **Distance Calculation**: Precise Haversine formula for accurate distance measurements
- **Radius Filtering**: Real-time filtering of hotels within specified radius
- **Distance Sorting**: Automatic sorting by proximity for nearby searches
- **Visual Distance Indicators**: Green badges showing distance from user location
- **Map Integration**: Hotels displayed on interactive map with info windows

**Search Parameters:**
- `lat`: User's latitude
- `lng`: User's longitude  
- `radius`: Search radius in kilometers
- `nearby=true`: Indicates this is a nearby search

### 3. Enhanced Admin Hotel Management (`app/admin/hotels/add/page.tsx`)

**New Features:**
- **Google Places Integration**: Real-time address autocomplete for coordinate lookup
- **One-Click Coordinates**: Automatic coordinate retrieval from selected places
- **Enhanced Geocoding Helper**: Google Maps API integration with fallback support
- **Coordinate Validation**: Proper number input with decimal support

### 4. Google Maps API Integration (`utils/geocoding.ts`)

**Enhanced Functions:**
- `geocodeAddress()`: Google Maps Geocoding API with fallback to mock data
- `getPlaceAutocomplete()`: Google Places Autocomplete API for real-time suggestions
- `getPlaceDetails()`: Google Places Details API for precise coordinate retrieval
- `calculateDistance()`: Haversine formula for accurate distance calculations
- `getCurrentLocation()`: Enhanced browser geolocation with better error handling
- `formatDistance()`: Smart distance formatting (meters/kilometers)

### 5. Interactive Map Component (`components/HotelsMap.tsx`)

**Features:**
- **Google Maps Integration**: Interactive map with custom hotel markers
- **User Location Display**: Shows user's location with radius circle
- **Hotel Markers**: Custom markers with hotel information
- **Info Windows**: Click markers to see hotel details
- **Responsive Design**: Adapts to different screen sizes

### 6. Enhanced Geocoding Helper (`components/GeocodingHelper.tsx`)

**Features:**
- **Google Places Autocomplete**: Real-time address suggestions
- **One-Click Coordinates**: Automatic coordinate retrieval from selected places
- **Smart Error Handling**: Graceful fallbacks and user-friendly messages
- **Loading States**: Visual feedback during API calls

## Google Maps API Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Environment Configuration

Add your API key to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Quotas and Billing

- **Geocoding API**: 40,000 requests/month free
- **Places API**: 1,000 requests/month free
- **Maps JavaScript API**: 28,000 map loads/month free

Monitor usage in Google Cloud Console to avoid unexpected charges.

## How to Use

### For Customers:

1. **Search by Current Location:**
   - Go to the homepage
   - Click the crosshair icon in the destination field
   - Allow location access when prompted
   - Select your preferred search radius (5km, 10km, 25km, 50km, 100km)
   - Click "Search Hotels"
   - View results on the interactive map

2. **Search by Destination with Autocomplete:**
   - Start typing a city or location name in the destination field
   - Select from Google Places autocomplete suggestions
   - Choose dates, guests, and rooms
   - Click "Search Hotels"
   - Explore hotels on the map

### For Hotel Admins:

1. **Adding Coordinates to Hotels:**
   - Go to Admin → Hotels → Add New Hotel
   - Fill in basic hotel information
   - In the Coordinates section:
     - Type the hotel address in the "Get Coordinates" field
     - Select from Google Places autocomplete suggestions
     - Coordinates are automatically filled in
     - Or manually enter latitude and longitude
   - Save the hotel

2. **Coordinate Examples:**
   - Delhi: 28.6139, 77.2090
   - Mumbai: 19.0760, 72.8777
   - Bangalore: 12.9716, 77.5946
   - Chennai: 13.0827, 80.2707

## Technical Implementation

### Database Schema Updates

Hotels now include optional coordinate fields:
```javascript
{
  // ... existing fields
  latitude: number | null,
  longitude: number | null
}
```

### Search Logic

1. **Text-based Search**: Filters hotels by location/address/name (existing)
2. **Nearby Search**: 
   - Filters hotels with coordinates
   - Calculates distance using Haversine formula
   - Filters by radius
   - Sorts by distance

### Distance Calculation

Uses the Haversine formula to calculate great-circle distances:
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  // ... Haversine formula implementation
}
```

## Browser Compatibility

- **Geolocation API**: Supported in all modern browsers
- **HTTPS Required**: Geolocation requires secure context
- **Fallback**: Manual address entry if geolocation fails

## Advanced Features

### 1. **Smart Fallback System**
- Automatically falls back to mock data if Google Maps API is unavailable
- Graceful degradation ensures the app works even without API access
- Error handling with user-friendly messages

### 2. **Performance Optimizations**
- Debounced autocomplete requests (300ms delay)
- Efficient distance calculations using Haversine formula
- Lazy loading of map components
- Caching of geocoding results

### 3. **User Experience Enhancements**
- Real-time autocomplete with structured place information
- Visual loading states and error feedback
- Responsive design for mobile and desktop
- Interactive map with custom markers and info windows

## Future Enhancements

1. **Advanced Map Features**: 
   - Street view integration
   - Traffic information
   - Public transportation routes
   - Walking/driving directions to hotels

2. **Enhanced Filtering**:
   - Filter by distance ranges
   - Filter by landmarks or points of interest
   - Filter by hotel amenities on map

3. **Analytics and Insights**:
   - Track location-based search usage
   - Heat maps of popular search areas
   - User behavior analytics

4. **Mobile App Integration**:
   - Native mobile app with location services
   - Push notifications for nearby deals
   - Offline map support

## Testing

To test the location-based filtering:

1. **Add Test Hotels with Coordinates:**
   - Use the admin interface to add hotels with coordinates
   - Use the provided coordinate examples for major Indian cities

2. **Test Customer Search:**
   - Allow location access in your browser
   - Try searching with current location
   - Verify hotels are sorted by distance
   - Check that distance is displayed correctly

3. **Test Edge Cases:**
   - Deny location access
   - Search with no hotels in radius
   - Search with invalid coordinates

## Security Considerations

- **Location Privacy**: Only request location when needed
- **Data Storage**: Coordinates are stored as numbers, not sensitive location data
- **User Consent**: Clear permission requests and error handling
- **HTTPS**: Required for geolocation API to work

## Performance Notes

- **Distance Calculation**: O(n) complexity for filtering
- **Caching**: Consider caching geocoding results
- **Indexing**: Consider database indexes on latitude/longitude fields
- **Pagination**: May need pagination for large result sets

This implementation provides a solid foundation for location-based hotel search while maintaining backward compatibility with existing text-based search functionality.
