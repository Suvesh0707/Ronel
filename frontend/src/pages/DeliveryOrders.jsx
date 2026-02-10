import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, LogOut, Phone, MapPin, Package } from "lucide-react";
import axios from "../api/axios";
import { useToast } from "../utils/ToastProvider";

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [meRes, ordersRes] = await Promise.all([
          axios.get("/delivery/me"),
          axios.get("/delivery/orders"),
        ]);
        setMe(meRes.data.deliveryBoy);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/delivery/login");
          return;
        }
        showToast("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate, showToast]);

  const handleLogout = async () => {
    try {
      await axios.post("/delivery/logout");
      navigate("/delivery/login");
    } catch {
      navigate("/delivery/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="text-gray-900" size={24} />
            <span className="font-semibold text-gray-900">{me?.name || "Delivery"}</span>
            <span className="text-sm text-gray-500">({me?.city})</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">My assigned orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <Package size={40} className="mx-auto mb-2 opacity-50" />
            <p>No orders assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Order #{order._id?.slice(-6)} • ₹{order.totalPrice}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status === "delivered" ? "Delivered" : "Out for delivery"}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="font-medium text-gray-900">Customer & address</p>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p>{order.address?.fullName}</p>
                      <p className="flex items-center gap-1 mt-1">
                        <Phone size={14} />
                        {order.address?.phone}
                      </p>
                      <p className="mt-1 text-gray-600">
                        {order.address?.addressLine}, {order.address?.area}, {order.address?.city},{" "}
                        {order.address?.state} - {order.address?.pincode}
                      </p>
                      {order.address?.landmark && (
                        <p className="text-gray-500 text-xs mt-1">Landmark: {order.address.landmark}</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Items</p>
                    <ul className="text-sm text-gray-700">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.perfume?.name} × {item.quantity} — ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-8">
          <a href="/" className="text-gray-900 hover:underline">Back to store</a>
        </p>
      </main>
    </div>
  );
}
