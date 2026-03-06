// src/components/SidebarRight/ClientList.jsx
import React, { useState, useMemo } from "react";
import { fmtDate, extractNameFromMarkdown, extractLangFromMarkdown } from "../../utils/helpers";

export default function ClientList({ submissions, selected, onSelect, loading, tasksMeta }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions.filter((s) => {
      const extractedName = extractNameFromMarkdown(s.data.markdown_data);
      const searchName = (s.data.name || extractedName || "").toLowerCase();
      const searchEmail = (s.data.email || "").toLowerCase();
      return !q || searchName.includes(q) || searchEmail.includes(q);
    });
  },[submissions, search]);

  return (
    <>
      <div className="col-header">
        <h3>👥 العملاء</h3>
        {loading ? <div className="spinner" /> : <span className="count-badge">{submissions.length}</span>}
      </div>
      <div className="col-body">
        <input
          className="search-input"
          placeholder="بحث بالاسم أو الإيميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtered.map((s) => {
          // استخراج اللغة
          const lang = extractLangFromMarkdown(s.data.markdown_data);
          
          // تحديد تصميم علامة (Badge) اللغة بناءً على النتيجة
          let badgeClass = "badge";
          let badgeStyle = {};
          
          if (lang === "عربي") {
            badgeClass += " ar"; // برتقالي (موجود مسبقاً في CSS)
          } else if (lang === "EN") {
            badgeStyle = { background: '#dbeafe', color: '#1e40af' }; // أزرق للإنجليزي
          } else {
            // عربي + EN (حزمة السيرتين)
            badgeStyle = { background: '#f3e8ff', color: '#7e22ce' }; // بنفسجي للباقتين
          }

          const displayName = s.data.name || extractNameFromMarkdown(s.data.markdown_data) || "— بدون اسم —";
          
          const meta = (tasksMeta && tasksMeta[s.id]) || { status: "new" };
          let statusClass = "";
          let badge = null;

          if (meta.status === "completed") {
            statusClass = "status-completed";
            badge = <span className="status-badge-mini st-green">✔ منجز</span>;
          } else if (meta.status === "in_progress") {
            statusClass = "status-in_progress";
            badge = <span className="status-badge-mini st-blue">⏳ جارٍ</span>;
          } else if (meta.status === "paused") {
            statusClass = "status-paused";
            badge = <span className="status-badge-mini st-orange">⏸ متوقف</span>;
          } else if (meta.status === "canceled") {
            statusClass = "status-canceled";
            badge = <span className="status-badge-mini st-red">✕ ملغي</span>;
          }

          return (
            <div
              key={s.id}
              className={`client-card ${selected?.id === s.id ? "active" : ""} ${statusClass}`}
              onClick={() => onSelect(s)}
            >
              <div className="name">{displayName}</div>
              <div className="meta">
                <span className={badgeClass} style={badgeStyle}>
                  {lang}
                </span>
                <span>{fmtDate(s.created_at)}</span>
                {badge}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>لا توجد نتائج</div>
        )}
      </div>
    </>
  );
}
