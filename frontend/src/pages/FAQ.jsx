import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I track my order?",
    a: "Log in and go to My Orders. You'll see the current status: Placed, Packed, Shipping, Out for Delivery, or Delivered."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Pay Online (UPI, cards, net banking via Razorpay) and Cash on Delivery (COD). All online transactions are secure."
  },
  {
    q: "Do you deliver across India?",
    a: "Yes. We deliver to all serviceable pincodes. Enter your pincode at checkout to confirm delivery to your area."
  },
  {
    q: "How long does delivery take?",
    a: "Typically 5–7 business days after dispatch. Metro cities may receive sooner. You'll get updates as your order moves."
  },
  {
    q: "Can I return a perfume?",
    a: "Unopened, sealed bottles in original packaging can be returned within 14 days. See our Returns page for details."
  },
  {
    q: "How do star ratings work?",
    a: "After your order is delivered, you can rate each product from 1 to 5 stars and leave an optional comment from your Order details. The product page shows the average of all customers' ratings."
  },
  {
    q: "Can I cancel my order?",
    a: "Yes. You can cancel an order from the Order detail page when it is still in 'Placed' or 'Packed' status (before it is shipped). Refunds are processed as per our policy."
  },
  {
    q: "What if my product arrives damaged?",
    a: "Replacement is available only after 1 day of delivery. Open the order in My Orders, then use 'Request replacement' and upload a photo or video of the damaged product/packaging. We will review and arrange a replacement."
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen bg-white pt-24">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left text-gray-900 font-medium hover:bg-gray-50"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <p className="px-4 pb-4 text-sm text-gray-600">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
