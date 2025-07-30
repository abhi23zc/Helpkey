'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export default function AddHotel() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    stars: 3,
    description: '',
    amenities: [],
    images: [],
    policies: {
      checkIn: '15:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation within 24 hours',
      pets: false,
      smoking: false
    }
  });

  const [currentAmenity, setCurrentAmenity] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  const amenityOptions = [
    'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness', 'Restaurant',
    'Room Service', 'Concierge', 'Valet Parking', 'Business Center', 'Meeting Rooms',
    'Bar/Lounge', 'Laundry Service', 'Airport Shuttle', 'Pet Friendly', 'Air Conditioning',
    'Balcony', 'Ocean View', 'Mountain View', 'Garden View', 'Beach Access'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const addAmenity = () => {
    if (currentAmenity && !formData.amenities.includes(currentAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, currentAmenity]
      }));
      setCurrentAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addImage = () => {
    if (currentImage && !formData.images.includes(currentImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, currentImage]
      }));
      setCurrentImage('');
    }
  };

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    const requiredFields = [
      { field: formData.name, message: 'Hotel name is required' },
      { field: formData.location, message: 'Location is required' },
      { field: formData.address, message: 'Address is required' },
      { field: formData.phone, message: 'Phone number is required' },
      { field: formData.email, message: 'Email is required' },
      { field: formData.description, message: 'Description is required' }
    ];
    
    for (const { field, message } of requiredFields) {
      if (!field.trim()) {
        setError(message);
        return;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      if (!user) {
        setError('You must be logged in to add a hotel');
        setIsSubmitting(false);
        return;
      }

      // Add hotel data to Firestore
      const hotelData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        addedAt: new Date().toISOString(),
        approved: false,
        hotelAdmin: user.uid // Add the user's UID as hotelAdmin
      };
      
      // Add document to 'hotels' collection
      const docRef = await addDoc(collection(db, 'hotels'), hotelData);
      console.log('Hotel added with ID:', docRef.id);
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/hotels');
      }, 2000);
    } catch (error: any) {
      console.error('Error adding hotel:', error);
      setError(error.message || 'Error adding hotel. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Hotel</h1>
            <p className="text-gray-600 mt-2">Create a new hotel property</p>
          </div>
          <Link href="/admin/hotels" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Hotels
          </Link>
        </div>

        {showSuccess ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-4 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="flex-shrink-0 mb-4">
                <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Hotel Added Successfully!</h3>
              <p className="text-green-700">Redirecting to hotel management page...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hotel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating *</label>
                <select
                  name="stars"
                  value={formData.stars}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State/Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact email"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your hotel..."
              />
              <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Amenities</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Amenity</label>
              <div className="flex gap-2">
                <select
                  value={currentAmenity}
                  onChange={(e) => setCurrentAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="">Select an amenity</option>
                  {amenityOptions.filter(amenity => !formData.amenities.includes(amenity)).map(amenity => (
                    <option key={amenity} value={amenity}>{amenity}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAmenity}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.amenities.map(amenity => (
                <span
                  key={amenity}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Hotel Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Hotel Images</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Hotel ${index + 1}`}
                    className="w-full h-32 object-cover object-top rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Hotel Policies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                <input
                  type="time"
                  name="checkIn"
                  value={formData.policies.checkIn}
                  onChange={handlePolicyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                <input
                  type="time"
                  name="checkOut"
                  value={formData.policies.checkOut}
                  onChange={handlePolicyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                <textarea
                  name="cancellation"
                  value={formData.policies.cancellation}
                  onChange={handlePolicyChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe cancellation policy..."
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="pets"
                      checked={formData.policies.pets}
                      onChange={handlePolicyChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Pet Friendly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="smoking"
                      checked={formData.policies.smoking}
                      onChange={handlePolicyChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Smoking Allowed</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link href="/admin/hotels" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Create Hotel'}
            </button>
          </div>
        </form>
        )}
      </div>

      <Footer />
    </div>
  );
}