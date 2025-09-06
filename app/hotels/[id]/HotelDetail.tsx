"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

interface HotelDetailProps {
  hotelId: string;
}

// Helper to get today's date in yyyy-mm-dd
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to get date after N days in yyyy-mm-dd
function getDateAfterNDaysString(n: number) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HotelDetail({ hotelId }: HotelDetailProps) {
  const router = useRouter();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  // Set checkIn to today, checkOut to today + 2 days
  const [checkIn, setCheckIn] = useState(getTodayDateString());
  const [checkOut, setCheckOut] = useState(getDateAfterNDaysString(2));
  const [guests, setGuests] = useState(2);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelRef = doc(db, "hotels", hotelId);
        const hotelSnap = await getDoc(hotelRef);

        if (hotelSnap.exists()) {
          const hotelData = { id: hotelSnap.id, ...hotelSnap.data() };
          
          // Fetch rooms for this hotel
          const roomsQuery = query(
            collection(db, "rooms"),
            where("hotelId", "==", hotelId)
          );
          const roomsSnapshot = await getDocs(roomsQuery);
          const rooms = roomsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            image: doc.data().images?.[0] || "",
            type: doc.data().roomType,
            beds: doc.data().beds,
            size: doc.data().size,
            capacity: doc.data().capacity,
            price: doc.data().price,
            amenities: doc.data().amenities || []
          }));
          
          setHotel({ ...hotelData, rooms });
        } else {
          console.error("No hotel found with this ID");
          router.push("/hotels");
        }
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return null;
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // When a room is selected, return to overview tab
    setActiveTab("overview");
  };

  const calculateNights = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getTotalPrice = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * calculateNights();
  };

  const handleBookNow = () => {
    if (!selectedRoom) return;

    const nights = calculateNights();
    const totalPrice = selectedRoom.price * nights;
    const taxesAndFees = Math.round(totalPrice * 0.15);

    const bookingParams = new URLSearchParams({
      hotel: hotel.id,
      room: selectedRoom.id,
      checkin: checkIn,
      checkout: checkOut,
      guests: guests.toString(),
      price: selectedRoom.price.toString(),
      nights: nights.toString(),
      totalPrice: totalPrice.toString(),
      taxesAndFees: taxesAndFees.toString(),
      hotelName: hotel.name,
      roomType: selectedRoom.type,
      location: hotel.location,
      image: selectedRoom.image || ""
    });

    router.push(`/booking?${bookingParams.toString()}`);
  };

  // Handler for "Select a Room" button in sidebar
  const handleSelectRoomClick = () => {
    setActiveTab("rooms");
    // Optionally scroll to main content
    if (typeof window !== "undefined") {
      const mainContent = document.getElementById("hotel-main-content");
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hotel Images Gallery */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="lg:col-span-2 lg:row-span-2 h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px]">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 lg:col-span-2">
            {hotel.images.slice(1).map((image, index) => (
              <div key={index} className="h-[100px] sm:h-[145px] md:h-[195px] lg:h-[245px]">
                <img
                  src={image}
                  alt={`${hotel.name} view ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3" id="hotel-main-content">
            {/* Hotel Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center mb-2">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <i
                        key={i}
                        className="ri-star-fill text-yellow-400 text-lg w-5 h-5 flex items-center justify-center"
                      ></i>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {hotel.stars} stars
                    </span>
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    {hotel.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-lg font-semibold">
                      {hotel.rating}
                    </span>
                    <span className="ml-2 text-gray-600">
                      ({hotel.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "rooms", label: "Rooms" },
                    { id: "amenities", label: "Amenities" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      About This Hotel
                    </h3>
                    <p className="text-gray-700 mb-6">{hotel.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Popular Amenities
                        </h4>
                        <ul className="space-y-1">
                          {hotel.amenities.slice(0, 5).map((amenity) => (
                            <li
                              key={amenity}
                              className="flex items-center text-gray-700"
                            >
                              <i className="ri-check-line text-green-500 mr-2 w-4 h-4 flex items-center justify-center"></i>
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">
                          Property Highlights
                        </h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Free cancellation available</li>
                          <li>• 24-hour front desk</li>
                          <li>• Mobile check-in</li>
                          <li>• Multilingual staff</li>
                          <li>• Pet-friendly options</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "rooms" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Available Rooms
                    </h3>
                    <div className="space-y-4">
                      {hotel?.rooms?.map((room) => (
                        <div
                          key={room.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/3">
                              <img
                                src={room.image}
                                alt={room.type}
                                className="w-full h-48 object-cover object-top rounded-lg"
                              />
                            </div>
                            <div className="md:w-2/3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {room.type}
                                </h4>
                                <div className="text-right">
                                  <span className="text-gray-400 line-through text-sm">
                                    ${room.originalPrice}
                                  </span>
                                  <div className="text-xl font-bold text-blue-600">
                                    ${room.price}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    per night
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <span className="mr-4">{room.size}</span>
                                <span className="mr-4">{room.beds}</span>
                                <span>Up to {room.capacity} guests</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {room.amenities.map((amenity) => (
                                  <span
                                    key={amenity}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={() => handleRoomSelect(room)}
                                className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                                  selectedRoom?.id === room.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {selectedRoom?.id === room.id
                                  ? "Selected"
                                  : "Select Room"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "amenities" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Hotel Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hotel.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <i className="ri-check-line text-green-500 mr-3 w-5 h-5 flex items-center justify-center"></i>
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Guest Reviews
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Sarah Johnson",
                          rating: 5,
                          date: "March 2024",
                          review:
                            "Absolutely stunning hotel! The ocean view from our suite was breathtaking. Staff was incredibly helpful and the amenities were top-notch.",
                        },
                        {
                          name: "Michael Chen",
                          rating: 4,
                          date: "February 2024",
                          review:
                            "Great location and beautiful property. The pool area was fantastic and the restaurant had excellent food. Would definitely stay again.",
                        },
                        {
                          name: "Emma Davis",
                          rating: 5,
                          date: "January 2024",
                          review:
                            "Perfect for our anniversary trip. The spa services were amazing and the beachfront location couldn't be better. Highly recommended!",
                        },
                      ].map((review, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-gray-900">
                                {review.name}
                              </h5>
                              <div className="flex items-center">
                                {[...Array(review.rating)].map((_, i) => (
                                  <i
                                    key={i}
                                    className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"
                                  ></i>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={getTodayDateString()}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Selected Room */}
              {selectedRoom && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Selected Room
                  </h4>
                  <p className="text-gray-700">{selectedRoom.type}</p>
                  <p className="text-sm text-gray-600">
                    {selectedRoom.size} • {selectedRoom.beds}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-blue-600">
                      ${selectedRoom.price}
                    </span>
                    <span className="text-sm text-gray-600">per night</span>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Nights</span>
                  <span className="text-gray-900">{calculateNights()}</span>
                </div>
                {selectedRoom && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">
                        ${selectedRoom.price} x {calculateNights()} nights
                      </span>
                      <span className="text-gray-900">${getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span className="text-gray-900">
                        ${Math.round(getTotalPrice() * 0.15)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          $
                          {getTotalPrice() + Math.round(getTotalPrice() * 0.15)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={selectedRoom ? handleBookNow : handleSelectRoomClick}
                disabled={!!selectedRoom ? false : false}
                className={`w-full py-3 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                  selectedRoom
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {selectedRoom ? "Book Now" : "Select a Room"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Free cancellation within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
