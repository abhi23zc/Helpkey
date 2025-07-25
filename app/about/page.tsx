
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function About() {
  const stats = [
    { label: "Hotels Worldwide", value: "50,000+" },
    { label: "Happy Customers", value: "2M+" },
    { label: "Countries", value: "180+" },
    { label: "Years of Experience", value: "15+" }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Travel enthusiast with 20+ years in hospitality industry",
      image: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20CEO%20portrait%2C%20confident%20smile%2C%20modern%20office%20background%2C%20executive%20attire%2C%20leadership%20presence%2C%20corporate%20headshot%2C%20professional%20lighting&width=300&height=300&seq=team-1&orientation=squarish"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech visionary building the future of travel booking",
      image: "https://readdy.ai/api/search-image?query=Professional%20businessman%20CTO%20portrait%2C%20confident%20expression%2C%20modern%20tech%20office%20background%2C%20business%20casual%20attire%2C%20innovative%20leader%2C%20corporate%20headshot%2C%20professional%20lighting&width=300&height=300&seq=team-2&orientation=squarish"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      bio: "Operations expert ensuring seamless travel experiences",
      image: "https://readdy.ai/api/search-image?query=Professional%20businesswoman%20operations%20manager%20portrait%2C%20warm%20smile%2C%20modern%20office%20background%2C%20professional%20attire%2C%20operations%20leadership%2C%20corporate%20headshot%2C%20professional%20lighting&width=300&height=300&seq=team-3&orientation=squarish"
    },
    {
      name: "David Thompson",
      role: "Head of Customer Success",
      bio: "Dedicated to creating exceptional customer experiences",
      image: "https://readdy.ai/api/search-image?query=Professional%20businessman%20customer%20success%20manager%20portrait%2C%20friendly%20expression%2C%20modern%20office%20background%2C%20business%20attire%2C%20customer%20focused%20leader%2C%20corporate%20headshot%2C%20professional%20lighting&width=300&height=300&seq=team-4&orientation=squarish"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://readdy.ai/api/search-image?query=Modern%20office%20building%20with%20glass%20facade%2C%20professional%20corporate%20headquarters%2C%20team%20collaboration%2C%20business%20meeting%2C%20innovative%20workplace%2C%20contemporary%20architecture%2C%20success%20and%20growth%20atmosphere&width=1920&height=600&seq=about-hero&orientation=landscape')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              About StayBook
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              We're passionate about making travel accessible, affordable, and unforgettable for everyone
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To revolutionize the way people discover, book, and experience accommodations worldwide by providing a seamless, trustworthy, and personalized platform that connects travelers with their perfect stay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-global-line text-2xl text-blue-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Connect travelers with accommodations in over 180 countries worldwide
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-2xl text-green-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust & Security</h3>
              <p className="text-gray-600">
                Secure booking platform with verified properties and 24/7 customer support
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-line text-2xl text-purple-600 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Experience</h3>
              <p className="text-gray-600">
                AI-powered recommendations tailored to your preferences and travel style
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  StayBook was founded in 2009 by a group of travel enthusiasts who experienced firsthand the challenges of finding reliable, affordable accommodations while exploring the world. We noticed a gap in the market for a platform that truly understood travelers' needs.
                </p>
                <p>
                  Starting with just 100 hotels in 5 countries, we've grown to become one of the world's leading hotel booking platforms. Our success is built on three core principles: transparency, reliability, and exceptional customer service.
                </p>
                <p>
                  Today, we're proud to serve millions of travelers worldwide, helping them create unforgettable memories while exploring new destinations. Our commitment to innovation and customer satisfaction drives us to continuously improve and expand our services.
                </p>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Company%20founders%20working%20together%20in%20modern%20startup%20office%2C%20collaborative%20atmosphere%2C%20diverse%20team%20brainstorming%2C%20laptops%20and%20whiteboards%2C%20innovative%20workspace%2C%20entrepreneurial%20spirit%2C%20business%20growth%20story&width=600&height=400&seq=story-img&orientation=landscape"
                alt="Our Story"
                className="rounded-lg shadow-lg object-cover object-top w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The passionate people behind StayBook's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden text-center">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover object-top"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <i className="ri-lightbulb-line text-3xl text-yellow-500 mb-4 w-8 h-8 flex items-center justify-center"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to improve the travel booking experience through cutting-edge technology and user-centric design.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <i className="ri-team-line text-3xl text-blue-500 mb-4 w-8 h-8 flex items-center justify-center"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                We believe in honest, transparent business practices and building trust with our customers, partners, and team members.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <i className="ri-customer-service-line text-3xl text-green-500 mb-4 w-8 h-8 flex items-center justify-center"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do. We strive to exceed expectations and create exceptional experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
