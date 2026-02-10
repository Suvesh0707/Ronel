// src/api/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export default instance;
export { baseURL };
