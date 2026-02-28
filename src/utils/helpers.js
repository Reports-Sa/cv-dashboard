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

// الدالة الذكية لاستخراج الاسم من الماركداون
export function extractNameFromMarkdown(md) {
  if (!md) return "";
  
  // 1. البحث عن أول عنوان رئيسي (مثال: # أحمد محمد)
  const h1Match = md.match(/(?:^|\n)#\s+([^\n]+)/);
  if (h1Match && h1Match[1]) return h1Match[1].trim();

  // 2. البحث عن كلمة الاسم صراحة (مثال: الاسم الكامل: أحمد)
  const kvMatch = md.match(/(?:الاسم الكامل|الاسم|Name):\s*([^\n]+)/i);
  if (kvMatch && kvMatch[1]) return kvMatch[1].trim();

  return "";
}
