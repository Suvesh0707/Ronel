import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft, Truck } from "lucide-react";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";
import { useToast } from "../utils/ToastProvider";

const PLATFORM_FEE = 3;
const DELIVERY_SAVINGS = 30;

export default function Cart() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    cart,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [codEnabled, setCodEnabled] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const load = async () => {
      try {
        const [addrRes, settingsRes] = await Promise.all([
          axios.get("/users/addresses"),
          axios.get("/settings/cod-enabled"),
        ]);
        setAddresses(addrRes.data.addresses || []);
        setCodEnabled(settingsRes.data?.codEnabled ?? false);
        const addrs = addrRes.data.addresses || [];
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (addrs[0]) setSelectedAddressId(addrs[0]._id);
      } catch {
        setAddresses([]);
      }
    };
    load();
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    const res = await updateItem(itemId, newQty);
    if (!res.success) showToast(res.message || "Update failed");
  };

  const handleRemove = async (itemId) => {
    const res = await removeItem(itemId);
    if (!res.success) showToast(res.message || "Remove failed");
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) {
      showToast("Cart is empty");
      return;
    }
    if (!selectedAddressId) {
      showToast("Please select a delivery address");
      return;
    }

    setPaymentLoading(true);
    try {
      const { data } = await axios.post("/orders/create-payment-order", {
        addressId: selectedAddressId,
      });
      if (!data.success || !data.orderId) {
        showToast(data.message || "Could not create payment order");
        setPaymentLoading(false);
        return;
      }

      const opts = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Ronel",
        description: "Perfume order",
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verify = await axios.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId: selectedAddressId,
            });
            if (verify.data.success) {
              await clearCart();
              showToast("Order placed successfully!");
              navigate("/orders");
            } else {
              showToast(verify.data.message || "Payment verification failed");
            }
          } catch (e) {
            showToast(e.response?.data?.message || "Payment verification failed");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: { email: "" },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(opts);
      rzp.on("payment.failed", () => {
        showToast("Payment failed");
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (e) {
      showToast(e.response?.data?.message || "Checkout failed");
      setPaymentLoading(false);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, it) => {
    const p = it.perfume;
    return sum + (p ? p.price * (it.quantity || 0) : 0);
  }, 0);
  const total = subtotal + PLATFORM_FEE;

  const handlePlaceCod = async () => {
    if (!items.length) {
      showToast("Cart is empty");
      return;
    }
    if (!selectedAddressId) {
      showToast("Please select a delivery address");
      return;
    }
    setCodLoading(true);
    try {
      const { data } = await axios.post("/orders/create-cod", { addressId: selectedAddressId });
      if (data.success) {
        await clearCart();
        showToast("Order placed! Pay when delivered (COD).");
        navigate("/orders");
      } else {
        showToast(data.message || "Could not place COD order");
      }
    } catch (e) {
      showToast(e.response?.data?.message || "COD order failed");
    } finally {
      setCodLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ronel-surface)] pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[var(--ronel-muted)] hover:text-[var(--ronel-primary)] mb-8 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Shop</span>
        </Link>
        <h1 className="text-4xl font-serif text-[var(--ronel-primary)] mb-8">Your Cart</h1>

        {loading && !cart ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--ronel-primary)] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-[var(--ronel-muted)] mx-auto mb-4" />
            <p className="text-[var(--ronel-muted)] mb-6">Your cart is empty</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              {items.map((it) => {
                const p = it.perfume;
                if (!p) return null;
                const subtotal = p.price * (it.quantity || 0);
                return (
                  <div
                    key={it._id}
                    className="flex gap-4 p-4 card-ronel"
                  >
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">{p.name}</h3>
                      <p className="text-gray-600 text-sm">₹{p.price} each</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleUpdateQty(it._id, Math.max(0, (it.quantity || 1) - 1))
                          }
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {it.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQty(it._id, (it.quantity || 1) + 1)
                          }
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(it._id)}
                          className="ml-2 p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-semibold">₹{subtotal}</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--ronel-border)] pt-6">
              <h3 className="text-sm font-semibold text-[var(--ronel-muted)] uppercase tracking-wider mb-4">
                Delivery address
              </h3>
              {addresses.length === 0 ? (
                <p className="text-gray-500 mb-4">
                  No saved addresses.{" "}
                  <Link to="/profile" className="text-black underline">Add one in Profile</Link>
                </p>
              ) : (
                <div className="space-y-2 mb-6">
                  {addresses.map((a) => (
                    <label
                      key={a._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        selectedAddressId === a._id
                          ? "border-[var(--ronel-primary)] bg-gray-50"
                          : "border-[var(--ronel-border)] hover:border-[var(--ronel-muted)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === a._id}
                        onChange={() => setSelectedAddressId(a._id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-black">
                          {a.fullName} - {a.phone}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {a.addressLine}, {a.area}, {a.city}, {a.state} - {a.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Delivered free - You saved ₹30 */}
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Delivered free — You saved ₹{DELIVERY_SAVINGS}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-[var(--ronel-muted)]">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--ronel-muted)]">
                  <span>Platform fee</span>
                  <span>₹{PLATFORM_FEE}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--ronel-border)]">
                  <span className="text-lg font-medium text-[var(--ronel-primary)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--ronel-primary)]">₹{total}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={
                  paymentLoading ||
                  codLoading ||
                  items.length === 0 ||
                  addresses.length === 0 ||
                  !selectedAddressId
                }
                className="w-full py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {paymentLoading ? "Processing…" : "Place Order (Pay Online)"}
              </button>
              {codEnabled && (
                <button
                  onClick={handlePlaceCod}
                  disabled={
                    paymentLoading ||
                    codLoading ||
                    items.length === 0 ||
                    addresses.length === 0 ||
                    !selectedAddressId
                  }
                  className="w-full py-4 border-2 border-[var(--ronel-primary)] text-[var(--ronel-primary)] font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {codLoading ? "Placing…" : "Cash on Delivery (COD)"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
