// src/components/Workspace/ActionBar.jsx
import React from "react";
import Icon from "../UI/Icon";
import { isArabic, fmtDate, extractNameFromMarkdown, formatTime } from "../../utils/helpers";

export default function ActionBar({
  editMode, setEditMode, draftMode, setDraftMode, copyMarkdown,
  takeScreenshot, setShowCanvas, selected, isCollapsed, setIsCollapsed, toastAdd,
  taskMeta, onTaskAction, currentTimer // Props الجديدة للمؤقت
}) {

  const copyPhone = () => {
    if (!selected) return;
    const text = selected.data.markdown_data || "";
    const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;
    const matches = text.match(phoneRegex);
    const phone = matches?.find((m) => m.replace(/\D/g, "").length >= 9);
    if (phone) { navigator.clipboard.writeText(phone.trim()); toastAdd(`تم نسخ الرقم: ${phone.trim()} ✓`, "success"); } 
    else { toastAdd("لم يتم العثور على رقم جوال", "error"); }
  };

  const copyName = () => {
    if (!selected) return;
    const nameToCopy = selected.data.name || extractNameFromMarkdown(selected.data.markdown_data);
    if (nameToCopy) { navigator.clipboard.writeText(nameToCopy); toastAdd("تم نسخ الاسم ✓", "success"); } 
    else { toastAdd("لم يتم العثور على اسم", "error"); }
  };

  const displayName = selected?.data?.name || extractNameFromMarkdown(selected?.data?.markdown_data) || "— بدون اسم —";
  const status = taskMeta?.status || "new";

  return (
    <div style={{ position: "relative" }}>
      <div className={`action-bar-container ${isCollapsed ? "collapsed" : ""}`}>
        <div className="action-bar">
          
          {/* ----- منطقة التحكم بالمؤقت ----- */}
          {selected && (
            <>
              {status === "in_progress" ? (
                <>
                  <div className="timer-widget active">
                    <span style={{color:'var(--danger)', fontSize:16}}>●</span> {formatTime(currentTimer)}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => onTaskAction("pause")} title="إيقاف مؤقت">
                    ⏸ إيقاف
                  </button>
                  <button className="btn btn-primary btn-sm" style={{background:'var(--success)'}} onClick={() => onTaskAction("complete")} title="إتمام الطلب">
                    ✔ تم الإنجاز
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => onTaskAction("start")} title="بدء العمل وحساب الوقت">
                  ▶ بدء التنفيذ
                </button>
              )}
              
              {/* أزرار الحالات الأخرى */}
              {status !== "canceled" && status !== "new" && status !== "in_progress" && (
                 <div className="timer-widget">الزمن الكلي: {formatTime(taskMeta.seconds || 0)}</div>
              )}
              
              {(status === "in_progress" || status === "paused") && (
                 <button className="btn btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={() => onTaskAction("cancel")} title="إلغاء الطلب">
                   ⛔
                 </button>
              )}
              
              <div className="divider-v" />
            </>
          )}

          <button className={`toggle-btn ${editMode ? "edit-active" : ""}`} onClick={() => setEditMode(!editMode)}>
            <Icon name="edit" size={14} /> {editMode ? "عرض" : "تحرير"}
          </button>

          <button className={`toggle-btn ${draftMode ? "draft-active" : ""}`} onClick={() => setDraftMode(!draftMode)} disabled={editMode}>
            <Icon name="draft" size={14} /> {draftMode ? "إغلاق" : "مسودة"}
          </button>

          <div className="divider-v" />
          <button className="pill-btn" onClick={copyName}>نسخ الاسم</button>
          <button className="pill-btn" onClick={copyPhone}>نسخ الجوال</button>
          <div className="divider-v" />

          <button className="btn btn-secondary btn-sm" onClick={copyMarkdown} title="نسخ Markdown"><Icon name="copy" size={14} /></button>
          <button className="btn btn-secondary btn-sm" onClick={takeScreenshot} title="تصوير"><Icon name="camera" size={14} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCanvas(true)}><Icon name="canvas" size={14} /></button>

          {selected && (
            <div style={{ marginRight: "auto", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{displayName}</span>
              {isArabic(selected.data.markdown_data) && <span style={{ color: "var(--warning)", fontWeight: 600 }}>⊕ RTL</span>}
            </div>
          )}
        </div>
      </div>
      <button className="collapse-top-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        <Icon name={isCollapsed ? "chevronDown" : "chevronUp"} size={14} />
      </button>
    </div>
  );
}
