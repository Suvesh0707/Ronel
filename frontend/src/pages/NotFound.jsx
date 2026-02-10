import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white pt-24 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl md:text-8xl font-serif font-bold text-gray-200 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-8 text-center">Page not found</p>
      <p className="text-gray-500 mb-10 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          Home
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Search className="w-5 h-5" />
          Shop
        </Link>
      </div>
    </div>
  );
}
