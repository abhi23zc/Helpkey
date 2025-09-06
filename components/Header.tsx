"use client";

import { useState } from "react";
import Link from "next/link";
import SignInModal from "./SignInModal";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/hotels", label: "Hotels" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Close dropdown on click outside
  // (Optional: can be added with useEffect and ref for more polish)

  return (
    <header className="bg-white shadow-md sticky top-0 z-30 transition-shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          {/* <span className="inline-block animate-pulse"></span> */}
          <span className="inline-block">HelpKey</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-gray-600 font-medium px-2 py-1 transition-colors duration-200 hover:text-blue-600 after:content-[''] after:block after:h-0.5 after:bg-blue-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User / Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          {!loading &&
            (user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="truncate max-w-[120px]">
                    {user.displayName || user.email}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-20 transition-all duration-200 origin-top-right ${
                    isDropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  onMouseLeave={closeDropdown}
                >
                  <Link
                    href="/bookings"
                    className="block px-5 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-5 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin"
                    className="block px-5 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                  >
                    Admin
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-5 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                Sign In
              </button>
            ))}
          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <svg
              className={`w-7 h-7 transition-transform duration-200 ${
                isMobileMenuOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-30 z-20 transition-opacity duration-200 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
      ></div>
      <nav
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-30 transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600"
              onClick={toggleMobileMenu}
            >
              HelpKey
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-2 px-6 py-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 text-lg font-medium py-2 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={toggleMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/bookings"
                    className="text-gray-700 text-lg font-medium py-2 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-700 text-lg font-medium py-2 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin"
                    className="text-gray-700 text-lg font-medium py-2 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Admin
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      toggleMobileMenu();
                    }}
                    className="text-left w-full text-gray-700 text-lg font-medium py-2 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsSignInModalOpen(true);
                    toggleMobileMenu();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  Sign In
                </button>
              ))}
          </div>
        </div>
      </nav>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </header>
  );
}
