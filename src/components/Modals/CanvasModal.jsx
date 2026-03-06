// src/components/Modals/CanvasModal.jsx
import React, { useState } from 'react';
import { 
  Tldraw, 
  ShapeUtil, 
  HTMLContainer, 
  T,
  BaseBoxShapeTool,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuItem,
  useIsToolSelected,
  useTools,
  Rectangle2d
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

  getDefaultProps() {
    return { 
      w: 260, 
      h: 180, 
      title: 'عنوان القسم', 
      content: 'اكتب المحتوى هنا...' 
    };
  }

  getGeometry(shape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

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
        <div style={{
          backgroundColor: 'var(--accent)', color: '#fff',
          padding: '8px 12px', display: 'flex', alignItems: 'center'
        }}>
          <input 
            type="text" 
            defaultValue={shape.props.title}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { title: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()} 
            style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', width: '100%', outline: 'none' }}
          />
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          <textarea
            defaultValue={shape.props.content}
            onChange={(e) => this.editor.updateShape({ id: shape.id, type: 'cv-node', props: { content: e.target.value } })}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', color: '#333' }}
            placeholder="تفاصيل القسم..."
          />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}

// ==========================================
// 2. هندسة "أداة السحب والإفلات" الخاصة بنا
// ==========================================
class CvNodeTool extends BaseBoxShapeTool {
  static id = 'cv-node';
  static initial = 'idle';
  shapeType = 'cv-node';
}

const customShapeUtils = [CvNodeUtil];
const customTools =[CvNodeTool];

// ==========================================
// 3. تعديل واجهة tldraw (دمج الأداة في الشريط السفلي)
// ==========================================
const uiOverrides = {
  tools(editor, tools) {
    tools['cv-node'] = {
      id: 'cv-node',
      icon: 'tool-frame', 
      label: 'عقدة سيرة',
      kbd: 'n',
      onSelect: () => editor.setCurrentTool('cv-node'),
    };
    return tools;
  },
};

const CustomToolbar = (props) => {
  const tools = useTools();
  const isNodeSelected = useIsToolSelected(tools['cv-node']);
  
  return (
    <DefaultToolbar {...props}>
      <TldrawUiMenuItem {...tools['cv-node']} isSelected={isNodeSelected} />
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
};

// ==========================================
// 4. المكون الرئيسي للوحة
// ==========================================
const CanvasModal = React.memo(function CanvasModal({ onClose }) {
  const[editor, setEditor] = useState(null);

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal modal-fullscreen" style={{ display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Icon name="canvas" size={20} style={{ color: 'var(--accent)' }} />
             <h3>🎨 اللوحة البصرية</h3>
          </div>
          
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        
        <div style={{ flex: 1, position: 'relative', direction: 'ltr', background: '#f8f9fa' }}>
          <Tldraw
            onMount={setEditor}
            shapeUtils={customShapeUtils}
            tools={customTools}
            overrides={uiOverrides}
            components={{ 
              Watermark: null, 
              Toolbar: CustomToolbar 
            }}
            persistenceKey="cv_ghazi_dashboard_pro"
            licenseKey="tldraw-2031-03-02/WyJrRV90UFNpTyIsWyIqLmN2LWdoYXppLWRhc2gubmV0bGlmeS5hcHAiXSw5LCIyMDMxLTAzLTAyIl0.ma+R1gARqQ/yZUomqCpsBu3FbtnXML8wyUfzD0S5pmfDbNGgOObD3XQQxkH353jZoao2gA1yQs9lU6ZUULUhdg"
          />
        </div>

      </div>
    </div>
  );
});

export default CanvasModal;
