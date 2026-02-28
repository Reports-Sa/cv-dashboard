// src/components/Workspace/CVRenderer.jsx
import React, { useEffect, useRef } from "react";
import { marked } from "marked";
import { isArabic } from "../../utils/helpers";
import Icon from "../UI/Icon";

export default function CVRenderer({
  submission,
  draftMode,
  draftNotes,
  editMode,
  onDraftChange,
  onMarkdownChange,
}) {
  const ref = useRef(null);
  const md = submission?.data?.markdown_data || "";
  const rtl = isArabic(md);

  useEffect(() => {
    if (editMode || !ref.current || !md) return;
    ref.current.innerHTML = marked.parse(md);

    if (draftMode && submission) {
      const headings = ref.current.querySelectorAll("h2, h3");
      headings.forEach((h, i) => {
        const key = `${submission.id}_${i}`;
        const wrap = document.createElement("div");

        const lbl = document.createElement("span");
        lbl.className = "draft-label";
        lbl.textContent = "📝 ملاحظات المسودة";

        const ta = document.createElement("textarea");
        ta.className = "draft-area";
        ta.placeholder = "أضف ملاحظاتك هنا...";
        ta.value = draftNotes[key] || "";
        ta.addEventListener("input", (e) => onDraftChange(key, e.target.value));

        wrap.appendChild(lbl);
        wrap.appendChild(ta);
        h.parentNode.insertBefore(wrap, h.nextSibling);
      });
    }
  }, [md, draftMode, editMode, submission, draftNotes, onDraftChange]);

  if (!submission) {
    return (
      <div className="empty-state">
        <Icon name="folder" size={64} style={{ opacity: 0.3 }} />
        <h4>لم يتم اختيار عميل</h4>
        <p>اختر عميلاً من القائمة الجانبية لعرض سيرته الذاتية</p>
      </div>
    );
  }

  if (editMode) {
    return (
      <div
        className="cv-card"
        style={{ display: "flex", flexDirection: "column", minHeight: 500 }}
      >
        <div className="edit-mode-banner">
          <Icon name="edit" size={14} /> وضع التحرير المباشر — Markdown الخام
        </div>
        <textarea
          className="cv-edit-textarea"
          value={md}
          onChange={(e) => onMarkdownChange(e.target.value)}
          spellCheck={false}
          dir={rtl ? "rtl" : "ltr"}
          placeholder="محتوى Markdown..."
        />
      </div>
    );
  }

  return (
    <div className="cv-card">
      <div ref={ref} className="cv-content" dir={rtl ? "rtl" : "ltr"} />
    </div>
  );
}
