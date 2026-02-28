// src/components/Modals/CanvasModal.jsx
import React from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css"; // استدعاء الستايل الخاص بالمكتبة لتعمل بشكل صحيح
import Icon from "../UI/Icon";

export default function CanvasModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div
        className="modal modal-fullscreen"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header">
          <h3>🎨 اللوحة البصرية (مساحة التفكير)</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            direction: "ltr",
            background: "#f8f9fa",
          }}
        >
          {/* 
            هذا هو كود tldraw النظيف 
            خاصية persistenceKey تضمن حفظ رسمك في المتصفح حتى لو أغلقت اللوحة
          */}
          <Tldraw persistenceKey="cv-dashboard-canvas" />
        </div>
      </div>
    </div>
  );
}
