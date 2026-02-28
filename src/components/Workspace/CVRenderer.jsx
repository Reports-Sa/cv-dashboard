// src/components/Workspace/CVRenderer.jsx
import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { isArabic } from '../../utils/helpers';
import Icon from '../UI/Icon';

export default function CVRenderer({ submission, draftMode, draftNotes, editMode, onDraftChange, onMarkdownChange }) {
  const ref = useRef(null);
  const md = submission?.data?.markdown_data || '';
  const rtl = isArabic(md);

  // استخدام useRef للاحتفاظ بأحدث الملاحظات بدون التسبب في إعادة رسم (Re-render) يمسح مؤشر الكتابة
  const draftNotesRef = useRef(draftNotes);
  useEffect(() => {
    draftNotesRef.current = draftNotes;
  },[draftNotes]);

  useEffect(() => {
    if (editMode || !ref.current || !md) return;
    
    // رسم السيرة الذاتية من الماركداون
    ref.current.innerHTML = marked.parse(md);
    
    if (draftMode && submission) {
      const headings = ref.current.querySelectorAll('h2, h3');
      headings.forEach((h, i) => {
        const key = `${submission.id}_${i}`;
        const wrap = document.createElement('div');
        
        const lbl = document.createElement('span');
        lbl.className = 'draft-label';
        lbl.textContent = '📝 ملاحظات المسودة';
        
        const ta = document.createElement('textarea');
        ta.className = 'draft-area';
        ta.placeholder = 'أضف ملاحظاتك هنا...';
        
        // جلب القيمة من المرجع بدلاً من الـ State لمنع فقدان التركيز (Focus)
        ta.value = draftNotesRef.current[key] || '';
        
        ta.addEventListener('input', (e) => {
          onDraftChange(key, e.target.value);
        });
        
        wrap.appendChild(lbl);
        wrap.appendChild(ta);
        h.parentNode.insertBefore(wrap, h.nextSibling);
      });
    }
  // إزالة draftNotes من المصفوفة هنا هو السر الذي سيمنع تقطيع الكتابة!
  },[md, draftMode, editMode, submission, onDraftChange]);

  if (!submission) {
    return (
      <div className="empty-state">
        <Icon name="folder" size={64} style={{ opacity: 0.3 }} />
        <h4>لم يتم اختيار عميل</h4>
        <p>اختر عميلاً من القائمة الجانبية لعرض سيرته الذاتية</p>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="cv-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px', height: '100%' }}>
        {/* الشريط الأزرق معزول تماماً عن صندوق الكتابة */}
        <div className="edit-mode-banner">
          <Icon name="edit" size={14} /> وضع التحرير المباشر — Markdown الخام
        </div>
        <textarea
          className="cv-edit-textarea"
          value={md}
          onChange={(e) => onMarkdownChange(e.target.value)}
          spellCheck={false}
          dir={rtl ? 'rtl' : 'ltr'}
          placeholder="محتوى Markdown..."
        />
      </div>
    );
  }

  return (
    <div className="cv-card">
      <div ref={ref} className="cv-content" dir={rtl ? 'rtl' : 'ltr'} />
    </div>
  );
}
