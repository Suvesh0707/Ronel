import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { ToastProvider } from "./utils/ToastProvider";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Footer from "./components/Footer";
import About from "./pages/About";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryOrders from "./pages/DeliveryOrders";
import NotFound from "./pages/NotFound";

function AppContent() {
  const location = useLocation();
  const { loading } = useContext(AuthContext);

  // Show Header and Footer only on authenticated pages, not on login/register/profile
  const showHeaderFooter = !["/login", "/register", "/profile", "/delivery/login", "/delivery/orders"].includes(location.pathname);

  return (
    <>
      {showHeaderFooter && !loading && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
        <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/product/:slug"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery/orders" element={<DeliveryOrders />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showHeaderFooter && !loading && <Footer />}
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
