
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Pacifico, serif' }}>
              Helpkey
            </h3>
            <p className="text-gray-400">
              Your trusted partner for finding the perfect accommodation worldwide.
            </p>
            <div className="flex space-x-4 mt-4">
              <i className="ri-facebook-fill text-2xl hover:text-blue-400 cursor-pointer w-6 h-6 flex items-center justify-center"></i>
              <i className="ri-twitter-fill text-2xl hover:text-blue-400 cursor-pointer w-6 h-6 flex items-center justify-center"></i>
              <i className="ri-instagram-fill text-2xl hover:text-blue-400 cursor-pointer w-6 h-6 flex items-center justify-center"></i>
              <i className="ri-linkedin-fill text-2xl hover:text-blue-400 cursor-pointer w-6 h-6 flex items-center justify-center"></i>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white cursor-pointer">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-gray-400 hover:text-white cursor-pointer">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-400 hover:text-white cursor-pointer">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white cursor-pointer">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white cursor-pointer">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2">
              <p className="text-gray-400 flex items-center">
                <i className="ri-phone-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                8354040412
              </p>
              <p className="text-gray-400 flex items-center">
                <i className="ri-mail-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                helpkey@gmail.com
              </p>
              <p className="text-gray-400 flex items-center">
                <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                Kanpur, India
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Helpkey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
