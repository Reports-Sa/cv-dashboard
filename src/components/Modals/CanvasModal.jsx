// src/components/Modals/CanvasModal.jsx
import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import Icon from '../UI/Icon';

// نستخدم React.memo لمنع إعادة رسم اللوحة عند تحديث المؤقت في الخلفية
const CanvasModal = React.memo(function CanvasModal({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>🎨 اللوحة البصرية (مساحة التفكير)</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f8f9fa' }}>
          <Tldraw persistenceKey="cv-dashboard-canvas" />
        </div>
      </div>
    </div>
  );
});

export default CanvasModal;
