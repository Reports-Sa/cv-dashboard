// src/components/Workspace/CVRenderer.jsx
import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { isArabic } from '../../utils/helpers';
import Icon from '../UI/Icon';

export default function CVRenderer({ submission, draftMode, draftNotes, editMode, onDraftChange, onMarkdownChange }) {
  const ref = useRef(null);
  const md = submission?.data?.markdown_data || '';
  const rtl = isArabic(md);

  const draftNotesRef = useRef(draftNotes);
  // ذاكرة لحفظ حالة طي الأقسام حتى لا تختفي عند تحديث الصفحة
  const collapsedStateRef = useRef({});

  useEffect(() => {
    draftNotesRef.current = draftNotes;
  }, [draftNotes]);

  useEffect(() => {
    if (editMode || !ref.current || !md) return;
    
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
        ta.value = draftNotesRef.current[key] || '';
        
        ta.addEventListener('input', (e) => {
          onDraftChange(key, e.target.value);
        });
        
        wrap.appendChild(lbl);
        wrap.appendChild(ta);
        h.parentNode.insertBefore(wrap, h.nextSibling);
      });
    }

    // منطق طي الأقسام مع الذاكرة
    const allHeadings = ref.current.querySelectorAll('h2, h3');
    allHeadings.forEach((h) => {
      // إعطاء كل عنوان معرّف فريد بناءً على اسم العميل ونص العنوان
      const sectionId = submission ? `${submission.id}_${h.textContent.trim()}` : h.textContent.trim();
      
      const icon = document.createElement('span');
      icon.innerHTML = '▾';
      icon.style.display = 'inline-block';
      icon.style.marginLeft = '8px';
      icon.style.transition = 'transform 0.2s ease';
      
      h.style.cursor = 'pointer';
      h.style.userSelect = 'none';
      h.title = "اضغط لطي أو إظهار هذا القسم";
      h.prepend(icon);

      // دالة لتطبيق الطي على العناصر التي تحت العنوان
      const toggleVisibility = (isCollapsed) => {
        icon.style.transform = isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)';
        if (isCollapsed) h.classList.add('is-collapsed');
        else h.classList.remove('is-collapsed');

        let sibling = h.nextElementSibling;
        while (sibling) {
          if (h.tagName === 'H2' && sibling.tagName === 'H2') break;
          if (h.tagName === 'H3' && (sibling.tagName === 'H2' || sibling.tagName === 'H3')) break;
          sibling.style.display = isCollapsed ? 'none' : '';
          sibling = sibling.nextElementSibling;
        }
      };

      // 1. التحقق إذا كان القسم مطوياً مسبقاً في الذاكرة
      if (collapsedStateRef.current[sectionId]) {
        toggleVisibility(true);
      }

      // 2. حدث الضغط لتغيير الحالة وحفظها في الذاكرة
      h.addEventListener('click', () => {
        const isCurrentlyCollapsed = h.classList.contains('is-collapsed');
        const newState = !isCurrentlyCollapsed;
        collapsedStateRef.current[sectionId] = newState; // حفظ في الذاكرة
        toggleVisibility(newState);
      });
    });

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
      <div className="cv-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
