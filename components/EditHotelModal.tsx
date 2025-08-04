'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
}

export default function EditHotelModal({ isOpen, onClose, hotelId }: EditHotelModalProps) {
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
    amenities: [] as string[],
    images: [] as string[],
    policies: {
      checkIn: '15:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation within 24 hours',
      pets: false,
      smoking: false
    }
  });

  const [currentAmenity, setCurrentAmenity] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const amenityOptions = [
    'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness', 'Restaurant',
    'Room Service', 'Concierge', 'Valet Parking', 'Business Center', 'Meeting Rooms',
    'Bar/Lounge', 'Laundry Service', 'Airport Shuttle', 'Pet Friendly', 'Air Conditioning',
    'Balcony', 'Ocean View', 'Mountain View', 'Garden View', 'Beach Access'
  ];

  // Fetch hotel data when modal opens
  useEffect(() => {
    if (isOpen && hotelId) {
      fetchHotelData();
    }
  }, [isOpen, hotelId]);

  const fetchHotelData = async () => {
    try {
      const hotelRef = doc(db, 'hotels', hotelId);
      const hotelSnap = await getDoc(hotelRef);
      
      if (hotelSnap.exists()) {
        const hotelData = hotelSnap.data();
        setFormData({
          name: hotelData.name || '',
          location: hotelData.location || '',
          address: hotelData.address || '',
          phone: hotelData.phone || '',
          email: hotelData.email || '',
          stars: hotelData.stars || 3,
          description: hotelData.description || '',
          amenities: hotelData.amenities || [],
          images: hotelData.images || [],
          policies: {
            checkIn: hotelData.policies?.checkIn || '15:00',
            checkOut: hotelData.policies?.checkOut || '11:00',
            cancellation: hotelData.policies?.cancellation || 'Free cancellation within 24 hours',
            pets: hotelData.policies?.pets || false,
            smoking: hotelData.policies?.smoking || false
          }
        });
      } else {
        setError('Hotel not found');
      }
    } catch (error: any) {
      console.error('Error fetching hotel data:', error);
      setError(error.message || 'Error fetching hotel data');
    }
  };

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

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }));
  };

  // Replace the handleFileSelect function with this corrected version:
  
  const handleFileSelect = async (files: FileList) => {
    setUploadError('');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        continue;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select valid image files');
        continue;
      }
  
      const fileId = `${file.name}-${Date.now()}`;
      
      try {
        const uploadedUrl = await uploadToCloudinary(
          file,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          },
          'hotels'
        );
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, uploadedUrl]
        }));
        
        // Clear progress after completion
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError('Failed to upload image. Please try again.');
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
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
      // Update hotel data in Firestore
      const hotelRef = doc(db, 'hotels', hotelId);
      await updateDoc(hotelRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      // Show success message
      setShowSuccess(true);
      
      // Close modal after a short delay - use router refresh instead of reload
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Instead of window.location.reload(), use router refresh
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/hotels';
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error updating hotel:', error);
      setError(error.message || 'Error updating hotel. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Hotel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotel Updated Successfully!</h3>
              <p className="text-gray-600">The hotel information has been updated.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stars</label>
                  <select
                    name="stars"
                    value={formData.stars}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <option key={star} value={star}>{star} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                
                <div className="mb-3">
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
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hotel Images */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Hotel Images</h3>
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop images here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      browse to upload
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 5MB per image
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                    {uploadError}
                  </div>
                )}

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {formData.images.map((image, index) => {
                      const fileId = Object.keys(uploadProgress).find(key => 
                        formData.images[index]?.includes(key.split('-').slice(1).join('-'))
                      );
                      const progress = fileId ? uploadProgress[fileId] : 100;
                      
                      return (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={image}
                              alt={`Hotel ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {progress < 100 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-white text-sm font-medium">
                                  {progress}%
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Policies */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Hotel Policies</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                    <input
                      type="time"
                      name="checkIn"
                      value={formData.policies.checkIn}
                      onChange={handlePolicyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                    <input
                      type="time"
                      name="checkOut"
                      value={formData.policies.checkOut}
                      onChange={handlePolicyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
                    <textarea
                      name="cancellation"
                      value={formData.policies.cancellation}
                      onChange={handlePolicyChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
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
                  ) : 'Update Hotel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}