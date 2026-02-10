export default function Terms() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <div className="prose prose-gray max-w-none text-sm text-gray-600 space-y-4">
          <p>
            Welcome to Ronel. By using our website and placing orders, you agree to these terms. 
            We reserve the right to modify them at any time.
          </p>
          <p>
            <strong>Orders & Payment:</strong> All prices are in Indian Rupees (₹). Payment is processed securely via Razorpay. 
            We accept UPI, cards, net banking, and wallets.
          </p>
          <p>
            <strong>Product Information:</strong> We strive for accuracy in product descriptions and images. 
            Slight variations may occur. Fragrance notes and longevity may vary by skin type.
          </p>
          <p>
            <strong>Applicable Law:</strong> These terms are governed by the laws of India. 
            Any disputes shall be subject to the courts of India.
          </p>
        </div>
      </main>
    </div>
  );
}
