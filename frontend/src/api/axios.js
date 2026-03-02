// src/api/axios.js
import axios from "axios";

axios.defaults.withCredentials = true;

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5173/api"; // default to production URL if env var not set

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export default instance;
export { baseURL };
