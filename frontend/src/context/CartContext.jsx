import { createContext, useState, useContext, useCallback, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await axios.get("/cart");
      setCart(data.cart);
      return data.cart;
    } catch {
      setCart(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (user) fetchCart();
    else setCart(null);
  }, [user, fetchCart]);

  const addToCart = useCallback(
    async (perfumeId, quantity = 1) => {
      setLoading(true);
      try {
        const { data } = await axios.post("/cart", { perfumeId, quantity });
        setCart(data.cart);
        return { success: true, cart: data.cart };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to add to cart",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(async (itemId, quantity) => {
    setLoading(true);
    try {
      const { data } = await axios.put(`/cart/items/${itemId}`, { quantity });
      setCart(data.cart);
      return { success: true, cart: data.cart };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
      return { success: true, cart: data.cart };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      await axios.delete("/cart");
      setCart(null);
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const count =
    cart?.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: count,
        loading,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
