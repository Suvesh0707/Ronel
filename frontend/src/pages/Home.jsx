import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import axios from '../api/axios';

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price
 * @property {string} image_url
 * @property {string} category
 * @property {number} is_featured
 */

const stats = [
  { value: '1k+', label: 'Happy Customers', icon: Award },
  { value: '20+', label: 'Unique Fragrances', icon: Sparkles },
  { value: '28 states', label: 'Pan India', icon: TrendingUp },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Fashion Designer',
    text: 'Ronel perfumes have become an essential part of my daily routine. The quality and sophistication are unmatched.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    text: 'I have tried countless fragrances, but nothing compares to the elegance and lasting power of Ronel.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Lifestyle Blogger',
    text: 'The attention to detail in every bottle is remarkable. Truly a luxury experience from start to finish.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data } = await axios.get('/perfumes/trending/top');
        // Ensure data is an array
        setFeaturedProducts(Array.isArray(data.perfumes) ? data.perfumes : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-black/5 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-black/10 animate-fadeInUp">
            <Sparkles className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium tracking-wider text-gray-700">LUXURY COLLECTION 2026</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-tight text-black mb-8 animate-fadeInUp">
            <span className="block mb-2">Timeless</span>
            <span className="block gradient-text">Elegance</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl  md:text-2xl lg:text-3xl text-black max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-fadeInUp">
            Experience fragrances that capture the essence of sophistication and leave a lasting impression
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-fadeInUp">
            <Link 
              to="/shop"
              className="group relative px-10 py-5 bg-black text-white font-medium tracking-wider overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 btn-premium transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Link>
            
            <Link 
              to="/about"
              className="group px-10 py-5 bg-white text-black font-medium tracking-wider border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center space-x-2">
                <span>OUR STORY</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fadeInUp">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:border-black/20 transition-all duration-300 transform hover:-translate-y-1">
                  <stat.icon className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-black">{stat.value}</div>
                  <div className="text-sm text-gray-600 tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-black/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-black/30 rounded-full" />
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-black/5 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-sm font-medium tracking-wider text-black">HANDPICKED FOR YOU</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-black mb-6">
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our most beloved fragrances, each crafted to perfection
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl mb-4 animate-shimmer" />
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3 animate-shimmer" />
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-shimmer" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div 
                  key={product._id}
                >
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    slug={product.name.toLowerCase().replace(/\s+/g, '-')}
                    price={product.price}
                    imageUrl={product.images?.[0]}
                    images={product.images}
                    category={product.fragrance || product.fragranceType}
                    inspiredBy={product.inspiredBy}
                    averageRating={product.averageRating ?? 0}
                    totalReviews={product.totalReviews ?? 0}
                    topNote={product.topNote}
                    heartNote={product.heartNote}
                    baseNote={product.baseNote}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link 
              to="/shop"
              className="group inline-flex items-center space-x-3 px-10 py-5 bg-black text-white font-medium tracking-wider hover:bg-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 btn-premium"
            >
              <span>VIEW FULL COLLECTION</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Parallax Image Section */}
      <section className="relative h-[700px] bg-black overflow-hidden">
        <div className="absolute inset-0 parallax-container">
          <img 
            src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=2000"
            alt="Luxury perfume"
            className="w-full h-full object-cover opacity-70 parallax-image"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight">
                The Art of
                <br />
                <span className="italic">Perfumery</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
                Each fragrance is a masterpiece, meticulously crafted with the world's finest ingredients by master perfumers.
              </p>
              <Link 
                to="/about"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-black font-medium tracking-wider hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1"
              >
                <span>DISCOVER OUR CRAFT</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif text-black mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by thousands of fragrance enthusiasts worldwide
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  index === activeTestimonial
                    ? 'opacity-100 scale-100 relative z-10'
                    : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-24 h-24 rounded-full object-cover mb-8 border-4 border-gray-100 shadow-lg"
                    />
                    <p className="text-2xl text-gray-700 mb-8 leading-relaxed italic font-light">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <div className="font-serif text-xl font-semibold text-black mb-1">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-500 text-sm tracking-wide">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Dots */}
            <div className="flex items-center justify-center space-x-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === activeTestimonial
                      ? 'w-12 h-3 bg-black'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      
      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Join Our Exclusive Circle
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Be the first to discover new fragrances, exclusive offers, and insider news from the world of Ronel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="w-full sm:flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
            />
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-medium tracking-wider hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 btn-premium">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
