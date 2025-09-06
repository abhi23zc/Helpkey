
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://readdy.ai/api/search-image?query=Luxury%20hotel%20resort%20with%20palm%20trees%2C%20infinity%20pool%2C%20and%20pristine%20beach%20at%20sunset%2C%20tropical%20paradise%20destination%20with%20crystal%20clear%20water%20and%20white%20sand%2C%20modern%20architecture%20blending%20with%20natural%20beauty%2C%20serene%20atmosphere%20perfect%20for%20vacation%20getaway&width=1920&height=1080&seq=hero-hotel&orientation=landscape')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
              Discover amazing hotels, resorts, and accommodations worldwide with the best prices guaranteed
            </p>
            <div className="mt-12">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Helpkey?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make hotel booking simple, secure, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-blue-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Search
              </h3>
              <p className="text-gray-600">
                Find the perfect hotel with our advanced search filters and real-time availability
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-price-tag-3-line text-2xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Get the lowest prices with our price match guarantee and exclusive deals
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-2-line text-2xl text-purple-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our dedicated support team is available around the clock to help you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Discover India's most incredible places
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://s7ap1.scene7.com/is/image/incredibleindia/taj-mahal-agra-uttar-pradesh-city-1-hero?qlt=82&ts=1726650403456"
                alt="Agra"
                className="w-full h-48 object-cover object-top"
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Agra, India</h3>
                <p className="text-gray-600 mb-4">Home to the iconic Taj Mahal, a symbol of love and architectural marvel</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From ₹2,999/night</span>
                  <span className="text-gray-500">320 hotels</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                alt="Goa"
                className="w-full h-48 object-cover object-top"
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Goa, India</h3>
                <p className="text-gray-600 mb-4">Famous for its golden beaches, vibrant nightlife, and laid-back charm</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From ₹1,499/night</span>
                  <span className="text-gray-500">540 hotels</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://www.agoda.com/wp-content/uploads/2024/05/Nahargarh-Fort-jaipur-india-1244x700.jpg"
                alt="Jaipur"
                className="w-full h-48 object-cover object-top"
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Jaipur, India</h3>
                <p className="text-gray-600 mb-4">The Pink City welcomes you with royal palaces, forts, and vibrant culture</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From ₹1,799/night</span>
                  <span className="text-gray-500">410 hotels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join millions of travelers who trust Helpkey for their perfect stay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer">
              Sign Up Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer">
              Download App
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
