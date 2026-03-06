// src/components/Modals/CanvasModal.jsx
import React, { useState } from 'react';
import { Tldraw, exportToBlob, ShapeUtil, HTMLContainer, T } from 'tldraw';
import 'tldraw/tldraw.css';
import Icon from '../UI/Icon';

// ==========================================
// 1. هندسة الـ Node الاحترافي (CV Section Node)
// ==========================================
const cvNodeProps = {
  w: T.number,
  h: T.number,
  title: T.string,
  content: T.string,
  color: T.string,
};

class CvNodeUtil extends ShapeUtil {
  static type = 'cv-node';
  static props = cvNodeProps;

  getDefaultProps() {
    return { 
      w: 280, h: 180, 
      title: 'عنوان القسم (مثال: خبرات)', 
      content: 'اكتب التفاصيل هنا...',
      color: '#0A66C2' // اللون الافتراضي (أزرق)
    };
  }

  getGeometry(shape) {
    return new window.tldraw.Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // تصميم الـ Node ليكون مطابقاً لبرامج الـ Workflow 
  component(shape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          height: shape.props.h,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: `2px solid ${shape.props.color}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'all',
          direction: 'rtl',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif"
        }}
      >
        {/* رأس الـ Node (Header) */}
        <div style={{
          backgroundColor: shape.props.color,
          color: '#fff',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          {/* نقطة اتصال وهمية للشكل الجمالي */}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.5 }}></div>
          <input 
            type="text" 
            defaultValue={shape.props.title}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { title: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()} 
            style={{ 
              background: 'transparent', border: 'none', color: '#fff', 
              fontWeight: '600', fontSize: '14px', width: '100%', outline: 'none' 
            }}
          />
        </div>
        
        {/* محتوى الـ Node (Body) */}
        <div style={{ flex: 1, padding: '12px', backgroundColor: '#fafbfc' }}>
          <textarea
            defaultValue={shape.props.content}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { content: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: '100%', height: '100%', border: 'none', outline: 'none',
              resize: 'none', fontSize: '13px', color: '#333',
              backgroundColor: 'transparent', lineHeight: '1.7'
            }}
            placeholder="اكتب المحتوى هنا..."
          />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}

const customShapeUtils =[CvNodeUtil];

// ==========================================
// 2. مكون اللوحة الرئيسية
// ==========================================
const CanvasModal = React.memo(function CanvasModal({ onClose }) {
  const [editor, setEditor] = useState(null);

  const takeNativeScreenshot = async () => {
    if (!editor) return;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) {
      alert("اللوحة فارغة! قم بالرسم أولاً.");
      return;
    }
    try {
      const blob = await exportToBlob({
        editor, ids: shapeIds, format: 'png',
        opts: { background: true, padding: 32 }
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `cv_nodes_${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("فشل تصوير اللوحة:", err);
    }
  };

  // دوال لإضافة عقد (Nodes) بألوان مختلفة لتنظيم السيرة
  const addCvNode = (color = '#0A66C2', title = 'قسم جديد') => {
    if (!editor) return;
    const center = editor.getViewportPageBounds().center;
    editor.createShape({
      type: 'cv-node',
      x: center.x - 140, 
      y: center.y - 90,
      props: { title, content: '', color }
    });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* شريط الأدوات العلوي المخصص */}
        <div className="modal-header" style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e2e6ea' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Icon name="canvas" size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>محرر السيرة البصري (Nodes)</h3>
            
            <div style={{ width: 1, height: 20, background: '#e2e6ea', margin: '0 10px' }}></div>
            
            {/* أزرار إضافة العقد الملونة */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" style={{borderColor: '#0A66C2', color: '#0A66C2'}} onClick={() => addCvNode('#0A66C2', 'معلومات أساسية')}>
                + عقدة رئيسية
              </button>
              <button className="btn btn-secondary btn-sm" style={{borderColor: '#10B981', color: '#10B981'}} onClick={() => addCvNode('#10B981', 'خبرة عملية')}>
                + عقدة خبرة
              </button>
              <button className="btn btn-secondary btn-sm" style={{borderColor: '#F59E0B', color: '#F59E0B'}} onClick={() => addCvNode('#F59E0B', 'مهارات')}>
                + عقدة مهارات
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={takeNativeScreenshot} title="تنزيل اللوحة كصورة عالية الدقة">
              <Icon name="camera" size={14} /> تصوير خريطة السيرة
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose} title="إغلاق">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
        
        {/* مساحة الرسم */}
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f0f2f5' }}>
          <Tldraw
            onMount={(editor) => setEditor(editor)}
            shapeUtils={customShapeUtils}
            persistenceKey="cv_ghazi_dashboard_nodes"
            licenseKey="tldraw-2031-03-02/WyJrRV90UFNpTyIsWyIqLmN2LWdoYXppLWRhc2gubmV0bGlmeS5hcHAiXSw5LCIyMDMxLTAzLTAyIl0.ma+R1gARqQ/yZUomqCpsBu3FbtnXML8wyUfzD0S5pmfDbNGgOObD3XQQxkH353jZoao2gA1yQs9lU6ZUULUhdg"
            components={{ Watermark: null }}
          />
        </div>

      </div>
    </div>
  );
});

export default CanvasModal;
