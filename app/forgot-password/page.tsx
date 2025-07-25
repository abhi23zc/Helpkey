'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email/phone, 2: verification, 3: reset password, 4: success
  const [resetMethod, setResetMethod] = useState('email'); // 'email' or 'phone'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const contactField = resetMethod === 'email' ? formData.email : formData.phone;
    
    if (!contactField) {
      alert(`Please enter your ${resetMethod === 'email' ? 'email address' : 'phone number'}`);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      alert('Please enter the 6-digit verification code');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 1500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.newPassword || !formData.confirmPassword) {
      alert('Please fill in all password fields');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 1500);
  };

  const handleResendCode = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {step === 1 && 'Reset Your Password'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
              {step === 4 && 'Password Reset Complete'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1 && 'Enter your email or phone number to receive a verification code'}
              {step === 2 && `We've sent a 6-digit code to your ${resetMethod === 'email' ? 'email' : 'phone'}`}
              {step === 3 && 'Please enter your new password'}
              {step === 4 && 'Your password has been successfully reset'}
            </p>
          </div>

          {/* Step 1: Email/Phone Input */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* Method Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setResetMethod('email')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      resetMethod === 'email'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <i className="ri-mail-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetMethod('phone')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      resetMethod === 'phone'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <i className="ri-phone-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
                    Phone
                  </button>
                </div>

                {resetMethod === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-mail-send-line text-2xl text-blue-600 w-8 h-8 flex items-center justify-center"></i>
                  </div>
                  <p className="text-sm text-gray-600">
                    Code sent to{' '}
                    <span className="font-medium text-gray-900">
                      {resetMethod === 'email' ? formData.email : formData.phone}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <div className="mt-4 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in {countdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-2xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Back to Sign In Link */}
          {step < 4 && (
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}