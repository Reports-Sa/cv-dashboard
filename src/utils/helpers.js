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

// --- التحديث الجديد: استخراج الاسم بدقة ---
export function extractNameFromMarkdown(md) {
  if (!md) return "";

  // 1. الأولوية القصوى: البحث عن سطر يحتوي على "الاسم الكامل" أو "الاسم"
  // النمط يبحث عن: (شرطة) ثم (نجمتين) ثم (الاسم الكامل) ثم (نقطتين) ثم (نجمتين) ثم (الاسم)
  // يتعامل بمرونة مع المسافات
  const nameFieldRegex = /(?:-|\*)\s*(?:\*\*|__)?\s*(?:الاسم الكامل|الاسم|Name)\s*:\s*(?:\*\*|__)?\s*(.+?)(?:\n|$|\r)/i;
  const nameMatch = md.match(nameFieldRegex);
  
  if (nameMatch && nameMatch[1]) {
    // تنظيف الاسم من أي رموز زائدة
    return nameMatch[1].trim();
  }

  // 2. محاولة احتياطية: البحث عن عنوان H1 فقط إذا لم يكن عنوان النموذج الافتراضي
  const h1Match = md.match(/(?:^|\n)#\s+([^\n]+)/);
  if (h1Match && h1Match[1]) {
    const title = h1Match[1].trim();
    // تجاهل العنوان إذا كان يحتوي على "طلب خدمة" أو "نموذج"
    if (!title.includes("طلب خدمة") && !title.includes("سيرتي المميزة")) {
      return title;
    }
  }

  return "";
}
