// src/utils/helpers.js

export function isArabic(txt) {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(txt || "");
}

// الدالة الذكية المحدثة لقراءة الحزم الثلاث
export function extractLangFromMarkdown(md) {
  if (!md) return "عربي";
  
  // نبحث عن السطر الذي يحتوي على تفاصيل الحزمة
  const pkgMatch = md.match(/(?:الحزمة|اللغة)[\s\S]{0,60}/i);
  
  if (pkgMatch) {
    const text = pkgMatch[0];
    
    // 1. إذا كان يحتوي على "سيرتين" أو اللغتين معاً
    if (text.includes("سيرتين") || (text.includes("عربي") && text.includes("إنجليزي"))) {
      return "عربي + EN";
    }
    // 2. إذا كان إنجليزي فقط
    if (text.includes("إنجليزي") || text.includes("انجليزي") || text.includes("English")) {
      return "EN";
    }
  }
  
  // 3. الافتراضي (عربي)
  return "عربي";
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
      year: "numeric", month: "short", day: "numeric",
    });
  } catch (e) {
    return s;
  }
}

export function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function extractNameFromMarkdown(md) {
  if (!md) return "";
  const nameFieldRegex = /(?:-|\*)\s*(?:\*\*|__)?\s*(?:الاسم الكامل|الاسم|Name)\s*:\s*(?:\*\*|__)?\s*(.+?)(?:\n|$|\r)/i;
  const nameMatch = md.match(nameFieldRegex);
  if (nameMatch && nameMatch[1]) return nameMatch[1].trim();

  const h1Match = md.match(/(?:^|\n)#\s+([^\n]+)/);
  if (h1Match && h1Match[1]) {
    const title = h1Match[1].trim();
    if (!title.includes("طلب خدمة") && !title.includes("سيرتي المميزة")) return title;
  }
  return "";
}

export const Cloud = {
  save: async (key, binId, data) => {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": key },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("فشل الحفظ السحابي، تأكد من الإعدادات");
    return res.json();
  },
  load: async (key, binId) => {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { "X-Master-Key": key },
    });
    if (!res.ok) throw new Error("فشل الجلب السحابي، تأكد من الإعدادات");
    const json = await res.json();
    return json.record;
  },
};
