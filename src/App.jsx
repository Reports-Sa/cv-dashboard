// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";

import { LS, extractNameFromMarkdown } from "./utils/helpers";
import Icon from "./components/UI/Icon";
import Toasts from "./components/UI/Toast";
import PromptLibrary from "./components/SidebarLeft/PromptLibrary";
import ClientList from "./components/SidebarRight/ClientList";
import ActionBar from "./components/Workspace/ActionBar";
import CVRenderer from "./components/Workspace/CVRenderer";
import SettingsModal from "./components/Modals/SettingsModal";
import CanvasModal from "./components/Modals/CanvasModal";

const MOCK_SUBMISSIONS =[
  { id: "sub_001", created_at: "2025-01-15T09:30:00Z", data: { name: "", email: "ahmed@example.com", markdown_data: "# 📋 طلب خدمة سيرة ذاتية\n\n## 2️⃣ المعلومات الشخصية\n\n- **الاسم الكامل:** أحمد محمد العلي\n- **رقم الجوال:** 0500000000" } }
];

export default function App() {
  const [toasts, setToasts] = useState([]);
  const toastAdd = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) =>[...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  const [token, setToken] = useState(() => LS.get("netlify_token", ""));
  const [formId, setFormId] = useState(() => LS.get("netlify_form_id", ""));
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [draftMode, setDraftMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const[draftNotes, setDraftNotes] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const[isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isActionCollapsed, setIsActionCollapsed] = useState(false);

  // --- منطق إدارة المهام والمؤقت ---
  const [tasksMeta, setTasksMeta] = useState(() => LS.get("tasks_meta", {})); 

  // حفظ حالة المهام في التخزين المحلي عند أي تغيير
  useEffect(() => { LS.set("tasks_meta", tasksMeta); }, [tasksMeta]);

  const handleTaskAction = (action) => {
    if (!selected) return;
    const id = selected.id;
    const now = Date.now();
    const currentMeta = tasksMeta[id] || { status: "new", seconds: 0, lastStart: null };

    let newMeta = { ...currentMeta };

    if (action === "start") {
      newMeta.status = "in_progress";
      newMeta.lastStart = now;
      toastAdd("بدأ حساب الوقت ⏳", "info");
    } else if (action === "pause") {
      newMeta.status = "paused";
      const diff = Math.floor((now - currentMeta.lastStart) / 1000);
      newMeta.seconds += diff;
      newMeta.lastStart = null;
      toastAdd("تم إيقاف المؤقت", "info");
    } else if (action === "complete") {
      newMeta.status = "completed";
      if (currentMeta.status === "in_progress") {
        const diff = Math.floor((now - currentMeta.lastStart) / 1000);
        newMeta.seconds += diff;
      }
      newMeta.lastStart = null;
      toastAdd("تم إنجاز الطلب! 🎉", "success");
    } else if (action === "cancel") {
      if (window.confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
        newMeta.status = "canceled";
        newMeta.lastStart = null;
        toastAdd("تم إلغاء الطلب", "error");
      } else {
        return; 
      }
    }

    setTasksMeta(prev => ({ ...prev, [id]: newMeta }));
  };
  // --------------------------------

  const fetchSubmissions = useCallback((silent = false) => {
    if (!token || !formId) { if (!silent) toastAdd("لم يتم تهيئة الرمز", "info"); return; }
    if (!silent) setLoading(true);
    fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setSubmissions(data); if (!silent) toastAdd(`تم التحديث (${data.length})`, "success"); })
      .catch(() => { if (!silent) setSubmissions(MOCK_SUBMISSIONS); })
      .finally(() => { if (!silent) setLoading(false); });
  }, [token, formId, toastAdd]);

  useEffect(() => { if (token && formId) fetchSubmissions(true); },[token, formId, fetchSubmissions]);
  useEffect(() => { if (!token || !formId) return; const i = setInterval(() => fetchSubmissions(true), 30000); return () => clearInterval(i); },[token, formId, fetchSubmissions]);

  useEffect(() => { if (!selected) return; setDraftNotes(LS.get(`drafts_${selected.id}`, {})); setEditMode(false); },[selected?.id]);

  const handleDraftChange = useCallback((key, val) => {
    setDraftNotes(prev => { const next = { ...prev, [key]: val }; if (selected) LS.set(`drafts_${selected.id}`, next); return next; });
  }, [selected?.id]);

  const handleMarkdownChange = useCallback((newMd) => {
    if (!selected) return;
    const updated = { ...selected, data: { ...selected.data, markdown_data: newMd } };
    setSelected(updated);
    setSubmissions(prev => prev.map(s => (s.id === selected.id ? updated : s)));
  }, [selected?.id]);

  const copyMarkdown = () => {
    if (!selected) return;
    const lines = (selected.data.markdown_data || "").split("\n");
    const out =[]; let hIdx = 0;
    lines.forEach(line => {
      out.push(line);
      if (/^#{2,3}\s/.test(line)) {
        const note = draftNotes[`${selected.id}_${hIdx}`];
        if (note?.trim()) out.push("", `> **ملاحظة:** ${note.trim()}`, "");
        hIdx++;
      }
    });
    navigator.clipboard.writeText(out.join("\n")).then(() => toastAdd("تم النسخ ✓", "success"));
  };

  const takeScreenshot = useCallback(() => {
    const el = document.querySelector(".cv-content");
    if (!el) return;
    toastAdd("جاري التصوير...", "info");
    html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
      const link = document.createElement("a");
      link.download = `cv_${selected?.id}_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toastAdd("تم الحفظ ✓", "success");
    });
  }, [selected, toastAdd]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); takeScreenshot(); }
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const anyOpen = isLeftOpen || isRightOpen || !isActionCollapsed;
        if (anyOpen) { setIsLeftOpen(false); setIsRightOpen(false); setIsActionCollapsed(true); } 
        else { setIsLeftOpen(true); setIsRightOpen(true); setIsActionCollapsed(false); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [takeScreenshot, isLeftOpen, isRightOpen, isActionCollapsed]);

  const displaySelectedName = selected?.data?.name || extractNameFromMarkdown(selected?.data?.markdown_data) || "—";

  return (
    <>
      <header className="header">
        <div className="header-brand"><div className="dot" /> لوحة إدارة السير الذاتية | غازي</div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => fetchSubmissions(false)}>
            {loading ? <div className="spinner" /> : <Icon name="refresh" size={14} />} تحديث
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(true)}><Icon name="settings" size={18} /></button>
        </div>
      </header>
      {loading && <div className="loading-bar" />}

      <div className="layout">
        <div className="col-left" style={{ width: isLeftOpen ? 240 : 0, borderLeftColor: isLeftOpen ? "" : "transparent" }}>
          <PromptLibrary toastAdd={toastAdd} />
        </div>

        <div className="col-mid">
          <button className="sidebar-toggle toggle-right" onClick={() => setIsLeftOpen(!isLeftOpen)}>{isLeftOpen ? "›" : "‹"}</button>
          <button className="sidebar-toggle toggle-left" onClick={() => setIsRightOpen(!isRightOpen)}>{isRightOpen ? "‹" : "›"}</button>

          <ActionBar
            editMode={editMode} setEditMode={setEditMode} draftMode={draftMode} setDraftMode={setDraftMode}
            copyMarkdown={copyMarkdown} takeScreenshot={takeScreenshot} setShowCanvas={setShowCanvas}
            selected={selected} isCollapsed={isActionCollapsed} setIsCollapsed={setIsActionCollapsed} toastAdd={toastAdd}
            taskMeta={selected ? (tasksMeta[selected.id] || {}) : {}}
            onTaskAction={handleTaskAction}
          />

          <div className="workspace-body">
            <CVRenderer
              submission={selected} editMode={editMode} draftMode={draftMode && !editMode}
              draftNotes={draftNotes} onDraftChange={handleDraftChange} onMarkdownChange={handleMarkdownChange}
            />
          </div>
        </div>

        <div className="col-right" style={{ width: isRightOpen ? 240 : 0, borderRightColor: isRightOpen ? "" : "transparent" }}>
          <ClientList
            submissions={submissions} selected={selected} onSelect={setSelected} loading={loading}
            tasksMeta={tasksMeta} 
          />
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-dot ${token && formId ? "" : "warn"}`} />
        <span>{token && formId ? "متصل" : "تجريبي"}</span>
        <span>| {submissions.length} سجل</span>
        {selected && <span>| {displaySelectedName}</span>}
      </div>

      {showSettings && <SettingsModal initialToken={token} initialFormId={formId} onClose={() => setShowSettings(false)} onSave={(t, f) => { setToken(t); setFormId(f); LS.set("netlify_token", t); LS.set("netlify_form_id", f); setShowSettings(false); setTimeout(() => fetchSubmissions(false), 100); }} />}
      {showCanvas && <CanvasModal onClose={() => setShowCanvas(false)} />}
      <Toasts toasts={toasts} />
    </>
  );
}
