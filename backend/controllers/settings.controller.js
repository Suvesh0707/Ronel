import asyncHandler from "express-async-handler";
import fs from "fs";
import Settings from "../models/settings.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getCodEnabled } from "../utils/settings.js";

const COD_KEY = "codEnabled";
const HERO_KEY = "heroSettings";
const VALID_HERO_SECTIONS = ["home", "shop", "contact", "about"];
const VALID_SUB_SECTIONS = ["hero", "parallax", "newsletter", "stats", "cta", "map"];

const HERO_SECTION_DEFAULTS = {
  home: {
    hero: {
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
      heading: "Timeless Elegance",
      subtitle: "Experience fragrances that capture the essence of sophistication and leave a lasting impression",
      textColor: "#000000",
    },
    parallax: {
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=2000",
      heading: "The Art of Perfumery",
      subtitle: "Each fragrance is a masterpiece, meticulously crafted with the world's finest ingredients by master perfumers.",
      textColor: "#ffffff",
    },
    newsletter: {
      image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600",
      heading: "Join Our Exclusive Circle",
      subtitle: "Be the first to discover new fragrances, exclusive offers, and insider news from the world of Ronel.",
      textColor: "#ffffff",
    }
  },
  shop: {
    hero: {
      image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1600",
      heading: "Our Collection",
      subtitle: "Discover your signature scent from our curated selection",
      textColor: "#ffffff",
    },
    newsletter: {
      image: null,
      heading: "Can't Find What You're Looking For?",
      subtitle: "Get personalized fragrance recommendations from our experts",
      textColor: "#ffffff",
    }
  },
  contact: {
    hero: {
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600",
      heading: "Get in Touch",
      subtitle: "We'd love to hear from you. Let's create something beautiful together.",
      textColor: "#ffffff",
    },
    map: {
      image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600",
      heading: "Visit Us",
      subtitle: "India",
      textColor: "#000000",
    }
  },
  about: {
    hero: {
      image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600",
      heading: "Crafting Timeless Elegance",
      subtitle: "Every bottle tells a story of sophistication, passion, and the art of perfumery.",
      textColor: "#ffffff",
    },
    stats: {
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
      heading: "Our Impact",
      subtitle: "Trusted by fragrance enthusiasts across the globe.",
      textColor: "#ffffff",
    },
    cta: {
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600",
      heading: "Experience the Art of Perfumery",
      subtitle: "Discover our collection and find your signature scent",
      textColor: "#ffffff",
    }
  },
};

const normalizeSection = (section) => {
  const normalized = String(section || "home").toLowerCase();
  return VALID_HERO_SECTIONS.includes(normalized) ? normalized : "home";
};

const normalizeSubSection = (sub) => {
  const normalized = String(sub || "hero").toLowerCase();
  return VALID_SUB_SECTIONS.includes(normalized) ? normalized : "hero";
};

const getHeroDefaults = (section, subSection) => {
  const sec = normalizeSection(section);
  const sub = normalizeSubSection(subSection);
  return HERO_SECTION_DEFAULTS[sec]?.[sub] || HERO_SECTION_DEFAULTS[sec]?.hero || HERO_SECTION_DEFAULTS.home.hero;
};

const getHeroSettingsForSection = async (section, subSection) => {
  const normalizedSection = normalizeSection(section);
  const normalizedSubSection = normalizeSubSection(subSection);
  const doc = await Settings.findOne({ key: HERO_KEY });
  const raw = doc?.value || {};
  const pageSettings = raw[normalizedSection] || {};
  
  // Handle migration: if pageSettings is old format (flat), move it to 'hero' subsection
  if (pageSettings.image !== undefined && pageSettings.hero === undefined) {
    // This is old data format
    return {
      ...getHeroDefaults(normalizedSection, normalizedSubSection),
      ...(normalizedSubSection === "hero" ? pageSettings : {})
    };
  }

  return {
    ...getHeroDefaults(normalizedSection, normalizedSubSection),
    ...(pageSettings[normalizedSubSection] || {}),
  };
};

/* =========================
   GET COD ENABLED (public - for Cart checkout)
========================= */
export const getCodEnabledSetting = asyncHandler(async (req, res) => {
  const enabled = await getCodEnabled();
  res.json({ success: true, codEnabled: enabled });
});

/* =========================
   GET HERO SETTINGS (public)
========================= */
export const getHeroSettings = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.query.section);
  const subSection = normalizeSubSection(req.query.subSection);
  const settings = await getHeroSettingsForSection(section, subSection);
  res.json({ success: true, section, subSection, settings });
});

/* =========================
   ADMIN: GET COD ENABLED
========================= */
export const adminGetCodSetting = asyncHandler(async (req, res) => {
  const enabled = await getCodEnabled();
  res.json({ success: true, codEnabled: enabled });
});

/* =========================
   ADMIN: GET HERO SETTINGS
========================= */
export const adminGetHeroSettings = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.query.section);
  const subSection = normalizeSubSection(req.query.subSection);
  const settings = await getHeroSettingsForSection(section, subSection);
  res.json({ success: true, section, subSection, settings });
});

/* =========================
   ADMIN: SET COD ENABLED (enable/disable Cash on Delivery)
========================= */
export const adminSetCodSetting = asyncHandler(async (req, res) => {
  const { codEnabled } = req.body;
  if (typeof codEnabled !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Body must include codEnabled: true or false",
    });
  }
  await Settings.findOneAndUpdate(
    { key: COD_KEY },
    { $set: { key: COD_KEY, value: codEnabled } },
    { upsert: true, new: true }
  );
  res.json({
    success: true,
    codEnabled,
    message: `Cash on Delivery is now ${codEnabled ? "enabled" : "disabled"}.`,
  });
});

/* =========================
   ADMIN: UPDATE HERO SETTINGS
========================= */
export const adminSetHeroSettings = asyncHandler(async (req, res) => {
  const section = normalizeSection(req.query.section);
  const subSection = normalizeSubSection(req.query.subSection);
  const rawHeading = req.body.heroHeading;
  const rawSubtitle = req.body.heroSubtitle;
  const rawTextColor = req.body.heroTextColor;
  const deleteImage = req.body.deleteImage === "true" || req.body.deleteImage === true;

  const existingDoc = await Settings.findOne({ key: HERO_KEY });
  const existing = existingDoc?.value || {};
  
  // Handle migration if needed
  let pageSettings = existing[section] || {};
  if (pageSettings.image !== undefined && pageSettings.hero === undefined) {
    pageSettings = { hero: { ...pageSettings } };
  }
  
  const existingSubSection = pageSettings[subSection] || {};
  let newImage = existingSubSection.image || null;

  if (deleteImage && !req.file) {
    newImage = null;
  }

  if (req.file) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({
        success: false,
        message: "Image upload is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend .env.",
      });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `hero_section/${section}/${subSection}`,
        resource_type: "auto",
      });
      newImage = result.secure_url;
    } catch (uploadError) {
      const isInvalidSignature = uploadError?.http_code === 401 || /Invalid Signature/i.test(uploadError?.message || "");
      if (isInvalidSignature) {
        console.error("Cloudinary Invalid Signature: CLOUDINARY_API_SECRET in .env is wrong. Copy the API Secret again from Cloudinary Dashboard (Settings → API Keys). Use API Secret, not API Key.");
      } else {
        console.error("Cloudinary upload error:", uploadError);
      }
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      return res.status(500).json({
        success: false,
        message: isInvalidSignature
          ? "Invalid Cloudinary credentials. In backend .env set CLOUDINARY_API_SECRET to the API Secret from Cloudinary Dashboard (Settings → API Keys), not the API Key."
          : `Failed to upload image: ${uploadError?.message || "Unknown error"}`,
      });
    }

    if (req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  }

  const newSubSectionSettings = {
    image: newImage,
    heading: typeof rawHeading === "string" && rawHeading.trim() !== "" ? rawHeading.trim() : existingSubSection.heading || getHeroDefaults(section, subSection).heading,
    subtitle: typeof rawSubtitle === "string" && rawSubtitle.trim() !== "" ? rawSubtitle.trim() : existingSubSection.subtitle || getHeroDefaults(section, subSection).subtitle,
    textColor: typeof rawTextColor === "string" && rawTextColor.trim() !== "" ? rawTextColor.trim() : existingSubSection.textColor || getHeroDefaults(section, subSection).textColor,
  };

  const updatedPageSettings = {
    ...pageSettings,
    [subSection]: newSubSectionSettings,
  };

  const updatedValue = {
    ...existing,
    [section]: updatedPageSettings,
  };

  const updatedDoc = await Settings.findOneAndUpdate(
    { key: HERO_KEY },
    { $set: { key: HERO_KEY, value: updatedValue } },
    { upsert: true, new: true }
  );

  res.json({ success: true, section, subSection, settings: updatedDoc.value[section][subSection], message: `${subSection} section updated successfully` });
});
