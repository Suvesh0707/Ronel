import { Link } from "react-router-dom";
import { Truck, MapPin, Clock } from "lucide-react";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shipping & Delivery</h1>
        <div className="prose prose-gray max-w-none space-y-6">
          <div className="flex gap-4 items-start">
            <Truck className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All India Delivery</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                We deliver across India. Orders are shipped within 2–3 business days after payment confirmation. 
                Delivery typically takes 5–7 business days for most pin codes.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <MapPin className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pincode Coverage</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                We use India Post and partnered couriers for serviceable areas. Enter your 6-digit pincode 
                at checkout to confirm deliverability to your location.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Clock className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your order status: Placed → Packed → Shipping → Out for Delivery → Delivered. 
                You can view updates in My Orders.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8">
          <Link to="/contact" className="text-gray-900 underline">Contact us</Link> for shipping queries.
        </p>
      </main>
    </div>
  );
}
