// src/components/Workspace/ActionBar.jsx
import React from "react";
import Icon from "../UI/Icon";
import { isArabic, fmtDate, extractNameFromMarkdown } from "../../utils/helpers";

export default function ActionBar({
  editMode, setEditMode, draftMode, setDraftMode, copyMarkdown,
  takeScreenshot, setShowCanvas, selected, isCollapsed, setIsCollapsed, toastAdd,
}) {

  const copyPhone = () => {
    if (!selected) return;
    const text = selected.data.markdown_data || "";
    const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;
    const matches = text.match(phoneRegex);
    const phone = matches?.find((m) => m.replace(/\D/g, "").length >= 9);

    if (phone) {
      navigator.clipboard.writeText(phone.trim());
      toastAdd(`تم نسخ الرقم: ${phone.trim()} ✓`, "success");
    } else {
      toastAdd("لم يتم العثور على رقم جوال في السيرة", "error");
    }
  };

  const copyName = () => {
    if (!selected) return;
    // الاستخراج الذكي للاسم للنسخ
    const nameToCopy = selected.data.name || extractNameFromMarkdown(selected.data.markdown_data);
    
    if (nameToCopy) {
      navigator.clipboard.writeText(nameToCopy);
      toastAdd("تم نسخ الاسم ✓", "success");
    } else {
      toastAdd("لم يتم العثور على اسم", "error");
    }
  };

  // الاسم المعروض في الأسفل
  const displayName = selected?.data?.name || extractNameFromMarkdown(selected?.data?.markdown_data) || "— بدون اسم —";

  return (
    <div style={{ position: "relative" }}>
      <div className={`action-bar-container ${isCollapsed ? "collapsed" : ""}`}>
        <div className="action-bar">
          <button className={`toggle-btn ${editMode ? "edit-active" : ""}`} onClick={() => setEditMode(!editMode)}>
            <Icon name="edit" size={14} /> {editMode ? "عرض النتيجة" : "تحرير Markdown"}
          </button>

          <button className={`toggle-btn ${draftMode ? "draft-active" : ""}`} onClick={() => setDraftMode(!draftMode)} disabled={editMode}>
            <Icon name="draft" size={14} /> {draftMode ? "إغلاق المسودة" : "مسودة"}
          </button>

          <div className="divider-v" />

          <button className="pill-btn" onClick={copyName} title="نسخ اسم العميل">نسخ الاسم</button>
          <button className="pill-btn" onClick={copyPhone} title="البحث عن الجوال ونسخه">نسخ الجوال</button>

          <div className="divider-v" />

          <button className="btn btn-secondary btn-sm" onClick={copyMarkdown} title="ينسخ مع ملاحظات المسودة">
            <Icon name="copy" size={14} /> نسخ Markdown
          </button>
          <button className="btn btn-secondary btn-sm" onClick={takeScreenshot} title="Ctrl+Shift+S">
            <Icon name="camera" size={14} /> تصوير <kbd>Ctrl+⇧+S</kbd>
          </button>

          <div className="divider-v" />

          <button className="btn btn-secondary btn-sm" onClick={() => setShowCanvas(true)}>
            <Icon name="canvas" size={14} /> اللوحة البصرية
          </button>

          {selected && (
            <div style={{ marginRight: "auto", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                {displayName}
              </span>
              <span>—</span>
              <span>{fmtDate(selected.created_at)}</span>
              {isArabic(selected.data.markdown_data) && (
                <span style={{ color: "var(--warning)", fontWeight: 600 }}>⊕ RTL</span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        className="collapse-top-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "إظهار شريط الأدوات" : "طي شريط الأدوات"}
      >
        <Icon name={isCollapsed ? "chevronDown" : "chevronUp"} size={14} />
      </button>
    </div>
  );
}
