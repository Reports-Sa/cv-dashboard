// src/components/SidebarLeft/PromptLibrary.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import Icon from "../UI/Icon";
import PromptModal from "./PromptModal";
import { LS } from "../../utils/helpers";

const INITIAL_PROMPTS =[
  {
    id: 1,
    title: "تحسين السيرة الذاتية",
    content: "قم بتحسين هذه السيرة الذاتية مع التركيز على إبراز الإنجازات القابلة للقياس.",
    category: "تحسين وتطوير",
  },
  {
    id: 2,
    title: "ملخص تنفيذي",
    content: "اكتب ملخصاً تنفيذياً مقنعاً من 3-4 جمل لهذا المرشح.",
    category: "تنسيق وكتابة",
  },
];

export default function PromptLibrary({ toastAdd }) {
  const [prompts, setPrompts] = useState(() => LS.get("prompts", INITIAL_PROMPTS));
  const[modal, setModal] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});
  const timers = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    LS.set("prompts", prompts);
  }, [prompts]);

  const grouped = useMemo(() => {
    const map = {};
    prompts.forEach((p) => {
      const cat = p.category || "أخرى";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [prompts]);

  const existingCategories = useMemo(() => Object.keys(grouped), [grouped]);

  const toggleCat = (cat) => setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleClick = (p) => {
    if (timers.current[p.id]) {
      clearTimeout(timers.current[p.id]);
      delete timers.current[p.id];
      setModal({ prompt: p });
      return;
    }
    timers.current[p.id] = setTimeout(() => {
      delete timers.current[p.id];
      navigator.clipboard.writeText(p.content).then(() => {
        setFlashId(p.id);
        setTimeout(() => setFlashId(null), 700);
        toastAdd("تم نسخ البرومبت ✓", "success");
      });
    }, 260);
  };

  const savePrompt = (p) => {
    setPrompts((prev) =>
      prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]
    );
    setModal(null);
  };

  const deletePrompt = (id, e) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا البرومبت؟")) {
      setPrompts((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const deleteCategory = (cat, e) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف المجلد "${cat}" وجميع البرومبتات بداخله؟`)) {
      setPrompts((prev) => prev.filter((x) => x.category !== cat));
    }
  };

  // ----- دوال التصدير والاستيراد -----
  const exportPrompts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts));
    const dlNode = document.createElement("a");
    dlNode.setAttribute("href", dataStr);
    dlNode.setAttribute("download", `cv_prompts_${Date.now()}.json`);
    document.body.appendChild(dlNode);
    dlNode.click();
    dlNode.remove();
    toastAdd("تم تصدير البرومبتات بنجاح 📤", "success");
  };

  const importPrompts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          const newPrompts = [...prompts];
          imported.forEach((ip) => {
            // إضافة البرومبت فقط إذا لم يكن موجوداً مسبقاً بنفس العنوان
            if (!newPrompts.some((p) => p.title === ip.title)) {
              newPrompts.push({ ...ip, id: Date.now() + Math.random() });
            }
          });
          setPrompts(newPrompts);
          toastAdd("تم استيراد البرومبتات بنجاح 📥", "success");
        }
      } catch (err) {
        toastAdd("ملف غير صالح للاستيراد!", "error");
      }
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="col-header">
        <h3>📚 مكتبة البرومبت</h3>
        <span className="count-badge">{prompts.length}</span>
      </div>
      <div className="col-body">
        
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
          onClick={() => setModal({ prompt: null })}
        >
          <Icon name="plus" size={14} /> إضافة برومبت
        </button>

        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => fileInputRef.current?.click()}>
            📥 استيراد
          </button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={exportPrompts}>
            📤 تصدير
          </button>
        </div>
        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".json" onChange={importPrompts} />

        {Object.keys(grouped).map((cat) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div className="cat-folder" onClick={() => toggleCat(cat)}>
              <div className="cat-folder-label">
                <span className={`cat-arrow ${collapsedCats[cat] ? "closed" : ""}`}>▾</span>
                <Icon name="folder" size={13} />
                {cat}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="cat-count">{grouped[cat].length}</span>
                <button className="delete-icon-btn" onClick={(e) => deleteCategory(cat, e)} title="حذف المجلد">
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>

            {!collapsedCats[cat] && (
              <div className="cat-items">
                {grouped[cat].map((p) => (
                  <div key={p.id} className="prompt-capsule" onClick={() => handleClick(p)}>
                    <div className="p-title">
                      {p.title}
                      <button className="delete-icon-btn" onClick={(e) => deletePrompt(p.id, e)}>
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                    <div className="p-preview">{p.content}</div>
                    {flashId === p.id && <div className="copy-flash">✓ نُسخ</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {modal && (
        <PromptModal prompt={modal.prompt} onClose={() => setModal(null)} onSave={savePrompt} existingCategories={existingCategories} />
      )}
    </>
  );
}
