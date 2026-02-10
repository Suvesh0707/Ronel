import nodemailer from "nodemailer";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function getTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Send email to user with links to rate each perfume (product page) after delivery.
 * @param {string} to - User email (e.g. Gmail)
 * @param {string} userName - User name
 * @param {Array<{ name: string, _id?: string }>} items - Order items with perfume name (and optional _id for slug)
 */
export async function sendRatePerfumeEmail(to, userName, items) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email not configured (EMAIL_USER, EMAIL_PASS). Skip sending rate link.");
    return;
  }
  const perfumeLinks = items.map((it) => {
    const name = it.perfume?.name || it.name || "Perfume";
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const url = `${FRONTEND_URL}/product/${slug}`;
    return `• ${name}: ${url}`;
  });
  const body = `Hi ${userName || "there"},\n\nYour order has been delivered. We'd love your feedback!\n\nRate your perfumes (1–5 stars) here:\n\n${perfumeLinks.join("\n")}\n\nThank you for shopping with us.\n\n— Ronel`;
  const html = `
    <p>Hi ${userName || "there"},</p>
    <p>Your order has been delivered. We'd love your feedback!</p>
    <p><strong>Rate your perfumes (1–5 stars):</strong></p>
    <ul>
      ${items.map((it) => {
        const name = it.perfume?.name || it.name || "Perfume";
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        const url = `${FRONTEND_URL}/product/${slug}`;
        return `<li><a href="${url}">${name}</a></li>`;
      }).join("")}
    </ul>
    <p>Thank you for shopping with us.</p>
    <p>— Ronel</p>
  `;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Your order is delivered — rate your perfumes",
      text: body,
      html,
    });
  } catch (err) {
    console.error("Failed to send rate-perfume email:", err?.message || err);
  }
}
