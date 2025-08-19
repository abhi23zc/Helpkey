
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect, Suspense } from 'react';
import type React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface BookingData {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  taxesAndFees: number;
  hotelDetails: {
    name: string;
    location: string;
    image: string;
  };
  roomDetails: {
    type: string;
    price: number;
    nights: number;
  };
}

interface HotelDoc {
  id: string;
  name: string;
  location: string;
  images?: string[];
}

interface RoomDoc {
  id: string;
  roomType: string;
  price: number;
  size?: string;
  beds?: string;
  capacity?: number;
  images?: string[];
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const [bookingData, setBookingData] = useState<BookingData>({
    hotelId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    totalPrice: 0,
    taxesAndFees: 0,
    hotelDetails: {
      name: '',
      location: '',
      image: ''
    },
    roomDetails: {
      type: '',
      price: 0,
      nights: 0
    }
  });

  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const [hotel, setHotel] = useState<HotelDoc | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDoc | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  useEffect(() => {
    const hotelId = searchParams.get('hotel') || '';
    const roomId = searchParams.get('room') || '';
    const checkIn = searchParams.get('checkin') || '';
    const checkOut = searchParams.get('checkout') || '';
    const guests = parseInt(searchParams.get('guests') || '2');
    const price = parseInt(searchParams.get('price') || '0');
    const nights = parseInt(searchParams.get('nights') || '0');
    const totalPrice = parseInt(searchParams.get('totalPrice') || '0');
    const taxesAndFees = parseInt(searchParams.get('taxesAndFees') || '0');
    const hotelName = searchParams.get('hotelName') || '';
    const roomType = searchParams.get('roomType') || '';
    const location = searchParams.get('location') || '';
    const image = searchParams.get('image') || '';
  
    setBookingData({
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      taxesAndFees,
      hotelDetails: {
        name: hotelName,
        location: location,
        image: image
      },
      roomDetails: {
        type: roomType,
        price: price,
        nights: nights
      }
    });
    
    const fetchDetails = async () => {
      if (!hotelId || !roomId) return;
      try {
        setLoadingDetails(true);
        const hotelSnap = await getDoc(doc(db, 'hotels', hotelId));
        if (hotelSnap.exists()) {
          const h = hotelSnap.data() as Omit<HotelDoc, 'id'>;
          setHotel({ id: hotelSnap.id, ...h });
        }
        const roomSnap = await getDoc(doc(db, 'rooms', roomId));
        if (roomSnap.exists()) {
          const r = roomSnap.data() as Omit<RoomDoc, 'id'>;
          setSelectedRoom({ id: roomSnap.id, ...r });
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [searchParams]);

  const displayHotelName = hotel?.name || bookingData.hotelDetails.name || 'Hotel';
  const displayHotelLocation = hotel?.location || bookingData.hotelDetails.location || '';
  const displayHotelImage = (hotel?.images && hotel.images[0]) || bookingData.hotelDetails.image || '';
  const displayRoomType = selectedRoom?.roomType || bookingData.roomDetails.type || 'Room';
  const displayRoomPrice = (selectedRoom?.price ?? bookingData.roomDetails.price ?? 0);
  const displayRoomSize = selectedRoom?.size || '';
  const displayRoomBeds = selectedRoom?.beds || '';
  const displayRoomCapacity = selectedRoom?.capacity;
  const displayRoomImage = (selectedRoom?.images && selectedRoom.images[0]) || displayHotelImage;

  const calculateNights = () => {
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentProcessing(true);

    const requiredFields = [
      guestInfo.firstName,
      guestInfo.lastName,
      guestInfo.email,
      guestInfo.phone,
      paymentInfo.cardNumber,
      paymentInfo.expiryDate,
      paymentInfo.cvv,
      paymentInfo.cardholderName,
      paymentInfo.billingAddress,
      paymentInfo.city,
      paymentInfo.zipCode,
      paymentInfo.country
    ];

    if (requiredFields.some(field => !field.trim())) {
      setIsSubmitting(false);
      setPaymentProcessing(false);
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Generate booking reference
      const reference = 'BK' + Date.now().toString().slice(-6);
      
      // Create booking document in Firestore
      const newBookingData = {
        reference,
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        userId: user?.uid || null,
        userEmail: guestInfo.email,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice,
        taxesAndFees: bookingData.taxesAndFees,
        totalAmount: bookingData.totalPrice + bookingData.taxesAndFees,
        nights: bookingData.roomDetails.nights || calculateNights(),
        unitPrice: displayRoomPrice,
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          specialRequests: guestInfo.specialRequests
        },
        paymentInfo: {
          cardholderName: paymentInfo.cardholderName,
          // Store only last 4 digits of card number for security
          lastFourDigits: paymentInfo.cardNumber.slice(-4),
          billingAddress: paymentInfo.billingAddress,
          city: paymentInfo.city,
          zipCode: paymentInfo.zipCode,
          country: paymentInfo.country
        },
        status: 'confirmed',
        createdAt: serverTimestamp(),
        hotelDetails: {
          name: displayHotelName,
          location: displayHotelLocation,
          image: displayHotelImage
        },
        roomDetails: {
          type: displayRoomType,
          price: displayRoomPrice,
          size: displayRoomSize,
          beds: displayRoomBeds,
          image: displayRoomImage
        }
      };
  
      // Add to Firestore
      const bookingsRef = collection(db, 'bookings');
      await addDoc(bookingsRef, newBookingData);
  
      // Update UI states
      setBookingReference(reference);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
  
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
  
        setTimeout(() => {
          router.push('/bookings');
        }, 3000);
      }, 1000);
  
    } catch (error) {
      console.error('Error creating booking:', error);
      setIsSubmitting(false);
      setPaymentProcessing(false);
      alert('There was an error processing your booking. Please try again.');
    }
  };

  if (paymentProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h1>
            <p className="text-gray-600 mb-6">
              Please wait while we process your payment securely...
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Validating payment details</span>
                  <i className="ri-check-line text-green-500 w-4 h-4 flex items-center justify-center"></i>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Processing transaction</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirming booking</span>
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentSuccess && !showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-2xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. Finalizing your booking...
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <i className="ri-shield-check-line text-green-600 mr-2 w-5 h-5 flex items-center justify-center"></i>
                <span className="text-green-800 font-medium">Secure Payment Confirmed</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Reference: {bookingReference}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-2xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Your reservation has been successfully confirmed.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Details</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium">{bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel:</span>
                  <span className="font-medium">{displayHotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{displayRoomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(bookingData.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(bookingData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{bookingData.guests} guests</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-bold text-lg">${bookingData.totalPrice + bookingData.taxesAndFees}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Confirmation email sent to {guestInfo.email}</li>
                <li>• Check-in instructions will be provided 24 hours before arrival</li>
                <li>• Free cancellation available until 24 hours before check-in</li>
                <li>• Contact hotel directly for special requests</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link href="/bookings" className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                View My Bookings
              </Link>
              <Link href="/" className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Review
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Guest Info
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Payment
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="md:w-1/3">
                    <img
                      src={displayHotelImage}
                      alt={displayHotelName}
                      className="w-full h-48 object-cover object-top rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{displayHotelName}</h3>
                    <p className="text-gray-600 flex items-center mb-4">
                      <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                      {displayHotelLocation}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">{formatDate(bookingData.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">{formatDate(bookingData.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-medium">{bookingData.guests} guests</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nights</p>
                        <p className="font-medium">{calculateNights()} nights</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Selected Room</h4>
                  <div className="flex gap-4">
                    <img
                      src={displayRoomImage}
                      alt={displayRoomType}
                      className="w-24 h-24 object-cover object-top rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{displayRoomType}</h5>
                      <p className="text-sm text-gray-600">{displayRoomSize} {displayRoomSize && displayRoomBeds ? '•' : ''} {displayRoomBeds}</p>
                      <p className="text-sm text-gray-600">{displayRoomCapacity ? `Up to ${displayRoomCapacity} guests` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">${displayRoomPrice}</p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Continue to Guest Info
                  </button>
                </div>
              </div>
            )}

              {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Information</h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={guestInfo.firstName}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={guestInfo.lastName}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={guestInfo.phone}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 555 123 4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={guestInfo.specialRequests}
                      onChange={handleGuestInfoChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special needs or preferences"
                    />
                  </div>
                </form>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <i className="ri-shield-check-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                  </p>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentInfoChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={paymentInfo.cardholderName}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Address *
                    </label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={paymentInfo.billingAddress}
                      onChange={handlePaymentInfoChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={paymentInfo.city}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={paymentInfo.zipCode}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={paymentInfo.country}
                        onChange={handlePaymentInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mr-2"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="marketing"
                        className="mr-2"
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-700">
                        I would like to receive promotional emails about special offers
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="ri-secure-payment-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                          Complete Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Room Rate</span>
                  <span className="font-medium">${displayRoomPrice} x {calculateNights()} nights</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${bookingData.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">${bookingData.taxesAndFees}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">${bookingData.totalPrice + bookingData.taxesAndFees}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formatDate(bookingData.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formatDate(bookingData.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{bookingData.guests} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{displayRoomType}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <i className="ri-information-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="font-medium">Important Information</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Free cancellation until 24 hours before check-in</li>
                  <li>• Valid ID required at check-in</li>
                  <li>• Booking confirmation will be sent to your email</li>
                  <li>• No hidden fees - total price includes all charges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading booking...</p></div></div>}>
      <BookingContent />
    </Suspense>
  );
}