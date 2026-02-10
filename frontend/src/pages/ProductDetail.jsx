import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, Package, Shield, Truck, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../utils/ToastProvider';

const DELIVERY_SAVINGS = 30; // You saved ₹30 (delivered free)

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const prevProductIdRef = useRef(null);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const { data } = await axios.get('/perfumes');
        const perfumes = Array.isArray(data.perfumes) ? data.perfumes : [];
        const foundProduct = perfumes.find(p =>
          p.name.toLowerCase().replace(/\s+/g, '-') === slug
        );
        if (foundProduct) {
          setProduct(foundProduct);
          setCurrentImageIndex(0);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProductData();
  }, [slug]);

  const fetchReviews = useCallback(async (page = 1) => {
    if (!product?._id) return;
    try {
      const { data } = await axios.get(`/reviews/perfume/${product._id}`, {
        params: { page, limit: 6 },
      });
      if (data.success) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating ?? 0);
        setTotalReviews(data.totalReviews ?? 0);
        setReviewPage(data.page ?? 1);
        setReviewTotalPages(data.totalPages ?? 1);
      }
    } catch {}
  }, [product?._id]);

  useEffect(() => {
    if (!product?._id) return;
    if (prevProductIdRef.current !== product._id) {
      prevProductIdRef.current = product._id;
      setReviewPage(1);
      fetchReviews(1);
      return;
    }
    fetchReviews(reviewPage);
  }, [product?._id, reviewPage, fetchReviews]);

  useEffect(() => {
    if (!product?._id) return;
    axios.get(`/perfumes/related/${product._id}`, { params: { limit: 4 } })
      .then(({ data }) => {
        if (data.success) setRelatedProducts(data.perfumes || []);
      })
      .catch(() => {});
  }, [product?._id]);

  useEffect(() => {
    if (!product?._id) return;
    axios.get(`/reviews/can-review/${product._id}`)
      .then(({ data }) => data.success && data.canReview && setCanReview(true))
      .catch(() => {});
  }, [product?._id]);

  const handleAddToCart = async () => {
    if (!product?._id) return;
    const res = await addToCart(product._id, quantity);
    if (res.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } else {
      showToast(res.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!product?._id) return;
    const res = await addToCart(product._id, quantity);
    if (res.success) navigate("/cart");
    else showToast(res.message || "Failed to add to cart");
  };

  const handleNextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleSubmitReview = async (rating, comment) => {
    if (!product?._id || rating < 1 || rating > 5) return;
    setReviewSubmitting(true);
    try {
      await axios.post('/reviews', { perfumeId: product._id, rating, comment: comment || undefined });
      setCanReview(false);
      fetchReviews(reviewPage);
      showToast('Thank you! Your review has been submitted.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-gray-900 mb-4">Product not found</h1>
        <Link 
          to="/shop" 
          className="px-6 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-900 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Only show average from real user reviews (users decide 1–5 stars); no auto rating
  const rating = averageRating;
  const discountedPrice = product.price * 1.2;
  const discountPercent = Math.round(((discountedPrice - product.price) / discountedPrice) * 100);
  const noteItems = [
    product.topNote && { label: 'Top', name: product.topNote },
    product.heartNote && { label: 'Heart', name: product.heartNote },
    product.baseNote && { label: 'Base', name: product.baseNote },
  ].filter(Boolean);
  if (noteItems.length === 0 && product.fragrance) {
    noteItems.push({ label: 'Fragrance', name: product.fragrance });
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back button */}
        <Link 
          to="/shop"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-black transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Shop</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-2xl relative group">
              <img 
                src={product.images?.[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Image navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-black transform rotate-180" />
                  </button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-full text-sm font-medium">
                    {currentImageIndex + 1}/{product.images.length}
                  </div>
                </>
              )}

              {/* Wishlist button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'
                  }`}
                />
              </button>
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      currentImageIndex === index 
                        ? 'border-black shadow-lg' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            {/* Category badge */}
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
              <span className="text-xs font-semibold text-gray-700 tracking-wider">
                {product.fragrance?.toUpperCase() || product.fragranceType?.toUpperCase() || 'PERFUME'}
              </span>
            </div>
            
            {/* Product name */}
            <h1 className="text-5xl lg:text-6xl font-serif text-black mb-6 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating: only from user reviews (1–5 chosen by users); average of all */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-700">
                {totalReviews > 0 ? Number(rating).toFixed(1) : '—'}
              </span>
              <span className="text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
            {totalReviews === 0 && (
              <p className="text-sm text-gray-500 mb-2">No reviews yet. You can rate 1–5 stars after delivery from My Orders.</p>
            )}
            {/* Delivered in 2-4 days (not 36 hours) */}
            <p className="text-sm text-gray-600 mb-2">Delivered in 2–4 days</p>
            {/* Delivered free - You saved ₹30 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl mb-8">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Delivered free — You saved ₹{DELIVERY_SAVINGS}</span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline space-x-4 mb-8">
              <div className="text-5xl font-bold text-black">₹{product.price.toFixed(0)}</div>
              <div className="text-2xl text-gray-400 line-through">₹{discountedPrice.toFixed(0)}</div>
              <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                SAVE {discountPercent}%
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <p className="text-lg text-gray-600 leading-relaxed mb-10">{product.description}</p>
            )}
            
            {/* Product details */}
            <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
              <h3 className="text-sm font-bold tracking-wider mb-6 text-black">PRODUCT DETAILS</h3>
              <div className="space-y-4">
                {product.intensity && (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Intensity</span>
                    <span className="text-gray-900 font-semibold capitalize">{product.intensity}</span>
                  </div>
                )}
                {product.volume && (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Volume</span>
                    <span className="text-gray-900 font-semibold">{product.volume} ml</span>
                  </div>
                )}
                {product.inspiredBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Inspired By</span>
                    <span className="text-gray-900 font-semibold">{product.inspiredBy}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navora-style fragrance notes: Top / Heart / Base — hover shows same name, small images left & right */}
            {noteItems.length > 0 && (
              <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold tracking-wider mb-6 text-black">FRAGRANCE NOTES</h3>
                <div className="space-y-6">
                  {noteItems.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                    >
                      {/* Left: small image */}
                      {product.images?.[0] && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      {/* Middle: label + name (name appears on hover like Navora) */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{item.label}</span>
                        <p className="mt-0.5 font-medium text-gray-900 capitalize truncate group-hover:opacity-100 opacity-90" title={item.name}>
                          {item.name}
                        </p>
                      </div>
                      {/* Right: small image (second if available) */}
                      {product.images?.[1] ? (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={product.images[1]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : product.images?.[0] && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div className="mb-10">
              <h3 className="text-sm font-bold tracking-wider mb-4 text-black">QUANTITY</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-8 font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-4 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${(product.stock || 0) > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-gray-600">
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                className="flex-1 relative flex items-center justify-center space-x-3 px-8 py-5 bg-black text-white font-bold tracking-wider hover:bg-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 rounded-lg overflow-hidden group"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="px-8 py-5 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-bold tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1 rounded-lg"
              >
                BUY NOW
              </button>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹2000' },
                { icon: Shield, title: 'Authentic', desc: '100% guaranteed' },
                { icon: Package, title: 'Easy Returns', desc: '30-day policy' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-black mb-1">{feature.title}</div>
                    <div className="text-xs text-gray-600">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Customer Reviews — average of all users' star ratings; user can rate here if they purchased */}
        <div className="mt-32">
          <div className="text-center mb-10">
            <h2 className="text-5xl md:text-6xl font-serif text-black mb-6">Customer Reviews</h2>
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-7 h-7 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-2xl font-medium text-gray-700">
                {totalReviews > 0 ? Number(averageRating).toFixed(1) : '—'} out of 5
              </span>
            </div>
            {totalReviews > 0 ? (
              <p className="text-gray-500 mt-2">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            ) : (
              <p className="text-gray-500 mt-2">No reviews yet. Rate after delivery from this page or <Link to="/orders" className="text-black underline font-medium">My Orders</Link>.</p>
            )}
          </div>

          {/* Inline review form — so user can rate directly from product page (e.g. after opening from card) */}
          {canReview && (
            <div className="max-w-xl mx-auto mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-black mb-3">You purchased this — rate it (1–5 stars)</h3>
              <ProductDetailReviewForm onSubmit={handleSubmitReview} submitting={reviewSubmitting} />
            </div>
          )}

          {reviews.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="mb-4">
                      <div className="font-bold text-lg text-black mb-2">{review.user?.name || 'Customer'}</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
              {/* Pagination - only show when more than one page */}
              {reviewTotalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage <= 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: reviewTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setReviewPage(p)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          reviewPage === p
                            ? 'bg-black text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                    disabled={reviewPage >= reviewTotalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No reviews yet. Reviews appear after delivery.</p>
          )}

          {/* You may also like */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-4xl md:text-5xl font-serif text-black mb-10 text-center">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    id={p._id}
                    name={p.name}
                    slug={p.name.toLowerCase().replace(/\s+/g, '-')}
                    price={p.price}
                    imageUrl={p.images?.[0]}
                    images={p.images}
                    category={p.fragrance || p.fragranceType}
                    inspiredBy={p.inspiredBy}
                    averageRating={p.averageRating ?? 0}
                    totalReviews={p.totalReviews ?? 0}
                    topNote={p.topNote}
                    heartNote={p.heartNote}
                    baseNote={p.baseNote}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetailReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    onSubmit(rating, comment.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{rating ? `${rating} of 5` : 'Choose stars'}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional: share your experience..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20 mb-3"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={submitting || rating < 1}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
