// src/api/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://51.20.18.167/api";

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

export default instance;
export { baseURL };
