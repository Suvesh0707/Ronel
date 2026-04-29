import { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal, Grid3x3, LayoutGrid, ChevronDown } from 'lucide-react';
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
 */

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [gridView, setGridView] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const [heroSettings, setHeroSettings] = useState({
    image: null,
    heading: 'Our Collection',
    subtitle: 'Discover your signature scent from our curated selection',
    textColor: '#ffffff',
  });
  
  // Categories based on API fragrance types
  const categories = ['All', 'floral', 'aromatic', 'citrus', 'woody', 'aquatic', 'strong', 'light'];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get('/perfumes');
        // Ensure data is an array
        setProducts(Array.isArray(data.perfumes) ? data.perfumes : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);
  useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const { data } = await axios.get('/settings/hero?section=shop');
        if (data?.settings) {
          setHeroSettings({
            image: data.settings.image || null,
            heading: data.settings.heading || 'Our Collection',
            subtitle: data.settings.subtitle || 'Discover your signature scent from our curated selection',
            textColor: data.settings.textColor || '#ffffff',
          });
        }
      } catch (error) {
        console.error('Failed to load shop hero settings:', error);
      }
    }

    fetchHeroSettings();
  }, []);
  const filteredProducts = !Array.isArray(products) ? [] : (selectedCategory === 'All' 
    ? products 
    : products.filter(p => (p.fragrance || p.fragranceType) === selectedCategory));

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return b.featured - a.featured;
    }
  });

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroSettings.image || 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1600'}')` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif mb-6 animate-fadeInUp" style={{ color: heroSettings.textColor }}>
            {heroSettings.heading}
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s', color: heroSettings.textColor }}>
            {heroSettings.subtitle}
          </p>
          <div className="mt-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <span className="text-sm font-medium tracking-wider">{sortedProducts.length} Fragrances</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Shop Content */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Category Filters */}
              <div className="flex-1 w-full lg:w-auto">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 text-sm font-medium text-gray-700 mb-4"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700 tracking-wide">CATEGORY</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg ${
                          selectedCategory === category
                            ? 'bg-black text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:border-black hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sort & View Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                
                {/* View Toggle */}
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setGridView(4)}
                    className={`p-2 rounded transition-all ${
                      gridView === 4 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setGridView(3)}
                    className={`p-2 rounded transition-all ${
                      gridView === 3 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          {loading ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridView === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl mb-4 animate-shimmer" />
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3 animate-shimmer" />
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-shimmer" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-lg mb-6">Try adjusting your filters</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-6 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-900 transition-colors rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridView === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 items-stretch`}>
                {sortedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="h-full min-h-0"
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
              
              {/* Results info */}
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  Showing <span className="font-medium text-black">{sortedProducts.length}</span> {sortedProducts.length === 1 ? 'product' : 'products'}
                  {selectedCategory !== 'All' && (
                    <> in <span className="font-medium text-black">{selectedCategory}</span></>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get personalized fragrance recommendations from our experts
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-black font-medium tracking-wider hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 btn-premium"
          >
            CONTACT US
          </a>
        </div>
      </section>
    </div>
  );
}
