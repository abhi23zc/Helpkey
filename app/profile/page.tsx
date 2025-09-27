'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserData, updateUserProfilePicture } from '../../utils/userUtils';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { uploadToCloudinary } from '../../utils/cloudinary';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    preferences: {
      notifications: true,
      marketing: false,
      sms: true,
    }
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        email: userData.email || '',
        street: userData.street || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        emergencyContact: userData.emergencyContact || '',
        preferences: {
          notifications: userData.preferences?.notifications ?? true,
          marketing: userData.preferences?.marketing ?? false,
          sms: userData.preferences?.sms ?? true,
        }
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
      return;
    }

    setIsUploadingPhoto(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const photoURL = await uploadToCloudinary(
        file,
        (progress) => setUploadProgress(progress),
        'profiles'
      );
      
      await updateUserProfilePicture(user!.uid, photoURL);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: 'Failed to update profile picture. Please try again.' });
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.fullName,
      });

      // Update Firestore user data
      const success = await updateUserData(user.uid, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact,
        preferences: formData.preferences,
      });

      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        email: userData.email || '',
        street: userData.street || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        emergencyContact: userData.emergencyContact || '',
        preferences: {
          notifications: userData.preferences?.notifications ?? true,
          marketing: userData.preferences?.marketing ?? false,
          sms: userData.preferences?.sms ?? true,
        }
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account information, address, and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4 sm:mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'personal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Personal Info</span>
                  <span className="sm:hidden">Personal</span>
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'address'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Address
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Preferences</span>
                  <span className="sm:hidden">Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Profile Overview */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {userData.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 sm:p-2 hover:bg-blue-700 transition-colors shadow-md text-xs sm:text-sm"
                    >
                      {isUploadingPhoto ? (
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {/* Upload Progress */}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="text-white text-xs font-medium">{uploadProgress}%</div>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                    {userData.fullName || 'No name set'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{userData.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    userData.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userData.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-4 sm:mt-6 border border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Account Info</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Member since</span>
                    <span className="text-xs sm:text-sm text-gray-900">
                      {userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Last updated</span>
                    <span className="text-xs sm:text-sm text-gray-900">
                      {userData.updatedAt ? new Date(userData.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Status</span>
                    <span className={`text-xs sm:text-sm font-medium ${
                      userData.isBanned ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {userData.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {activeTab === 'personal' && 'Personal Information'}
                    {activeTab === 'address' && 'Address Information'}
                    {activeTab === 'preferences' && 'Preferences & Settings'}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit {activeTab === 'personal' ? 'Profile' : activeTab === 'address' ? 'Address' : 'Preferences'}</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {activeTab === 'personal' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                          />
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              id="dateOfBirth"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Gender
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                    </div>

                    <div>
                          <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Emergency Contact
                      </label>
                      <input
                        type="tel"
                            id="emergencyContact"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                            placeholder="Emergency contact number"
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'address' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Street Address
                          </label>
                          <textarea
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base resize-none"
                            placeholder="Enter your street address"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                        onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                              placeholder="Enter your city"
                      />
                    </div>

                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                              placeholder="Enter your state"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                            placeholder="Enter your pincode"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'preferences' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Notification Preferences</h4>
                          <div className="space-y-3 sm:space-y-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="notifications"
                                checked={formData.preferences.notifications}
                                onChange={handlePreferenceChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">Email notifications</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="sms"
                                checked={formData.preferences.sms}
                                onChange={handlePreferenceChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="marketing"
                                checked={formData.preferences.marketing}
                                onChange={handlePreferenceChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">Marketing communications</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        {isUpdating && (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        )}
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-700 px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {activeTab === 'personal' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                        {userData.fullName || 'Not set'}
                      </p>
                    </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                              {userData.phoneNumber || 'Not set'}
                            </p>
                          </div>
                        </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                        {userData.email}
                      </p>
                    </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date of Birth</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                              {userData.dateOfBirth || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Gender</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                              {userData.gender || 'Not set'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Emergency Contact</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                            {userData.emergencyContact || 'Not set'}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'address' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Street Address</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border min-h-[60px] sm:min-h-[80px] text-sm sm:text-base">
                            {userData.street || 'Not set'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">City</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                              {userData.city || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">State</label>
                            <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                              {userData.state || 'Not set'}
                            </p>
                          </div>
                        </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Pincode</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm sm:text-base">
                            {userData.pincode || 'Not set'}
                      </p>
                    </div>
                      </div>
                    )}

                    {activeTab === 'preferences' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Current Preferences</h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-700">Email notifications</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userData.preferences?.notifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {userData.preferences?.notifications ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-700">SMS notifications</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userData.preferences?.sms ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {userData.preferences?.sms ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-700">Marketing communications</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userData.preferences?.marketing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {userData.preferences?.marketing ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ID Proofs Section */}
              {userData.idProofs && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-4 sm:mt-6 border border-gray-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Identity Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Aadhaar Card</label>
                      <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg border">
                        {userData.idProofs.aadhaar ? (
                          <a
                            href={userData.idProofs.aadhaar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2 text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Document
                          </a>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-2 text-sm">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Not uploaded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">PAN Card</label>
                      <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg border">
                        {userData.idProofs.pan ? (
                          <a
                            href={userData.idProofs.pan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2 text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Document
                          </a>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-2 text-sm">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Not uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

