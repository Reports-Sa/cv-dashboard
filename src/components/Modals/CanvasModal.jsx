// src/components/Modals/CanvasModal.jsx
import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import Icon from '../UI/Icon';

const CanvasModal = React.memo(function CanvasModal({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Icon name="canvas" size={20} style={{ color: 'var(--accent)' }} />
             <h3>🎨 اللوحة البصرية (النسخة الاحترافية المرخصة)</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f8f9fa' }}>
          {/* 
            تمت الترقية للإصدار الأحدث!
            ضع مفتاح الرخصة الخاص بك بالكامل داخل علامتي التنصيص هنا
          */}
          <Tldraw 
            persistenceKey="cv_ghazi_dashboard_pro" 
            licenseKey="tldraw-2031-03-02/WyJrRV90UFNpTyIsWyIqLmN2LWdoYXppLWRhc2gubmV0bGlmeS5hcHAiXSw5LCIyMDMxLTAzLTAyIl0.ma+R1gARqQ/yZUomqCpsBu3FbtnXML8wyUfzD0S5pmfDbNGgOObD3XQQxkH353jZoao2gA1yQs9lU6ZUULUhdg"
          />
        </div>
      </div>
    </div>
  );
});

export default CanvasModal;
