export default function Privacy() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none text-sm text-gray-600 space-y-4">
          <p>
            Ronel respects your privacy. This policy describes how we collect, use, and protect your information.
          </p>
          <p>
            <strong>Information We Collect:</strong> Name, email, phone, delivery address, and payment details when you place an order. 
            We use cookies for session management and improving your experience.
          </p>
          <p>
            <strong>How We Use It:</strong> To process orders, send order updates, respond to queries, and improve our services. 
            We do not sell your data to third parties.
          </p>
          <p>
            <strong>Data Security:</strong> We use industry-standard measures to protect your data. 
            Payment processing is handled securely by Razorpay.
          </p>
          <p>
            <strong>Contact:</strong> For privacy concerns, reach us via the Contact page.
          </p>
        </div>
      </main>
    </div>
  );
}
