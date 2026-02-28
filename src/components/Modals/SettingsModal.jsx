// src/components/Modals/SettingsModal.jsx
import React, { useState } from 'react';
import Icon from '../UI/Icon';

export default function SettingsModal({ initialToken, initialFormId, initialBinKey, initialBinId, onClose, onSave }) {
  const [token, setToken] = useState(initialToken || '');
  const [formId, setFormId] = useState(initialFormId || '');
  const [binKey, setBinKey] = useState(initialBinKey || '');
  const[binId, setBinId] = useState(initialBinId || '');

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h3>⚙️ الإعدادات العامة</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          <h4 style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>1. إعدادات جلب العملاء (Netlify)</h4>
          <div className="form-group">
            <label className="form-label">Netlify Access Token</label>
            <input className="form-input" type="password" placeholder="nfp_xxxxxxxxxxxxx" value={token} onChange={e => setToken(e.target.value)} dir="ltr" />
          </div>
          <div className="form-group">
            <label className="form-label">Netlify Form ID</label>
            <input className="form-input" type="text" placeholder="xxxxxxxxxxxxxxxx" value={formId} onChange={e => setFormId(e.target.value)} dir="ltr" />
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          
          <h4 style={{ fontSize: 13, color: 'var(--success)', marginBottom: 12 }}>2. إعدادات السحابة (JSONBin)</h4>
          <div className="form-group">
            <label className="form-label">JSONBin Master Key</label>
            <input className="form-input" type="password" placeholder="$2a$xxxxxxxxxxxxx" value={binKey} onChange={e => setBinKey(e.target.value)} dir="ltr" />
          </div>
          <div className="form-group">
            <label className="form-label">JSONBin Bin ID</label>
            <input className="form-input" type="text" placeholder="xxxxxxxxxxxxxxxx" value={binId} onChange={e => setBinId(e.target.value)} dir="ltr" />
          </div>
          
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>جميع المفاتيح تُحفظ في متصفحك محلياً لضمان الخصوصية.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={() => onSave(token, formId, binKey, binId)}>حفظ الإعدادات</button>
        </div>
      </div>
    </div>
  );
}
