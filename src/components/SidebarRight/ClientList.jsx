// src/components/SidebarRight/ClientList.jsx
import React, { useState, useMemo } from "react";
import { isArabic, fmtDate, extractNameFromMarkdown, LS } from "../../utils/helpers";

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
  }, [submissions, search]);

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
          const ar = isArabic(s.data.markdown_data);
          const displayName = s.data.name || extractNameFromMarkdown(s.data.markdown_data) || "— بدون اسم —";
          
          // تحديد الحالة والستايل
          const meta = tasksMeta[s.id] || { status: "new" };
          let statusClass = "";
          if (meta.status === "completed") statusClass = "status-completed";
          else if (meta.status === "in_progress") statusClass = "status-progress";
          else if (meta.status === "canceled") statusClass = "status-canceled";

          return (
            <div
              key={s.id}
              className={`client-card ${selected?.id === s.id ? "active" : ""} ${statusClass}`}
              onClick={() => onSelect(s)}
            >
              <div className="name">{displayName}</div>
              <div className="meta">
                <span className={`badge ${ar ? "ar" : ""}`}>{ar ? "عربي" : "EN"}</span>
                <span>{fmtDate(s.created_at)}</span>
                {meta.status === "completed" && <span className="status-badge-mini st-green">✔ منجز</span>}
                {meta.status === "in_progress" && <span className="status-badge-mini st-orange">⏳ جاري</span>}
                {meta.status === "canceled" && <span className="status-badge-mini st-red">✕ ملغي</span>}
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
