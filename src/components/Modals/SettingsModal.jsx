// src/components/Modals/SettingsModal.jsx
import React, { useState } from "react";
import Icon from "../UI/Icon";

export default function SettingsModal({
  initialToken,
  initialFormId,
  onClose,
  onSave,
}) {
  const [token, setToken] = useState(initialToken || "");
  const [formId, setFormId] = useState(initialFormId || "");

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>⚙️ إعدادات الاتصال (Netlify)</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Netlify Access Token</label>
            <input
              className="form-input"
              type="password"
              placeholder="nfp_xxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Form ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="xxxxxxxxxxxxxxxx"
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              dir="ltr"
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            البيانات تُحفظ محلياً في متصفحك (localStorage) فقط لضمان الأمان.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(token, formId)}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
