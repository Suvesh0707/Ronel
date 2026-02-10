import { Link } from "react-router-dom";
import { RotateCcw, Package } from "lucide-react";

export default function Returns() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Returns & Refunds</h1>
        <div className="prose prose-gray max-w-none space-y-6">
          <div className="flex gap-4 items-start">
            <RotateCcw className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">14-Day Return Policy</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Unopened, sealed perfume bottles in original packaging can be returned within 14 days of delivery. 
                Due to hygiene, opened or used products cannot be returned.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Package className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Damaged product — replacement</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                If your order was delivered but the product is damaged, open the order in <Link to="/orders" className="text-black underline">My Orders</Link> and use &quot;Request replacement&quot; <strong>within 8 hours of delivery</strong>. Upload photo or video proof of the damage. We will process your request and arrange a replacement.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Package className="w-8 h-8 text-gray-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Refund process</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Refunds are processed within 7–10 business days to the original payment method (UPI, card, net banking). 
                Contact us to initiate a return.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8">
          <Link to="/contact" className="text-gray-900 underline">Contact us</Link> for return requests.
        </p>
      </main>
    </div>
  );
}
