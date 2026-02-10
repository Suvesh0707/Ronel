import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/me"); // cookie sent automatically
        setUser(res.data.user); // Extract user object from response
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null); // not logged in / invalid cookie
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/users/logout"); // backend clears cookie
      setUser(null);
    } catch {
      console.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
