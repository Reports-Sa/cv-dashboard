// src/components/Workspace/CanvasModal.jsx
import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import Icon from '../UI/Icon';

// استخدام React.memo لمنع إعادة تحميل اللوحة عند تحديث العداد في الخلفية
const CanvasModal = React.memo(function CanvasModal({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Icon name="canvas" size={20} style={{ color: 'var(--accent)' }} />
             <h3>🎨 اللوحة البصرية (إصدار 3.x المجاني)</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f8f9fa' }}>
          {/* 
             في الإصدار 3.6.1، اللوحة تعمل بكامل طاقتها. 
              persistenceKey يضمن بقاء رسوماتك محفوظة في المتصفح.
          */}
          <Tldraw persistenceKey="cv_ghazi_dashboard_v3" />
        </div>
      </div>
    </div>
  );
});

export default CanvasModal;
