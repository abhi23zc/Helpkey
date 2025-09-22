
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RazorpayPayment from '@/components/RazorpayPayment';
import { useState, useEffect, Suspense } from 'react';
import type React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { RazorpayResponse, RazorpayError } from '@/config/razorpay';

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
    image: string | null;
  };
  roomDetails: {
    type: string;
    price: number;
    nights: number;
  };
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface HotelDoc {
  id: string;
  name: string;
  location: string;
  images?: string[];
  hotelAdmin?: string;
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
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [paymentError, setPaymentError] = useState('');

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

  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);
  const [manualGuestCount, setManualGuestCount] = useState<number | null>(null);
  const [customGuests, setCustomGuests] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);


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
    const image = searchParams.get('image') || null;
  
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

    // Initialize guest forms based on the number of guests
    if (guests > 0) {
      initializeGuestForms(guests);
    }
    
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
  const displayHotelImage = (hotel?.images && hotel.images[0]) || bookingData.hotelDetails.image || null;
  const displayRoomType = selectedRoom?.roomType || bookingData.roomDetails.type || 'Room';
  const displayRoomPrice = (selectedRoom?.price ?? bookingData.roomDetails.price ?? 0);
  const displayRoomSize = selectedRoom?.size || '';
  const displayRoomBeds = selectedRoom?.beds || '';
  const displayRoomCapacity = selectedRoom?.capacity;
  const displayRoomImage = (selectedRoom?.images && selectedRoom.images[0]) || displayHotelImage || null;

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

  // Initialize guest forms based on number of guests
  const initializeGuestForms = (guestCount: number) => {
    const newGuestInfo: GuestInfo[] = [];
    for (let i = 0; i < guestCount; i++) {
      newGuestInfo.push({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: ''
      });
    }
    setGuestInfo(newGuestInfo);
  };

  const handleGuestInfoChange = (guestIndex: number, field: keyof GuestInfo, value: string) => {
    const updatedGuestInfo = [...guestInfo];
    updatedGuestInfo[guestIndex] = {
      ...updatedGuestInfo[guestIndex],
      [field]: value
    };
    setGuestInfo(updatedGuestInfo);
  };

  const handleManualGuestCountChange = (count: number) => {
    setManualGuestCount(count);
    if (count === 5) { // 5 means "More than 4"
      setShowCustomInput(true);
      setCustomGuests("");
    } else {
      setShowCustomInput(false);
      setCustomGuests("");
      setBookingData(prev => ({ ...prev, guests: count }));
      initializeGuestForms(count);
    }
  };

  const handleCustomGuestChange = (value: string) => {
    setCustomGuests(value);
    const numGuests = parseInt(value);
    if (!isNaN(numGuests) && numGuests > 0) {
      setBookingData(prev => ({ ...prev, guests: numGuests }));
      initializeGuestForms(numGuests);
    }
  };

  const getFinalGuestCount = () => {
    if (showCustomInput && customGuests) {
      const numGuests = parseInt(customGuests);
      return !isNaN(numGuests) && numGuests > 0 ? numGuests : 0;
    }
    return bookingData.guests;
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

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingData.totalPrice + bookingData.taxesAndFees,
          currency: 'INR',
          receipt: `booking_${Date.now()}`
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRazorpayOrderId(data.order.id);
        return data.order.id;
      } else {
        throw new Error(data.error || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
      return null;
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      setPaymentProcessing(true);
      
      // Verify payment on server
      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success && verifyData.verified) {
        // Payment verified, create booking
        await createBooking(response);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Payment verification failed. Please contact support.');
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (error: RazorpayError) => {
    console.error('Payment failed:', error);
    setPaymentError(`Payment failed: ${error.description || 'Unknown error'}`);
    setPaymentProcessing(false);
  };

  const handlePaymentClose = () => {
    setPaymentProcessing(false);
    setPaymentError('');
  };

  const createBooking = async (paymentResponse: RazorpayResponse) => {
    try {
      // Generate booking reference
      const reference = 'BK' + Date.now().toString().slice(-6);
      
      // Create booking document in Firestore
      const newBookingData = {
        reference,
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        userId: user?.uid || null,
        userEmail: guestInfo.length > 0 ? guestInfo[0].email : '',
        hotelAdmin: hotel?.hotelAdmin || null,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice,
        taxesAndFees: bookingData.taxesAndFees,
        totalAmount: bookingData.totalPrice + bookingData.taxesAndFees,
        nights: bookingData.roomDetails.nights || calculateNights(),
        unitPrice: displayRoomPrice,
        guestInfo: guestInfo,
        paymentInfo: {
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          method: 'razorpay',
          status: 'completed'
        },
        status: 'pending',
        createdAt: serverTimestamp(),
        hotelDetails: {
          name: displayHotelName,
          location: displayHotelLocation,
          image: displayHotelImage,
          hotelId: bookingData.hotelId
        },
        roomDetails: {
          type: displayRoomType,
          price: displayRoomPrice,
          size: displayRoomSize,
          beds: displayRoomBeds,
          image: displayRoomImage,
          roomId: bookingData.roomId,
          roomNumber: null // Will be assigned by admin
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
      setPaymentError('There was an error processing your booking. Please contact support.');
      setPaymentProcessing(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError('');

    // Validate all guest information
    const allGuestsValid = guestInfo.every(guest => 
      guest.firstName.trim() && 
      guest.lastName.trim() && 
      guest.email.trim() && 
      guest.phone.trim()
    );

    if (!allGuestsValid) {
      setIsSubmitting(false);
      alert('Please fill in all required guest information fields for all guests');
      return;
    }

    if (guestInfo.length === 0) {
      setIsSubmitting(false);
      alert('Please add at least one guest');
      return;
    }

    // Create Razorpay order first
    const orderId = await createRazorpayOrder();
    if (!orderId) {
      setIsSubmitting(false);
      return;
    }

    // The payment will be handled by RazorpayPayment component
    setIsSubmitting(false);
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
                  <span className="font-bold text-lg">₹{bookingData.totalPrice + bookingData.taxesAndFees}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Confirmation email sent to {guestInfo.length > 0 ? guestInfo[0].email : 'your email'}</li>
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
                    {displayHotelImage ? (
                      <img
                        src={displayHotelImage}
                        alt={displayHotelName}
                        className="w-full h-48 object-cover object-top rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <i className="ri-image-line text-4xl mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
                          <p className="text-sm">No image available</p>
                        </div>
                      </div>
                    )}
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
                    {displayRoomImage ? (
                      <img
                        src={displayRoomImage}
                        alt={displayRoomType}
                        className="w-24 h-24 object-cover object-top rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="ri-image-line text-gray-400 w-6 h-6 flex items-center justify-center"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{displayRoomType}</h5>
                      <p className="text-sm text-gray-600">
                        {[displayRoomSize, displayRoomBeds].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-sm text-gray-600">{displayRoomCapacity ? `Up to ${displayRoomCapacity} guests` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">₹{displayRoomPrice}</p>
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

                {/* Manual Guest Count Input */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Number of Guests</h3>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Guests:</label>
                    <select
                      value={showCustomInput ? 5 : bookingData.guests}
                      onChange={(e) => handleManualGuestCountChange(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select number of guests</option>
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>More than 4 guests</option>
                    </select>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Please select the number of guests and fill in their information below.
                  </p>
                </div>

                {/* Custom Guest Input */}
                {showCustomInput && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter number of guests
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={customGuests}
                      onChange={(e) => handleCustomGuestChange(e.target.value)}
                      placeholder="Enter number of guests (5-20)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Please enter a number between 5 and 20 guests
                    </p>
                  </div>
                )}

                {/* Guest Forms */}
                {getFinalGuestCount() > 0 && (
                  <div className="space-y-8">
                    {guestInfo.map((guest, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Guest {index + 1} {index === 0 && <span className="text-sm text-gray-500">(Primary Guest)</span>}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              value={guest.firstName}
                              onChange={(e) => handleGuestInfoChange(index, 'firstName', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input
                              type="text"
                              value={guest.lastName}
                              onChange={(e) => handleGuestInfoChange(index, 'lastName', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                              type="email"
                              value={guest.email}
                              onChange={(e) => handleGuestInfoChange(index, 'email', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input
                              type="tel"
                              value={guest.phone}
                              onChange={(e) => handleGuestInfoChange(index, 'phone', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="+1 555 123 4567"
                            />
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                            <textarea
                              value={guest.specialRequests || ''}
                              onChange={(e) => handleGuestInfoChange(index, 'specialRequests', e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Any special needs or preferences for the booking"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {getFinalGuestCount() === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-user-line text-2xl text-gray-400 w-8 h-8 flex items-center justify-center"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Guests Selected</h3>
                    <p className="text-gray-600">Please select the number of guests above to continue.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={getFinalGuestCount() === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
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
                    <span className="font-medium">Secure Payment with Razorpay</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Your payment is processed securely through Razorpay. We accept all major credit cards, debit cards, UPI, net banking, and wallets.
                  </p>
                </div>

                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700 mb-2">
                      <i className="ri-error-warning-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                      <span className="font-medium">Payment Error</span>
                    </div>
                    <p className="text-sm text-red-600">{paymentError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitBooking} className="space-y-6">
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
                    <div className="w-full max-w-xs">
                      {razorpayOrderId ? (
                        <RazorpayPayment
                          amount={bookingData.totalPrice + bookingData.taxesAndFees}
                          currency="INR"
                          orderId={razorpayOrderId}
                          customerName={guestInfo.length > 0 ? `${guestInfo[0].firstName} ${guestInfo[0].lastName}` : ''}
                          customerEmail={guestInfo.length > 0 ? guestInfo[0].email : ''}
                          customerPhone={guestInfo.length > 0 ? guestInfo[0].phone : ''}
                          description={`Hotel booking for ${displayHotelName}`}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          onClose={handlePaymentClose}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Initializing...
                            </>
                          ) : (
                            <>
                              <i className="ri-secure-payment-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                              Initialize Payment
                            </>
                          )}
                        </button>
                      )}
                    </div>
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
                  <span className="font-medium">₹{displayRoomPrice} x {calculateNights()} nights</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{bookingData.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">₹{bookingData.taxesAndFees}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">₹{bookingData.totalPrice + bookingData.taxesAndFees}</span>
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