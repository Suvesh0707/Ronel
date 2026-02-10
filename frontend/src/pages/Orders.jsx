import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, ChevronLeft, Calendar, ShoppingBag } from "lucide-react";
import axios from "../api/axios";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&h=200&fit=crop";

function OrderCard({ order }) {
  const items = order.items || [];
  const images = items
    .map((it) => it.perfume?.images?.[0])
    .filter(Boolean);
  const uniqueImages = [...new Set(images)].slice(0, 4);

  return (
    <Link
      to={`/orders/${order._id}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:min-h-[140px]">
        {/* Product photos */}
        <div className="sm:w-44 flex-shrink-0 bg-gray-50 flex items-center justify-center p-3">
          {uniqueImages.length > 0 ? (
            <div className="flex gap-2 w-full justify-center flex-wrap">
              {uniqueImages.map((src, i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-sm"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = FALLBACK_IMG; }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Order info */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-0.5">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Order #{order._id.slice(-8).toUpperCase()}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                  order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : order.status === "delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : order.status === "out_for_delivery"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "shipping"
                    ? "bg-amber-100 text-amber-700"
                    : order.status === "packed"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
              {order.replacementRequest?.requestedAt && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Replacement {order.replacementRequest.status}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-4">
            {items.slice(0, 3).map((it, i) => (
              <p key={i} className="text-sm text-gray-600 truncate">
                {it.perfume?.name || "Product"} × {it.quantity}
              </p>
            ))}
            {items.length > 3 && (
              <p className="text-sm text-gray-500">+{items.length - 3} more item(s)</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xl font-bold text-gray-900">₹{order.totalPrice}</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-black transition-colors">
              View details
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/orders");
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600 max-w-xl">
            Open any order to see details, cancel, request replacement (after 1 day of delivery), or rate products.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">Your order history will appear here once you place an order.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
