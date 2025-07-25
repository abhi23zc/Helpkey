
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
              Why Choose StayBook?
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
              Explore the world's most amazing places
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://readdy.ai/api/search-image?query=Paris%20France%20with%20iconic%20Eiffel%20Tower%2C%20charming%20cobblestone%20streets%2C%20classic%20French%20architecture%2C%20sidewalk%20cafes%2C%20romantic%20atmosphere%2C%20golden%20hour%20lighting%2C%20beautiful%20cityscape%20with%20historic%20buildings%20and%20modern%20elegance&width=400&height=300&seq=paris-dest&orientation=landscape"
                alt="Paris"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paris, France</h3>
                <p className="text-gray-600 mb-4">The City of Light awaits with its iconic landmarks and romantic charm</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From $89/night</span>
                  <span className="text-gray-500">1,234 hotels</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://readdy.ai/api/search-image?query=Tokyo%20Japan%20with%20modern%20skyscrapers%2C%20traditional%20temples%2C%20cherry%20blossoms%2C%20bustling%20streets%2C%20neon%20lights%2C%20Mt%20Fuji%20in%20distance%2C%20blend%20of%20ancient%20and%20futuristic%20architecture%2C%20vibrant%20urban%20landscape&width=400&height=300&seq=tokyo-dest&orientation=landscape"
                alt="Tokyo"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tokyo, Japan</h3>
                <p className="text-gray-600 mb-4">Experience the perfect blend of traditional culture and modern innovation</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From $125/night</span>
                  <span className="text-gray-500">987 hotels</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
              <img 
                src="https://readdy.ai/api/search-image?query=New%20York%20City%20USA%20with%20Manhattan%20skyline%2C%20yellow%20taxis%2C%20Times%20Square%2C%20Central%20Park%2C%20Brooklyn%20Bridge%2C%20bustling%20streets%2C%20iconic%20skyscrapers%2C%20urban%20energy%2C%20classic%20American%20metropolis%20atmosphere&width=400&height=300&seq=nyc-dest&orientation=landscape"
                alt="New York"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">New York, USA</h3>
                <p className="text-gray-600 mb-4">The city that never sleeps offers endless possibilities and excitement</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">From $156/night</span>
                  <span className="text-gray-500">1,567 hotels</span>
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
            Join millions of travelers who trust StayBook for their perfect stay
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
