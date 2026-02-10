import Settings from "../models/settings.model.js";

const COD_KEY = "codEnabled";

export const getCodEnabled = async () => {
  const doc = await Settings.findOne({ key: COD_KEY });
  return doc ? Boolean(doc.value) : false; // Default: disabled
};
