// src/components/UI/Toast.jsx
import React from "react";
import Icon from "./Icon";

export default function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" && <Icon name="check" size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
