// src/components/Modals/CanvasModal.jsx
import React, { useState } from 'react';
import { 
  Tldraw, 
  exportToBlob, 
  ShapeUtil, 
  HTMLContainer, 
  T 
} from 'tldraw';
import 'tldraw/tldraw.css';
import Icon from '../UI/Icon';

// ==========================================
// 1. هندسة الشكل المخصص (CV Node)
// ==========================================
const cvNodeProps = {
  w: T.number,
  h: T.number,
  title: T.string,
  content: T.string,
};

class CvNodeUtil extends ShapeUtil {
  static type = 'cv-node';
  static props = cvNodeProps;

  // الحجم الافتراضي للـ Node
  getDefaultProps() {
    return { w: 250, h: 150, title: 'عنوان القسم', content: 'اكتب التفاصيل هنا...' };
  }

  // تحديد مساحة التفاعل والربط بالأسهم
  getGeometry(shape) {
    return new window.tldraw.Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // التصميم المرئي للـ Node (كارد احترافي)
  component(shape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          height: shape.props.h,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '2px solid var(--accent)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'all',
          direction: 'rtl',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif"
        }}
      >
        {/* رأس الـ Node */}
        <div style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
          padding: '8px 12px',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px' }}>📄</span>
          <input 
            type="text" 
            defaultValue={shape.props.title}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { title: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()} // للسماح بالكتابة بدون تحريك الشكل
            style={{ 
              background: 'transparent', border: 'none', color: '#fff', 
              fontWeight: 'bold', width: '100%', outline: 'none' 
            }}
          />
        </div>
        
        {/* جسم الـ Node */}
        <div style={{ flex: 1, padding: '8px' }}>
          <textarea
            defaultValue={shape.props.content}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { content: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: '100%', height: '100%', border: 'none', outline: 'none',
              resize: 'none', fontSize: '13px', color: 'var(--text-secondary)',
              backgroundColor: 'transparent', lineHeight: '1.6'
            }}
            placeholder="تفاصيل القسم..."
          />
        </div>
      </HTMLContainer>
    );
  }

  // مربع التحديد عند الضغط على الـ Node
  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}

// مصفوفة الأشكال المخصصة لتمريرها للوحة
const customShapeUtils = [CvNodeUtil];

// ==========================================
// 2. مكون اللوحة الرئيسي
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
      link.download = `cv_map_${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("فشل تصوير اللوحة:", err);
    }
  };

  // دالة إضافة الـ Node الجديد للوحة
  const addCvNode = () => {
    if (!editor) return;
    const center = editor.getViewportPageBounds().center;
    editor.createShape({
      type: 'cv-node',
      x: center.x - 125, // تمركز الشكل (العرض 250 / 2)
      y: center.y - 75,
      props: {
        title: 'قسم جديد',
        content: 'اكتب التفاصيل هنا...'
      }
    });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* شريط العنوان والأزرار */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Icon name="canvas" size={20} style={{ color: 'var(--accent)' }} />
             <h3>🎨 اللوحة البصرية</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* زر إضافة Node */}
            <button className="btn btn-primary btn-sm" onClick={addCvNode} title="إضافة قسم تفريعي للسيرة">
              <Icon name="plus" size={14} /> إضافة قسم (Node)
            </button>
            <div style={{width:1, height:20, background:'var(--border)', margin:'0 4px', alignSelf: 'center'}}></div>
            <button className="btn btn-secondary btn-sm" onClick={takeNativeScreenshot} title="تنزيل اللوحة كصورة عالية الدقة">
              <Icon name="camera" size={14} /> تصوير اللوحة
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose} title="إغلاق">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
        
        {/* مساحة الرسم */}
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f8f9fa' }}>
          <Tldraw
            onMount={(editor) => setEditor(editor)}
            shapeUtils={customShapeUtils} // تفعيل الشكل المخصص الجديد
            persistenceKey="cv_ghazi_dashboard_pro"
            licenseKey="tldraw-2031-03-02/WyJrRV90UFNpTyIsWyIqLmN2LWdoYXppLWRhc2gubmV0bGlmeS5hcHAiXSw5LCIyMDMxLTAzLTAyIl0.ma+R1gARqQ/yZUomqCpsBu3FbtnXML8wyUfzD0S5pmfDbNGgOObD3XQQxkH353jZoao2gA1yQs9lU6ZUULUhdg"
            components={{ Watermark: null }} // إخفاء العلامة المائية
          />
        </div>

      </div>
    </div>
  );
});

export default CanvasModal;
