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

export default function Register() {
  const {showToast} = useToast();
  const { setUser } = useContext(AuthContext);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = send otp, 2 = register
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleAuth = useCallback(async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/users/google", {
        idToken: credentialResponse.credential,
      });
      if (data.user) setUser(data.user);
      showToast("Google signup successful");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Google auth failed");
    } finally {
      setLoading(false);
    }
  }, [setUser, showToast, navigate]);

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

  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID");

  // Load Google SDK on mount (only when client ID set; use pixel width to avoid GSI_LOGGER error)
  useEffect(() => {
    if (!hasGoogleClientId) return;
    const el = document.getElementById("google-signup-button");
    if (!el) return;
    const widthPx = Math.min(400, el.getBoundingClientRect().width || 400) | 0 || 400;

    const render = () => {
      if (!window.google?.accounts?.id || !el) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleAuth,
      });
      window.google.accounts.id.renderButton(el, { theme: "filled_white", size: "large", width: widthPx });
    };
    if (window.google?.accounts?.id) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => { if (window.google) render(); };
    document.head.appendChild(script);
  }, [handleGoogleAuth, hasGoogleClientId]);

  const sendOtp = async () => {
    if (!email) return showToast("Enter email");
    try {
      setLoading(true);
      await axios.post("/users/send-otp", { email });
      showToast("OTP sent to your email");
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!name || !password || !otp) return showToast("Fill all fields");
    try {
      setLoading(true);
      const { data } = await axios.post("/users/register", {
        name,
        email,
        password,
        otp,
      });
      if (data.user) setUser(data.user);
      showToast("Account created successfully");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gray-100 relative">

      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-[32px]
        shadow-[0_40px_120px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out overflow-hidden"
      >

        {/* LEFT — PERFUME */}
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

        {/* RIGHT — REGISTER FORM */}
        <div className="px-6 md:px-12 py-10 md:py-14 flex flex-col justify-center bg-white">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Begin your journey with Ronel
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 1) sendOtp();
              else registerUser();
            }}
            className="space-y-6"
          >

            {/* NAME (STEP 2) */}
            {step === 2 && (
              <div className="relative">
                <RiLockPasswordLine
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200
                  focus:border-black outline-none transition shadow-sm focus:shadow-md"
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="relative">
              <HiOutlineMail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
              name="email"
                type="email"
                placeholder="Email"
                disabled={step === 2}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200
                focus:border-black outline-none transition shadow-sm focus:shadow-md"
              />
            </div>

            {/* OTP (STEP 2) */}
            {step === 2 && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200
                focus:border-black outline-none transition shadow-sm focus:shadow-md"
              />
            )}

            {/* PASSWORD (STEP 2) */}
            {step === 2 && (
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
                  autoComplete="new-password"
                />

                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer
                  text-gray-500 hover:text-black transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                </div>
              </div>
            )}

            {/* BUTTON */}
            {step === 1 ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl tracking-widest
                hover:scale-[1.02] active:scale-[0.98] transition shadow-lg hover:shadow-2xl"
              >
                {loading ? "SENDING OTP..." : "SEND OTP"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl tracking-widest
                hover:scale-[1.02] active:scale-[0.98] transition shadow-lg hover:shadow-2xl"
              >
                {loading ? "CREATING ACCOUNT..." : "REGISTER"}
              </button>
            )}

            {/* DIVIDER */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Google - pixel width to avoid GSI_LOGGER; only when client ID set */}
                {hasGoogleClientId ? (
                  <div id="google-signup-button" className="rounded-xl shadow-sm hover:shadow-md transition" style={{ width: 400, maxWidth: "100%" }}></div>
                ) : (
                  <p className="text-center text-sm text-gray-500">Google: set VITE_GOOGLE_CLIENT_ID and add origin in Google Cloud Console.</p>
                )}
              </>
            )}

            {/* LOGIN */}
            <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
              Already have an account?
              <Link
                to="/login"
                className="text-gray-900 cursor-pointer hover:underline flex items-center gap-1"
              >
                <FiLogIn size={16} />
                Sign in
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
