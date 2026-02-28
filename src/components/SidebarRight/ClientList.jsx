// src/components/SidebarRight/ClientList.jsx
import React, { useState, useMemo } from "react";
import { isArabic, fmtDate } from "../../utils/helpers";

export default function ClientList({
  submissions,
  selected,
  onSelect,
  loading,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions.filter(
      (s) =>
        !q ||
        (s.data.name || "").toLowerCase().includes(q) ||
        (s.data.email || "").toLowerCase().includes(q),
    );
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
          return (
            <div
              key={s.id}
              className={`client-card ${selected?.id === s.id ? "active" : ""}`}
              onClick={() => onSelect(s)}
            >
              <div className="name">{s.data.name || "— بدون اسم —"}</div>
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
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 12,
              padding: "20px 0",
            }}
          >
            لا توجد نتائج
          </div>
        )}
      </div>
    </>
  );
}
