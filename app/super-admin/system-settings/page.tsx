'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'BookingPlatform',
    siteDescription: 'Premium hotel booking platform',
    supportEmail: 'support@bookingplatform.com',
    maintenanceMode: false,
    userRegistration: true,
    hotelRegistration: true,
    maxFileSize: 10,
    allowedFileTypes: 'jpg,jpeg,png,pdf'
  });

  const [commissionSettings, setCommissionSettings] = useState({
    defaultCommission: 10,
    premiumCommission: 15,
    minimumPayout: 100,
    payoutSchedule: 'monthly',
    currencySymbol: '$',
    taxRate: 8.5
  });

  const [bookingSettings, setBookingSettings] = useState({
    maxAdvanceBooking: 365,
    minAdvanceBooking: 1,
    cancellationWindow: 24,
    autoConfirmBookings: true,
    requirePayment: true,
    allowModifications: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'system@bookingplatform.com',
    smtpPassword: '********',
    fromEmail: 'noreply@bookingplatform.com',
    fromName: 'BookingPlatform'
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: ''
  });

  const handleGeneralChange = (field: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleCommissionChange = (field: string, value: any) => {
    setCommissionSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingChange = (field: string, value: any) => {
    setBookingSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: string, value: any) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving settings...');
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      console.log('Resetting settings...');
      alert('Settings reset to default values!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure platform settings and parameters</p>
          </div>
          <Link href="/super-admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            Back to Dashboard
          </Link>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'general', label: 'General', icon: 'ri-settings-3-line' },
                { id: 'commission', label: 'Commission', icon: 'ri-money-dollar-circle-line' },
                { id: 'booking', label: 'Booking Rules', icon: 'ri-calendar-check-line' },
                { id: 'email', label: 'Email', icon: 'ri-mail-line' },
                { id: 'security', label: 'Security', icon: 'ri-shield-check-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`${tab.icon} mr-2 w-4 h-4 flex items-center justify-center`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea
                      value={generalSettings.siteDescription}
                      onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={generalSettings.maxFileSize}
                      onChange={(e) => handleGeneralChange('maxFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      value={generalSettings.allowedFileTypes}
                      onChange={(e) => handleGeneralChange('allowedFileTypes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="jpg,jpeg,png,pdf"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => handleGeneralChange('maintenanceMode', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Enable Maintenance Mode</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generalSettings.userRegistration}
                      onChange={(e) => handleGeneralChange('userRegistration', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Allow User Registration</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generalSettings.hotelRegistration}
                      onChange={(e) => handleGeneralChange('hotelRegistration', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Allow Hotel Registration</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commission' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Commission Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Commission (%)</label>
                    <input
                      type="number"
                      value={commissionSettings.defaultCommission}
                      onChange={(e) => handleCommissionChange('defaultCommission', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Premium Commission (%)</label>
                    <input
                      type="number"
                      value={commissionSettings.premiumCommission}
                      onChange={(e) => handleCommissionChange('premiumCommission', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout Amount</label>
                    <input
                      type="number"
                      value={commissionSettings.minimumPayout}
                      onChange={(e) => handleCommissionChange('minimumPayout', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                    <select
                      value={commissionSettings.payoutSchedule}
                      onChange={(e) => handleCommissionChange('payoutSchedule', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                    <input
                      type="text"
                      value={commissionSettings.currencySymbol}
                      onChange={(e) => handleCommissionChange('currencySymbol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={commissionSettings.taxRate}
                      onChange={(e) => handleCommissionChange('taxRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Booking Rules</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Advance Booking (days)</label>
                    <input
                      type="number"
                      value={bookingSettings.maxAdvanceBooking}
                      onChange={(e) => handleBookingChange('maxAdvanceBooking', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Advance Booking (days)</label>
                    <input
                      type="number"
                      value={bookingSettings.minAdvanceBooking}
                      onChange={(e) => handleBookingChange('minAdvanceBooking', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Window (hours)</label>
                    <input
                      type="number"
                      value={bookingSettings.cancellationWindow}
                      onChange={(e) => handleBookingChange('cancellationWindow', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bookingSettings.autoConfirmBookings}
                      onChange={(e) => handleBookingChange('autoConfirmBookings', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Auto-confirm Bookings</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bookingSettings.requirePayment}
                      onChange={(e) => handleBookingChange('requirePayment', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Require Payment at Booking</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bookingSettings.allowModifications}
                      onChange={(e) => handleBookingChange('allowModifications', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Allow Booking Modifications</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => handleEmailChange('smtpPort', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => handleEmailChange('smtpUsername', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => handleEmailChange('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => handleEmailChange('fromName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                    <input
                      type="text"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => handleSecurityChange('ipWhitelist', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="192.168.1.1,10.0.0.1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => handleSecurityChange('requireSpecialChars', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Require Special Characters in Password</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm text-gray-700">Enable Two-Factor Authentication</label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}