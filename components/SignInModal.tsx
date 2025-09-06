'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth, googleProvider, db } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [signInData, setSignInData] = useState({
    email: '',
    phone: '',
    password: '',
    rememberMe: false
  });

  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Store user in Firestore
  const storeUserInFirestore = async (user: any, userData: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullName: userData.fullName || user.displayName || '',
        email: user.email || '',
        phoneNumber: userData.phone || '',
        photoURL: user.photoURL || '',
        role: 'user',
        isBanned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // Optionally handle error
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (loginMethod === 'phone') {
      setError('Phone authentication is not implemented yet');
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const requiredFields = [
      signUpData.firstName,
      signUpData.lastName,
      signUpData.email,
      signUpData.password,
      signUpData.confirmPassword
    ];

    if (requiredFields.some(field => !field.trim())) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.agreeToTerms) {
      setError('Please agree to the Terms & Conditions');
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpData.email,
        signUpData.password
      );
      await updateProfile(userCredential.user, {
        displayName: `${signUpData.firstName} ${signUpData.lastName}`
      });
      await storeUserInFirestore(userCredential.user, {
        fullName: `${signUpData.firstName} ${signUpData.lastName}`,
        phone: signUpData.phone
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // @ts-ignore
      const isNewUser = result._tokenResponse?.isNewUser;
      if (isNewUser) {
        await storeUserInFirestore(result.user, {
          fullName: result.user.displayName
        });
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Account Created!'}
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            {activeTab === 'signin'
              ? 'You have successfully signed in to your account.'
              : 'Your account has been created successfully.'}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Close"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 text-center font-medium rounded-lg transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              type="button"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-center font-medium rounded-lg transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              type="button"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    loginMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:text-blue-700'
                  }`}
                >
                  Phone
                </button>
              </div>

              {loginMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={signInData.email}
                    onChange={handleSignInChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={signInData.phone}
                    onChange={handleSignInChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                    placeholder="Enter your phone number"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={signInData.rememberMe}
                    onChange={handleSignInChange}
                    className="accent-blue-600"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={signUpData.firstName}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={signUpData.lastName}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={signUpData.phone}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  placeholder="Create a password"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={signUpData.agreeToTerms}
                  onChange={handleSignUpChange}
                  required
                  className="accent-blue-600"
                />
                <label className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Social Sign In */}
        <div className="px-6 pb-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.23l6.9-6.9C35.6 2.6 30.2 0 24 0 14.8 0 6.7 5.8 2.7 14.1l8.1 6.3C12.7 13.7 17.9 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.7-2.1 5-4.4 6.6l7 5.4c4.1-3.8 6.5-9.4 6.5-16.5z"/>
                  <path fill="#FBBC05" d="M10.8 28.2c-1-2.7-1-5.7 0-8.4l-8.1-6.3C.6 17.7 0 20.8 0 24c0 3.2.6 6.3 1.7 9.2l8.1-6.3z"/>
                  <path fill="#EA4335" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7-5.4c-2 1.4-4.6 2.2-8.2 2.2-6.1 0-11.3-4.1-13.2-9.6l-8.1 6.3C6.7 42.2 14.8 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg bg-white text-gray-400 cursor-not-allowed font-medium shadow-sm"
              title="Facebook sign in coming soon"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}