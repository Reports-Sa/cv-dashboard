// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";

import { LS, isArabic, fmtDate } from "./utils/helpers";
import Icon from "./components/UI/Icon";
import Toasts from "./components/UI/Toast";
import PromptLibrary from "./components/SidebarLeft/PromptLibrary";
import ClientList from "./components/SidebarRight/ClientList";
import ActionBar from "./components/Workspace/ActionBar";
import CVRenderer from "./components/Workspace/CVRenderer";
import SettingsModal from "./components/Modals/SettingsModal";
import CanvasModal from "./components/Modals/CanvasModal";

// Mock Data
const MOCK_SUBMISSIONS = [
  {
    id: "sub_001",
    created_at: "2025-01-15T09:30:00Z",
    data: {
      name: "أحمد محمد العلي",
      email: "ahmed@example.com",
      markdown_data:
        "# أحمد محمد العلي\n**مطور برمجيات أول | متخصص في الذكاء الاصطناعي**\nالرياض، المملكة العربية السعودية | ahmed@example.com | +966 50 000 0000\n\n---\n\n## الملخص المهني\nمطور برمجيات متمرس بخبرة تزيد عن 8 سنوات...",
    },
  },
  {
    id: "sub_002",
    created_at: "2025-01-18T14:20:00Z",
    data: {
      name: "Sara Ahmed Johnson",
      email: "sara@example.com",
      markdown_data:
        "# Sara Ahmed Johnson\n**Product Designer & UX Strategist**\nDubai, UAE | sara@example.com | +971 50 123 4567\n\n---\n\n## Professional Summary\nCreative product designer...",
    },
  },
];

export default function App() {
  const [toasts, setToasts] = useState([]);
  const toastAdd = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  const [token, setToken] = useState(() => LS.get("netlify_token", ""));
  const [formId, setFormId] = useState(() => LS.get("netlify_form_id", ""));
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [draftMode, setDraftMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draftNotes, setDraftNotes] = useState({});

  const [showSettings, setShowSettings] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isActionCollapsed, setIsActionCollapsed] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setDraftNotes(LS.get(`drafts_${selected.id}`, {}));
    setEditMode(false);
  }, [selected?.id]);

  const handleDraftChange = useCallback(
    (key, val) => {
      setDraftNotes((prev) => {
        const next = { ...prev, [key]: val };
        if (selected) LS.set(`drafts_${selected.id}`, next);
        return next;
      });
    },
    [selected?.id],
  );

  const handleMarkdownChange = useCallback(
    (newMd) => {
      if (!selected) return;
      const updated = {
        ...selected,
        data: { ...selected.data, markdown_data: newMd },
      };
      setSelected(updated);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selected.id ? updated : s)),
      );
    },
    [selected?.id],
  );

  const fetchSubmissions = () => {
    if (!token || !formId) {
      toastAdd("لم يتم تهيئة الرمز — بيانات تجريبية", "info");
      return;
    }
    setLoading(true);
    fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => {
        setSubmissions(data);
        toastAdd(`تم تحميل ${data.length} طلب بنجاح`, "success");
      })
      .catch((e) => {
        toastAdd(`خطأ: ${e.message}`, "error");
        setSubmissions(MOCK_SUBMISSIONS);
      })
      .finally(() => setLoading(false));
  };

  const copyMarkdown = () => {
    if (!selected) {
      toastAdd("اختر عميلاً أولاً", "error");
      return;
    }
    const lines = (selected.data.markdown_data || "").split("\n");
    const out = [];
    let hIdx = 0;
    lines.forEach((line) => {
      out.push(line);
      if (/^#{2,3}\s/.test(line)) {
        const note = draftNotes[`${selected.id}_${hIdx}`];
        if (note && note.trim()) {
          out.push("", `> **ملاحظة المستشار:** ${note.trim()}`, "");
        }
        hIdx++;
      }
    });
    navigator.clipboard
      .writeText(out.join("\n"))
      .then(() => toastAdd("تم نسخ Markdown مع الملاحظات ✓", "success"));
  };

  const takeScreenshot = useCallback(() => {
    const el = document.querySelector(".cv-content");
    if (!el) {
      toastAdd("لا يوجد محتوى — تأكد من وضع العرض", "error");
      return;
    }
    toastAdd("جاري التصوير...", "info");
    html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `cv_${selected?.id || "shot"}_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toastAdd("تم حفظ الصورة ✓", "success");
      })
      .catch(() => toastAdd("فشل التصوير", "error"));
  }, [selected, toastAdd]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        takeScreenshot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [takeScreenshot]);

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <div className="dot" /> لوحة إدارة السير الذاتية
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchSubmissions}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <Icon name="refresh" size={14} />
            )}{" "}
            تحديث البيانات
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowSettings(true)}
          >
            <Icon name="settings" size={18} />
          </button>
        </div>
      </header>
      {loading && <div className="loading-bar" />}

      <div className="layout">
        <div
          className="col-left"
          style={{
            width: isLeftOpen ? 240 : 0,
            borderLeftColor: isLeftOpen ? "" : "transparent",
          }}
        >
          <PromptLibrary toastAdd={toastAdd} />
        </div>

        <div className="col-mid">
          <button
            className="sidebar-toggle toggle-right"
            onClick={() => setIsLeftOpen(!isLeftOpen)}
          >
            {isLeftOpen ? "›" : "‹"}
          </button>
          <button
            className="sidebar-toggle toggle-left"
            onClick={() => setIsRightOpen(!isRightOpen)}
          >
            {isRightOpen ? "‹" : "›"}
          </button>

          <ActionBar
            editMode={editMode}
            setEditMode={setEditMode}
            draftMode={draftMode}
            setDraftMode={setDraftMode}
            copyMarkdown={copyMarkdown}
            takeScreenshot={takeScreenshot}
            setShowCanvas={setShowCanvas}
            selected={selected}
            isCollapsed={isActionCollapsed}
            setIsCollapsed={setIsActionCollapsed}
            toastAdd={toastAdd}
          />

          <div className="workspace-body">
            <CVRenderer
              submission={selected}
              editMode={editMode}
              draftMode={draftMode && !editMode}
              draftNotes={draftNotes}
              onDraftChange={handleDraftChange}
              onMarkdownChange={handleMarkdownChange}
            />
          </div>
        </div>

        <div
          className="col-right"
          style={{
            width: isRightOpen ? 240 : 0,
            borderRightColor: isRightOpen ? "" : "transparent",
          }}
        >
          <ClientList
            submissions={submissions}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
          />
        </div>
      </div>

      <div className="status-bar">
        <span className={`status-dot ${token && formId ? "" : "warn"}`} />
        <span>{token && formId ? "متصل بـ Netlify" : "بيانات تجريبية"}</span>
        <span>| {submissions.length} سجل</span>
        {selected && <span>| {selected.data.name}</span>}
      </div>

      {showSettings && (
        <SettingsModal
          initialToken={token}
          initialFormId={formId}
          onClose={() => setShowSettings(false)}
          onSave={(t, f) => {
            setToken(t);
            setFormId(f);
            LS.set("netlify_token", t);
            LS.set("netlify_form_id", f);
            setShowSettings(false);
            toastAdd("تم حفظ الإعدادات ✓", "success");
          }}
        />
      )}
      {showCanvas && <CanvasModal onClose={() => setShowCanvas(false)} />}
      <Toasts toasts={toasts} />
    </>
  );
}
