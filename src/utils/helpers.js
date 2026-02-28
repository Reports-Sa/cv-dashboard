// src/utils/helpers.js

export function isArabic(txt) {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(txt || "");
}

export const LS = {
  get: (k, fb) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fb !== undefined ? fb : null;
    } catch (e) {
      return fb !== undefined ? fb : null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
};

export function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return s;
  }
}
