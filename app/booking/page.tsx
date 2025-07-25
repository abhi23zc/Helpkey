
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const [bookingData, setBookingData] = useState({
    hotelId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    totalPrice: 0,
    taxesAndFees: 0
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

  const hotels = {
    '1': {
      id: 1,
      name: "Grand Luxury Resort",
      location: "Miami Beach, Florida",
      image: "https://readdy.ai/api/search-image?query=Luxury%20beachfront%20resort%20hotel%20with%20infinity%20pool%2C%20palm%20trees%2C%20modern%20architecture%2C%20ocean%20view%2C%20tropical%20paradise%2C%20white%20sand%20beach%2C%20elegant%20design%2C%20five%20star%20accommodation&width=400&height=300&seq=booking-hotel-1&orientation=landscape",
      rooms: [
        {
          id: 1,
          type: "Ocean View Suite",
          price: 399,
          size: "650 sq ft",
          beds: "1 King Bed",
          capacity: 2,
          image: "https://readdy.ai/api/search-image?query=Luxury%20hotel%20ocean%20view%20suite%20with%20king%20bed%2C%20elegant%20decor%2C%20private%20balcony%2C%20marble%20bathroom%2C%20sophisticated%20furnishings%2C%20five%20star%20accommodation%2C%20stunning%20sea%20views&width=300&height=200&seq=booking-room-1&orientation=landscape"
        },
        {
          id: 2,
          type: "Beachfront Villa",
          price: 599,
          size: "1200 sq ft",
          beds: "2 Queen Beds",
          capacity: 4,
          image: "https://readdy.ai/api/search-image?query=Beachfront%20villa%20with%20private%20terrace%2C%20outdoor%20shower%2C%20luxury%20furnishings%2C%20direct%20beach%20access%2C%20tropical%20paradise%2C%20premium%20accommodation%2C%20elegant%20design&width=300&height=200&seq=booking-room-2&orientation=landscape"
        }
      ]
    },
    '2': {
      id: 2,
      name: "City Center Business Hotel",
      location: "Downtown Manhattan, New York",
      image: "https://readdy.ai/api/search-image?query=Modern%20business%20hotel%20in%20city%20center%2C%20sleek%20contemporary%20design%2C%20glass%20facade%2C%20urban%20setting%2C%20professional%20atmosphere%2C%20downtown%20location%2C%20sophisticated%20interior%2C%20four%20star%20accommodation&width=400&height=300&seq=booking-hotel-2&orientation=landscape",
      rooms: [
        {
          id: 1,
          type: "Executive Suite",
          price: 289,
          size: "800 sq ft",
          beds: "1 King Bed",
          capacity: 2,
          image: "https://readdy.ai/api/search-image?query=Executive%20hotel%20suite%20with%20city%20skyline%20views%2C%20modern%20business%20desk%2C%20king%20bed%2C%20sophisticated%20urban%20decor%2C%20professional%20atmosphere%2C%20luxury%20amenities&width=300&height=200&seq=booking-room-3&orientation=landscape"
        }
      ]
    }
  };

  useEffect(() => {
    const hotelId = searchParams.get('hotel') || '1';
    const roomId = searchParams.get('room') || '1';
    const checkIn = searchParams.get('checkin') || '2024-03-15';
    const checkOut = searchParams.get('checkout') || '2024-03-20';
    const guests = parseInt(searchParams.get('guests') || '2');
    const price = parseInt(searchParams.get('price') || '399');
    const nights = parseInt(searchParams.get('nights') || '5');

    const totalPrice = price * nights;
    const taxesAndFees = Math.round(totalPrice * 0.15);

    setBookingData({
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      taxesAndFees
    });
  }, [searchParams]);

  const hotel = hotels[bookingData.hotelId] || hotels['1'];
  const selectedRoom = hotel.rooms.find(room => room.id === parseInt(bookingData.roomId)) || hotel.rooms[0];

  const calculateNights = () => {
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGuestInfoChange = (e) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentInfoChange = (e) => {
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

  const handleSubmitBooking = async (e) => {
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

    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);

      const reference = 'BK' + Date.now().toString().slice(-6);
      setBookingReference(reference);

      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
          router.push('/bookings');
        }, 3000);
      }, 1000);
    }, 3000);
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
                  <span className="font-medium">{hotel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{selectedRoom.type}</span>
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
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-48 object-cover object-top rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <p className="text-gray-600 flex items-center mb-4">
                      <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                      {hotel.location}
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
                      src={selectedRoom.image}
                      alt={selectedRoom.type}
                      className="w-24 h-24 object-cover object-top rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{selectedRoom.type}</h5>
                      <p className="text-sm text-gray-600">{selectedRoom.size} • {selectedRoom.beds}</p>
                      <p className="text-sm text-gray-600">Up to {selectedRoom.capacity} guests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">${selectedRoom.price}</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={guestInfo.firstName}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={guestInfo.lastName}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={guestInfo.phone}
                        onChange={handleGuestInfoChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={guestInfo.specialRequests}
                      onChange={handleGuestInfoChange}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Any special requests or preferences..."
                    ></textarea>
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {guestInfo.specialRequests.length}/500 characters
                    </div>
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
                  <span className="font-medium">${selectedRoom.price} x {calculateNights()} nights</span>
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
                    <span className="font-medium">{selectedRoom.type}</span>
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
