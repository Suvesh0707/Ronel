import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "../utils/ToastProvider";
import axios from "../api/axios";
import perfumeImage from "../assets/per.png";

export default function Login() {
  const {showToast} = useToast();
  const { setUser } = useContext(AuthContext);
  const cardRef = useRef(null);
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 3D mouse parallax (UNCHANGED)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const { width, height, left, top } = card.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      card.style.transform = `perspective(1500px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(20px)`;
    };

    const reset = () => {
      card.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", reset);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", reset);
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return showToast("Enter email and password");
    }
    try {
      setLoading(true);
      const { data } = await axios.post("/users/login", { email, password });
      if (data.user) setUser(data.user);
      showToast("Login successful");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = useCallback(async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/users/google", {
        idToken: credentialResponse.credential,
      });
      if (data.user) setUser(data.user);
      showToast("Google login successful");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Google auth failed");
    } finally {
      setLoading(false);
    }
  }, [setUser, showToast, navigate]);

  // Load Google SDK on mount (only if client ID is configured to avoid 403/origin errors)
  useEffect(() => {
    if (!hasGoogleClientId) return;
    const el = document.getElementById("google-signin-button");
    if (!el) return;
    const widthPx = Math.min(400, el.getBoundingClientRect().width || 400) | 0 || 400;

    const render = () => {
      if (!window.google?.accounts?.id || !el) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleAuth,
      });
      window.google.accounts.id.renderButton(el, {
        theme: "filled_white",
        size: "large",
        width: widthPx,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) render();
    };
    document.head.appendChild(script);
  }, [handleGoogleAuth, hasGoogleClientId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gray-100 relative">

      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-[32px]
        shadow-[0_40px_120px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out overflow-hidden"
      >

        {/* LEFT */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gray-800 rounded-l-[32px] p-8">
          <div className="absolute top-10 text-center w-full">
            <h1 className="text-4xl font-bold tracking-widest text-white">RONEL</h1>
            <p className="text-sm text-gray-400 mt-1">Luxury Fragrance House</p>
          </div>

          <img
            src={perfumeImage}
            alt="Perfume Bottle"
            className="w-[300px] drop-shadow-[0_40px_80px_rgba(255,255,255,0.3)] animate-float my-20"
          />

          <p className="text-xs text-gray-400 mt-auto mb-6 tracking-wide text-center px-4">
            “A fragrance that defines your presence.”
          </p>
        </div>

        {/* RIGHT */}
        <div className="px-6 md:px-12 py-10 md:py-14 flex flex-col justify-center bg-white">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter the world of refined fragrance
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="space-y-6"
          >
            {/* Email */}
            <div className="relative">
              <HiOutlineMail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200
                focus:border-black outline-none transition shadow-sm focus:shadow-md"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <RiLockPasswordLine
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200
                focus:border-black outline-none transition shadow-sm focus:shadow-md"
                autoComplete="current-password"
              />

              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer
                text-gray-500 hover:text-black transition"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </div>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-xl tracking-widest
              hover:scale-[1.02] active:scale-[0.98] transition shadow-lg hover:shadow-2xl flex items-center justify-center gap-3"
            >
              <FiLogIn size={18} />
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>

            {/* Google - only rendered when VITE_GOOGLE_CLIENT_ID is set (avoids 403/origin errors) */}
            {hasGoogleClientId ? (
              <div id="google-signin-button" ref={googleButtonRef} className="rounded-xl shadow-sm hover:shadow-md transition" style={{ width: 400, maxWidth: "100%" }}></div>
            ) : (
              <p className="text-center text-sm text-gray-500">Google sign-in: set VITE_GOOGLE_CLIENT_ID and add http://localhost:5173 to Authorized JavaScript origins in Google Cloud Console.</p>
            )}

            {/* Forgot Password */}
            <p className="text-center text-sm text-gray-500">
              <Link
                to="/forgot-password"
                className="text-gray-900 cursor-pointer hover:underline"
              >
                Forgot password?
              </Link>
            </p>

            {/* Register */}
            <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              New here?
              <Link
                to="/register"
                className="text-gray-900 cursor-pointer hover:underline flex items-center gap-1"
              >
                <FiUserPlus size={16} />
                Create account
              </Link>
            </p>

          </form>
        </div>
      </div>

      {/* Float Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
}
