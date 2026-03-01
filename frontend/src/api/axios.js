// src/api/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://ronelbackend.duckdns.org/api"; // default to production URL if env var not set

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export default instance;
export { baseURL };
