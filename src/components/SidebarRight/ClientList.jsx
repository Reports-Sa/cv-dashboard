// src/components/SidebarRight/ClientList.jsx
import React, { useState, useMemo } from "react";
import { isArabic, fmtDate, extractNameFromMarkdown } from "../../utils/helpers";

export default function ClientList({ submissions, selected, onSelect, loading }) {
  const[search, setSearch] = useState("");

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
        {loading ? (
          <div className="spinner" />
        ) : (
          <span className="count-badge">{submissions.length}</span>
        )}
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
          // هنا يتم تطبيق الاستخراج الذكي للاسم
          const displayName = s.data.name || extractNameFromMarkdown(s.data.markdown_data) || "— بدون اسم —";
          
          return (
            <div
              key={s.id}
              className={`client-card ${selected?.id === s.id ? "active" : ""}`}
              onClick={() => onSelect(s)}
            >
              <div className="name">{displayName}</div>
              <div className="meta">
                <span className={`badge ${ar ? "ar" : ""}`}>
                  {ar ? "عربي" : "EN"}
                </span>
                <span>{fmtDate(s.created_at)}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>
            لا توجد نتائج
          </div>
        )}
      </div>
    </>
  );
}
