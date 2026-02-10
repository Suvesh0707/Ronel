import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import axios from "../api/axios";
import { useToast } from "../utils/ToastProvider";

export default function DeliveryLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast("Phone and password required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/delivery/login", { phone: phone.trim(), password });
      showToast("Logged in");
      navigate("/delivery/orders");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
            <Truck className="text-white" size={28} />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">Delivery login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign in to see your assigned orders</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black outline-none"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-black outline-none"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <a href="/" className="text-gray-900 hover:underline">Back to store</a>
        </p>
      </div>
    </div>
  );
}
