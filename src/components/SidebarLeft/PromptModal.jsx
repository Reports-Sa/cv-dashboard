// src/components/SidebarLeft/PromptModal.jsx
import React, { useState, useMemo } from "react";
import Icon from "../UI/Icon";

const DEFAULT_CATS = [
  "تحسين وتطوير",
  "ترجمة",
  "تحليل وتقييم",
  "تنسيق وكتابة",
  "أخرى",
];

export default function PromptModal({
  prompt,
  onClose,
  onSave,
  existingCategories,
}) {
  const [title, setTitle] = useState(prompt?.title || "");
  const [content, setContent] = useState(prompt?.content || "");
  const [category, setCategory] = useState(prompt?.category || DEFAULT_CATS[0]);
  const [customCat, setCustomCat] = useState("");

  const allCats = useMemo(() => {
    const merged = [...DEFAULT_CATS];
    (existingCategories || []).forEach((c) => {
      if (!merged.includes(c)) merged.push(c);
    });
    return merged;
  }, [existingCategories]);

  const isCustom = category === "__custom__";

  const handleSave = () => {
    const finalCat = isCustom ? customCat.trim() || "أخرى" : category;
    onSave({
      id: prompt?.id || Date.now(),
      title,
      content,
      category: finalCat,
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>{prompt?.id ? "تعديل البرومبت" : "إضافة برومبت جديد"}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">الفئة / المجلد</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {allCats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom__">+ فئة جديدة...</option>
            </select>
          </div>
          {isCustom && (
            <div className="form-group">
              <label className="form-label">اسم الفئة الجديدة</label>
              <input
                className="form-input"
                placeholder="مثال: مقابلات العمل"
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">عنوان البرومبت</label>
            <input
              className="form-input"
              placeholder="عنوان مختصر..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">محتوى البرومبت</label>
            <textarea
              className="form-input form-textarea"
              placeholder="اكتب تعليمات البرومبت هنا..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
