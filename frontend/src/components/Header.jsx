import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "../api/axios";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);
  const { cartCount } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const isLoggedIn = !!user;
  const userRole = user?.role; // "admin" | "user"

  const isActive = (path) => location.pathname === path;

  /* ================= Scroll shadow ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= Close dropdowns ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= Logout ================= */
  const handleLogout = async () => {
    try {
      await axios.post("/users/logout");
      setUser(null);
      navigate("/login");
    } catch {
      console.error("Logout failed");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={`flex items-center justify-between ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* LOGO — prominent like Navora */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
   <img src="/image.png" alt="Ronel Logo" className="h-24 w-auto" />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex gap-8">
            {["/", "/shop", "/about", "/contact"].map((path, i) => {
              const labels = ["HOME", "SHOP", "ABOUT", "CONTACT"];
              return (
                <Link
                  key={path}
                  to={path}
                  className={`text-sm tracking-wider transition ${
                    isActive(path)
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {labels[i]}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!searchQuery.trim()) return;
                      navigate(`/search?q=${searchQuery}`);
                      setSearchOpen(false);
                    }}
                    className="p-4"
                  >
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) =>
                          setSearchQuery(e.target.value)
                        }
                        placeholder="Search perfumes, brands..."
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="block px-4 py-3 hover:bg-gray-100/60">
                        My Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-3 hover:bg-gray-100/60">
                        My Orders
                      </Link>

                      {userRole === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 font-medium hover:bg-gray-100/60"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-3 hover:bg-gray-100/60">
                        Login
                      </Link>
                      <Link to="/register" className="block px-4 py-3 hover:bg-gray-100/60">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CART */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-xs bg-black text-white rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
