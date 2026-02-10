import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiLogIn } from "react-icons/fi";
import { useToast } from "../utils/ToastProvider";
import axios from "../api/axios";
import perfumeImage from "../assets/per.png";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = email, 2 = otp + password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 3D mouse parallax
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

  const handleSendOtp = async () => {
    if (!email) return showToast("Please enter your email");
    try {
      setLoading(true);
      await axios.post("/users/forgot-password", { email });
      showToast("OTP sent to your email");
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return showToast("Please enter OTP and new password");
    if (newPassword.length < 6) return showToast("Password must be at least 6 characters");
    try {
      setLoading(true);
      await axios.post("/users/reset-password", { email, otp, newPassword });
      showToast("Password reset successful!");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to reset password");
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
            "A fragrance that defines your presence."
          </p>
        </div>

        {/* RIGHT */}
        <div className="px-6 md:px-12 py-10 md:py-14 flex flex-col justify-center bg-white">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Recover access to your account
          </p>

          <div className="space-y-6">

            {step === 1 ? (
              <>
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
                  />
                </div>

                {/* Send OTP Button */}
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl tracking-widest
                  hover:scale-[1.02] active:scale-[0.98] transition shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <FiLogIn size={18} />
                  {loading ? "SENDING..." : "SEND OTP"}
                </button>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  Remember your password?
                  <Link
                    to="/login"
                    className="text-gray-900 cursor-pointer hover:underline ml-1"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* OTP */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200
                    focus:border-black outline-none transition shadow-sm focus:shadow-md text-center tracking-widest"
                  />
                </div>

                {/* New Password */}
                <div className="relative">
                  <RiLockPasswordLine
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200
                    focus:border-black outline-none transition shadow-sm focus:shadow-md"
                  />

                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer
                    text-gray-500 hover:text-black transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl tracking-widest
                  hover:scale-[1.02] active:scale-[0.98] transition shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <FiLogIn size={18} />
                  {loading ? "RESETTING..." : "RESET PASSWORD"}
                </button>

                {/* Back Button */}
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setNewPassword("");
                  }}
                  className="w-full py-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition
                  shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-3 text-gray-900"
                >
                  BACK
                </button>
              </>
            )}
          </div>
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
