
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleSearch = () => {
    // Pass all params in query string
    const params = new URLSearchParams();
    if (destination.trim()) params.append('location', destination.trim());
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
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
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
