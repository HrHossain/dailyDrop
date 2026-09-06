import { useState } from "react";
import {
  Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck,
  Clock, Leaf, ChevronRight,
  HomeIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CarContext";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPopularProducts } from "../api/products";

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}


const sampleReviews: Review[] = [
  {
    id: "r1",
    name: "Nusrat Jahan",
    rating: 5,
    date: "2026-06-14",
    comment: "Still fresh when it arrived, which I didn't expect from delivery. Exactly as described.",
  },
  {
    id: "r2",
    name: "Tanvir Ahmed",
    rating: 5,
    date: "2026-06-09",
    comment: "Ordered this three weeks running now. Quality's been consistent every single time.",
  },
  {
    id: "r3",
    name: "Farhana Islam",
    rating: 5,
    date: "2026-05-28",
    comment: "Bought this for a small get-together and everyone asked where it was from.",
  },
  {
    id: "r4",
    name: "Rakib Hasan",
    rating: 4,
    date: "2026-05-20",
    comment: "Good value for the price. Delivery was a bit later than the estimate but the product itself was fine.",
  },
  {
    id: "r5",
    name: "Sadia Rahman",
    rating: 5,
    date: "2026-05-11",
    comment: "This has become part of my regular order now. Packaging keeps everything from getting damaged too.",
  },
];


export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

 
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchPopularProducts(`/products/${id}`),
    enabled: !!id, // আইডি থাকলেই কেবল কুয়েরি রান হবে
  });

  const { data: relatedData, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['related-products', data?.data?.data?.category, id],
    queryFn: ()=>fetchPopularProducts(`/products?category=${data?.data?.data?.category}`),
    enabled: !!data?.data?.data?.category && !!id, // কেবল তখনই রান হবে যখন প্রোডাক্ট ডেটা লোড হয়েছে এবং আইডি আছে
  });

  // ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী ডেটা এক্সট্রাক্ট করা
  const product = data?.data?.data || [] 
  
  if (isLoading) return <Loading />;
  if (isError || !product) return <div className="text-center py-20 text-tomato">Product not found or error loading.</div>;

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCart = !!cartItem;
  const displayQuantity = inCart ? cartItem.quantity : localQuantity;

  const categoryLabel = product.category ? product.category.replace(/-/g, " ") : "";

  const {
    name, description, price, originalPrice, image, category,
    unit, stock, isOrganic, rating, reviewCount, discount,
  } = product;

  

  const savings = originalPrice > price ? originalPrice - price : 0;
  const lowStock = stock > 0 && stock <= 10;
  const outOfStock = stock <= 0;
  const relatedProductsBySliced = relatedData?.data?.data || [];


  function handleDecrease() {
    if (inCart && cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(product.id);
      } else {
        updateQuantity(product.id, cartItem.quantity - 1);
      }
    } else {
      setLocalQuantity((q) => Math.max(1, q - 1));
    }
  }

  function handleIncrease() {
    if (inCart && cartItem) {
      updateQuantity(product.id, Math.min(stock, cartItem.quantity + 1));
    } else {
      setLocalQuantity((q) => Math.min(stock, q + 1));
    }
  }

  function handleAddToCart() {
    if (!inCart) {
      addToCart(product, localQuantity);
    } else {
      setIsCartOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-container mx-auto px-gutter py-10 lg:py-18">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-sans text-caption text-charcoal-400 mb-8">
          <Link to="/" className="hover:text-forest-700"><HomeIcon className="size-4" /></Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="capitalize hover:text-forest-700">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/products?category=${category}`} className="capitalize hover:text-forest-700">{categoryLabel}</Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ---------------- Image ---------------- */}
          <div className="relative bg-white rounded-card shadow-card p-10 flex items-center justify-center h-80 sm:h-96 lg:h-[28rem]">
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-tomato text-white font-sans text-caption font-semibold px-3 py-1 rounded-drop">
                {discount}% OFF
              </span>
            )}
            {isOrganic && (
              <span className="absolute top-4 right-4 flex items-center gap-1 bg-leaf-100 text-leaf-700 font-sans text-caption font-medium px-3 py-1 rounded-drop">
                <Leaf className="w-3 h-3" /> Organic
              </span>
            )}
            <img
              src={image}
              alt={name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* ---------------- Details ---------------- */}
          <div className="flex flex-col">
            <span className="font-sans text-caption text-leaf-700 font-medium uppercase tracking-wide mb-2">
              {category}
            </span>
            <h1 className="font-display font-bold text-h1 text-forest-700 mb-3">{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(rating || 0) ? "text-gold fill-gold" : "text-mist-200 fill-mist-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-sans text-small text-charcoal-600">
                {rating || 0} <span className="text-charcoal-400">({reviewCount || 0} reviews)</span>
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-h1 font-bold text-forest-700">৳{price}</span>
              {originalPrice > price && (
                <span className="font-mono text-h4 text-charcoal-400 line-through">৳{originalPrice}</span>
              )}
            </div>
            {savings > 0 && (
              <p className="font-sans text-small text-tomato font-medium mb-6">
                You save ৳{savings} ({discount}%)
              </p>
            )}

            {/* Description */}
            <p className="font-sans text-body text-charcoal-600 mb-6">{description}</p>

            {/* Unit + stock */}
            <div className="flex items-center gap-4 mb-6 font-sans text-small">
              <span className="text-charcoal-600">
                Unit: <span className="font-medium text-charcoal">{unit}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-mist-200" />
              {outOfStock ? (
                <span className="text-tomato font-medium">Out of stock</span>
              ) : lowStock ? (
                <span className="text-mango-700 font-medium">Only {stock} left</span>
              ) : (
                <span className="text-leaf-700 font-medium">In stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center border border-mist-200 rounded-pill bg-white">
                <button
                  onClick={handleDecrease}
                  disabled={outOfStock}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:text-forest-700 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-body font-semibold text-charcoal">
                  {displayQuantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={outOfStock}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:text-forest-700 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-mango hover:bg-mango-700 disabled:bg-mist-200 disabled:text-charcoal-400 text-white font-display font-semibold text-body rounded-pill py-3 shadow-badge disabled:shadow-none transition-colors"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {outOfStock ? "Out of stock" : inCart ? "Go to cart" : "Add to cart"}
              </button>

              <button
                onClick={() => setWishlisted((w) => !w)}
                aria-label="Add to wishlist"
                className="w-12 h-12 shrink-0 flex items-center justify-center rounded-pill border border-mist-200 bg-white hover:border-tomato transition-colors"
              >
                <Heart className={`w-4.5 h-4.5 ${wishlisted ? "text-tomato fill-tomato" : "text-charcoal-400"}`} />
              </button>
            </div>

            {/* Trust features */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-mist-200">
              {/* Feature component assumed existing */}
              <div className="flex items-center gap-2 text-small text-charcoal-600"><Clock className="w-4 h-4 text-leaf-700"/> 45-min delivery</div>
              <div className="flex items-center gap-2 text-small text-charcoal-600"><ShieldCheck className="w-4 h-4 text-leaf-700"/> Freshness guarantee</div>
              <div className="flex items-center gap-2 text-small text-charcoal-600"><Truck className="w-4 h-4 text-leaf-700"/> Free over ৳2000</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection reviews={sampleReviews} rating={rating} reviewCount={reviewCount} />

        {/* Related Products */}
        {relatedProductsBySliced.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
            {relatedProductsBySliced.map((relatedProduct: any) => (
              <ProductCard key={relatedProduct.id || relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <Icon className="w-4.5 h-4.5 text-leaf-700" />
      <span className="font-sans text-caption text-charcoal-600">{label}</span>
    </div>
  );
}

/* ---------------- Reviews ---------------- */
function ReviewsSection({ reviews, rating, reviewCount }: { reviews: Review[]; rating: number; reviewCount: number }) {
  return (
    <section className="mt-14 pt-10 border-t border-mist-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-h3 text-forest-700 mb-1">Customer reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(rating) ? "text-gold fill-gold" : "text-mist-200 fill-mist-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-sans text-small text-charcoal-600">
              {rating} out of 5 · {reviewCount} reviews
            </span>
          </div>
        </div>
        {reviewCount > reviews.length && (
          <a href="#" className="font-sans text-small text-leaf-700 hover:text-mango-700 whitespace-nowrap">
            View all {reviewCount} reviews
          </a>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <ReviewCard key={r.id} {...r} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ name, rating, date, comment }: Review) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center shrink-0">
          <span className="font-display text-caption font-semibold text-forest-700">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-sans text-small font-medium text-charcoal truncate">{name}</p>
          <p className="font-sans text-[11px] text-charcoal-400">{formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-gold fill-gold" : "text-mist-200 fill-mist-200"}`} />
        ))}
      </div>
      <p className="font-sans text-small text-charcoal-600 leading-relaxed">{comment}</p>
    </div>
  );
}