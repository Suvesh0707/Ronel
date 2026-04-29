import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineInfoCircle, AiOutlineExclamationCircle } from "react-icons/ai";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success"); // success | error | warning | info

  const showToast = (msg, toastType = "success") => {
    setMessage(msg);
    setType(toastType);
    setOpen(false);
    setTimeout(() => setOpen(true), 10);
  };

  // Choose icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <AiOutlineCheckCircle className="w-6 h-6 text-white" />;
      case "error":
        return <AiOutlineCloseCircle className="w-6 h-6 text-red-400" />;
      case "warning":
        return <AiOutlineExclamationCircle className="w-6 h-6 text-yellow-400" />;
      case "info":
        return <AiOutlineInfoCircle className="w-6 h-6 text-blue-400" />;
      default:
        return null;
    }
  };

  // Choose accent line color based on type
  const getAccentColor = () => {
    switch (type) {
      case "success":
        return "bg-white";
      case "error":
        return "bg-red-400";
      case "warning":
        return "bg-yellow-400";
      case "info":
        return "bg-blue-400";
      default:
        return "bg-white";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          duration={2500}
          className={`
            fixed top-6 right-6 z-[9999]
            w-[320px] md:w-[360px]
            rounded-2xl px-5 py-4
            backdrop-blur-xl bg-black/70
            border border-white/10
            shadow-[0_25px_50px_rgba(0,0,0,0.35)]
            overflow-hidden
            flex items-center gap-3
            data-[state=open]:animate-toast-in
            data-[state=closed]:animate-toast-out
          `}
        >
          {/* Accent line */}
          <div
            className={`absolute left-0 top-0 h-full w-[3px] rounded-l-2xl ${getAccentColor()}`}
          />

          {/* Icon */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Message */}
          <div className="flex-1 pr-3">
            <Toast.Title className="text-sm md:text-base font-semibold text-white">
              {message}
            </Toast.Title>
          </div>

          <Toast.Close asChild>
            <button
              className="text-white/70 hover:text-white transition rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Dismiss"
            >
              <AiOutlineCloseCircle className="w-5 h-5" />
            </button>
          </Toast.Close>

          {/* Progress bar */}
          <div
            className={`absolute bottom-0 left-0 h-[3px] ${getAccentColor()} animate-progress`}
          />
        </Toast.Root>

        <Toast.Viewport />

        {/* Animations */}
        <style>{`
          @keyframes toast-in {
            0% { opacity: 0; transform: translateX(20px) scale(0.95); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
          }

          @keyframes toast-out {
            0% { opacity: 1; transform: translateX(0) scale(1); }
            100% { opacity: 0; transform: translateX(20px) scale(0.95); }
          }

          @keyframes progress {
            0% { width: 100%; }
            100% { width: 0%; }
          }

          .animate-toast-in {
            animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .animate-toast-out {
            animation: toast-out 0.2s ease-in;
          }

          .animate-progress {
            animation: progress 1s linear forwards;
          }
        `}</style>
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
