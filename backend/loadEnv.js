/**
 * Load .env before any other module that uses process.env (e.g. cloudinary).
 * Must be imported first in index.js.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath, quiet: true });
