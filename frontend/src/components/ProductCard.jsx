import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../utils/ToastProvider';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop';

export default function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  images = [],
  inspiredBy = '',
  averageRating = 0,
  totalReviews = 0,
  topNote = '',
  heartNote = '',
  baseNote = '',
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const imageList = useMemo(() => {
    const fromImages = Array.isArray(images) ? images.filter(Boolean) : [];
    if (fromImages.length > 0) return fromImages;
    if (imageUrl) return [imageUrl];
    return [FALLBACK_IMG];
  }, [images, imageUrl]);

  useEffect(() => {
    if (imageList.length <= 1) return;
    if (isImageHovered) return;

    const interval = window.setInterval(() => {
      setCurrentImageIndex((idx) => (idx + 1) % imageList.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [imageList.length, isImageHovered]);

  const safeImageIndex = imageList.length > 0 ? currentImageIndex % imageList.length : 0;
  const mainImg = imageList[safeImageIndex] || FALLBACK_IMG;
  const rating = Number(averageRating) || 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    const res = await addToCart(id, 1);
    if (res?.success) showToast('Added to cart');
    else showToast(res?.message || 'Failed to add');
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    const res = await addToCart(id, 1);
    if (res?.success) {
      showToast('Added to cart');
      navigate('/cart');
    } else showToast(res?.message || 'Failed to add');
  };

  const hasScentNotes = topNote || heartNote || baseNote;

  return (
    <div className="group relative flex flex-col h-full bg-white border border-neutral-200/80 hover:border-neutral-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
      {/* Image area - premium cream background */}
      <Link to={`/product/${slug}`} className="block flex-shrink-0">
        <div
          className="relative aspect-[4/5] bg-[#f8f6f3] overflow-hidden"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <img
            src={mainImg}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />

          {/* Multi-image carousel controls (looping) */}
          {imageList.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((idx) => (idx - 1 + imageList.length) % imageList.length);
                }}
                className="absolute top-1/2 left-2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors duration-200 flex items-center justify-center"
              >
                &lt;
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((idx) => (idx + 1) % imageList.length);
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors duration-200 flex items-center justify-center"
              >
                &gt;
              </button>
            </>
          )}

          {/* Discount badge - refined */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600/90 text-white text-[10px] font-semibold uppercase tracking-wider">
            -33%
          </div>
          {/* Wishlist */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-all duration-200 z-10"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-600'}`} />
          </button>

          {/* Scent notes - Navora-style overlay on right, appears on hover */}
          {hasScentNotes && (
            <div className="absolute inset-0 flex items-center justify-end pr-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[5]">
              <div className="w-[42%] min-w-[100px] h-full bg-gradient-to-l from-white/95 via-white/90 to-transparent pl-6 pr-4 flex flex-col justify-center gap-3">
                {topNote && (
                  <div className="text-right">
                    <span className="inline-block text-[9px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Top</span>
                    <p className="text-[11px] text-neutral-800 leading-snug font-medium">{topNote}</p>
                  </div>
                )}
                {heartNote && (
                  <div className="text-right">
                    <span className="inline-block text-[9px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Heart</span>
                    <p className="text-[11px] text-neutral-800 leading-snug font-medium">{heartNote}</p>
                  </div>
                )}
                {baseNote && (
                  <div className="text-right">
                    <span className="inline-block text-[9px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Base</span>
                    <p className="text-[11px] text-neutral-800 leading-snug font-medium">{baseNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product info - refined typography */}
      <div className="p-5 flex flex-col flex-1 min-h-0">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
            />
          ))}
          {totalReviews > 0 && (
            <span className="text-[11px] text-neutral-500 ml-1">({totalReviews})</span>
          )}
        </div>

        <Link to={`/product/${slug}`} className="block flex-shrink-0 group/link">
          <h3 className="font-medium text-[15px] text-neutral-900 line-clamp-2 mb-1 group-hover/link:text-neutral-700 transition-colors tracking-tight">
            {name}
          </h3>
          {inspiredBy && (
            <p className="text-emerald-700 text-[13px] mb-2 font-medium">Inspired By: {inspiredBy}</p>
          )}
          <p className="text-neutral-900 text-sm font-semibold">On sale from Rs. {Number(price).toFixed(0)}</p>
        </Link>

        {/* Actions */}
        <div className="mt-4 flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 border border-neutral-800 text-neutral-800 text-[12px] font-semibold uppercase tracking-wider hover:bg-neutral-800 hover:text-white transition-all duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-3 px-4 bg-neutral-800 text-white text-[12px] font-semibold uppercase tracking-wider hover:bg-neutral-900 transition-colors duration-200"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
