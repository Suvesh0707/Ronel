import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Package, Star, XCircle, RefreshCw } from "lucide-react";
import axios from "../api/axios";
import { useToast } from "../utils/ToastProvider";

export default function OrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedPerfumeIds, setReviewedPerfumeIds] = useState([]);
  const [submittingPerfumeId, setSubmittingPerfumeId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [replacementComment, setReplacementComment] = useState("");
  const [replacementProofFiles, setReplacementProofFiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [orderRes, reviewedRes] = await Promise.all([
          axios.get(`/orders/${id}`),
          axios.get("/reviews/my-reviewed"),
        ]);
        setOrder(orderRes.data.order);
        setReviewedPerfumeIds(reviewedRes.data?.reviewedPerfumeIds || []);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleSubmitReview = async (perfumeId, rating, comment) => {
    if (!rating || rating < 1 || rating > 5) {
      showToast("Please choose 1 to 5 stars");
      return;
    }
    setSubmittingPerfumeId(perfumeId);
    try {
      await axios.post("/reviews", { perfumeId, rating, comment: comment || undefined });
      setReviewedPerfumeIds((prev) => [...prev, String(perfumeId)]);
      showToast("Thank you! Your review has been submitted.");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingPerfumeId(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?._id || !["placed", "packed"].includes(order.status)) return;
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const { data } = await axios.post(`/orders/${order._id}/cancel`);
      if (data.success) {
        setOrder(data.order);
        showToast("Order cancelled successfully.");
      } else showToast(data.message || "Could not cancel order");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReplacement = async () => {
    if (!order?._id || order.status !== "delivered") return;
    if (!replacementProofFiles.length) {
      showToast("Please upload at least one photo or video of the damaged product/packaging.");
      return;
    }
    setReplacementLoading(true);
    try {
      const formData = new FormData();
      formData.append("reason", "damaged");
      if (replacementComment.trim()) formData.append("comment", replacementComment.trim());
      replacementProofFiles.forEach((file) => formData.append("proof", file));
      const { data } = await axios.post(`/orders/${order._id}/request-replacement`, formData);
      if (data.success) {
        setOrder(data.order);
        setReplacementComment("");
        setReplacementProofFiles([]);
        showToast("Replacement request submitted with proof. We will review it shortly.");
      } else showToast(data.message || "Could not submit request");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to submit replacement request");
    } finally {
      setReplacementLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-[var(--ronel-muted)] hover:text-[var(--ronel-primary)] mb-8 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Orders</span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--ronel-primary)] border-t-transparent" />
          </div>
        ) : !order ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Order not found</p>
            <Link to="/orders" className="text-black underline mt-2 inline-block">
              View all orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h1 className="text-2xl font-serif text-black">
                Order #{order._id.slice(-8)}
              </h1>
              <div className="flex items-center gap-2">
                {order.replacementRequest?.requestedAt && (
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      order.replacementRequest.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : order.replacementRequest.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Replacement {order.replacementRequest.status}
                  </span>
                )}
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "out_for_delivery"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "shipping"
                      ? "bg-amber-100 text-amber-800"
                      : order.status === "packed"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>

            {/* Make it clear: opening an order shows these options */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-1">What you can do here</h3>
              <ul className="text-sm text-blue-800 space-y-0.5">
                {["placed", "packed"].includes(order.status) && <li>• <strong>Cancel order</strong> — before it is shipped</li>}
                {order.status === "delivered" && !order.replacementRequest?.requestedAt && <li>• <strong>Request replacement</strong> — within 8 hours of delivery, if damaged (photo/video required)</li>}
                {order.status === "delivered" && <li>• <strong>Rate products</strong> — leave a star rating and review below</li>}
                {order.status !== "delivered" && !["placed", "packed"].includes(order.status) && <li>• Track status and view details</li>}
              </ul>
            </div>

            {/* Cancel order — only when placed or packed */}
            {["placed", "packed"].includes(order.status) && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {cancelling ? "Cancelling…" : "Cancel order"}
                </button>
                <p className="text-xs text-gray-500 mt-2">You can cancel before the order is shipped. Amount will be refunded as per policy.</p>
              </div>
            )}

            {/* Replacement available only within 8 hours of delivery */}
            {order.status === "delivered" && !order.replacementRequest?.requestedAt && (() => {
              const eightHoursMs = 8 * 60 * 60 * 1000;
              const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).getTime() : null;
              const canRequestReplacement = deliveredAt && (Date.now() - deliveredAt <= eightHoursMs);
              if (!canRequestReplacement && deliveredAt) {
                return (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-1">Request replacement (damaged product)</h4>
                    <p className="text-sm text-gray-600">Replacement can only be requested <strong>within 8 hours of delivery</strong>. The window has expired. Please contact us for assistance.</p>
                  </div>
                );
              }
              if (!deliveredAt) return null;
              return (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-1">Product damaged? Request a replacement</h4>
                <p className="text-sm text-amber-800 mb-3">Upload at least one <strong>photo or video</strong> of the damaged product or packaging so we can verify. Without proof the request cannot be processed.</p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => setReplacementProofFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-200 file:text-amber-900 file:font-medium mb-2"
                />
                {replacementProofFiles.length > 0 && (
                  <p className="text-xs text-amber-800 mb-2">{replacementProofFiles.length} file(s) selected (photo or video)</p>
                )}
                <textarea
                  value={replacementComment}
                  onChange={(e) => setReplacementComment(e.target.value)}
                  placeholder="Describe the damage (optional)"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm resize-none h-20 mb-2"
                  maxLength={500}
                />
                <button
                  type="button"
                  onClick={handleRequestReplacement}
                  disabled={replacementLoading || replacementProofFiles.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  {replacementLoading ? "Submitting…" : "Request replacement"}
                </button>
              </div>
            );
            })()}
            {order.status === "delivered" && order.replacementRequest?.requestedAt && (
              <div className={`p-4 rounded-xl border ${
                order.replacementRequest.status === "approved"
                  ? "bg-green-50 border-green-200"
                  : order.replacementRequest.status === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <p className="font-medium">
                  Replacement request: {order.replacementRequest.status}
                  {order.replacementRequest.comment && (
                    <span className="block text-sm font-normal text-gray-600 mt-1">"{order.replacementRequest.comment}"</span>
                  )}
                </p>
                {order.replacementRequest.status === "pending" && (
                  <p className="text-sm text-gray-500 mt-1">We will process your request and get back to you.</p>
                )}
              </div>
            )}

            <div className="card-ronel p-6 space-y-4">
              <h3 className="font-semibold text-[var(--ronel-primary)]">Items</h3>
              {order.items?.map((it, i) => {
                const pid = it.perfume?._id;
                const alreadyReviewed = pid && reviewedPerfumeIds.includes(String(pid));
                return (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4 items-center">
                      {it.perfume?.images?.[0] && (
                        <img
                          src={it.perfume.images[0]}
                          alt={it.perfume.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{it.perfume?.name}</p>
                        <p className="text-gray-500 text-sm">
                          ₹{it.price} × {it.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{it.price * it.quantity}</p>
                    </div>
                    {order.status === "delivered" && pid && (
                      <>
                        {alreadyReviewed ? (
                          <p className="text-sm text-green-600 mt-2">You reviewed this product. Thank you!</p>
                        ) : (
                          <OrderItemReviewForm
                            perfumeId={pid}
                            submitting={submittingPerfumeId === pid}
                            onSubmit={handleSubmitReview}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {order.address && (
              <div className="card-ronel p-6">
                <h3 className="font-semibold text-[var(--ronel-primary)] mb-2">Delivery address</h3>
                <p className="text-gray-700">
                  {order.address.fullName} · {order.address.phone}
                </p>
                <p className="text-gray-600 text-sm">
                  {order.address.addressLine}, {order.address.area}, {order.address.city},{" "}
                  {order.address.state} – {order.address.pincode}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[var(--ronel-border)]">
              <span className="text-lg font-medium text-[var(--ronel-muted)]">Total</span>
              <span className="text-2xl font-bold text-[var(--ronel-primary)]">₹{order.totalPrice}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderItemReviewForm({ perfumeId, submitting, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(perfumeId, rating, comment.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">Rate this product (your choice 1–5 stars)</p>
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
              className={`w-8 h-8 transition-colors ${
                (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">({rating > 0 ? rating + " of 5" : "Select stars"})</span>
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
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
