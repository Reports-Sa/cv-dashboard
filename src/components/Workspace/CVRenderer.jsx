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
  useEffect(() => {
    draftNotesRef.current = draftNotes;
  },[draftNotes]);

  useEffect(() => {
    if (editMode || !ref.current || !md) return;
    
    // 1. تحويل الماركداون إلى نصوص مرئية
    ref.current.innerHTML = marked.parse(md);
    
    // 2. إضافة حقول المسودة إن كان وضع المسودة مفعلاً
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

    // 3. إضافة ميزة (طي الأقسام) لجميع العناوين
    const allHeadings = ref.current.querySelectorAll('h2, h3');
    allHeadings.forEach((h) => {
      // إنشاء أيقونة السهم
      const icon = document.createElement('span');
      icon.innerHTML = '▾';
      icon.style.display = 'inline-block';
      icon.style.marginLeft = '8px'; // مسافة لتناسب التنسيق العربي
      icon.style.transition = 'transform 0.2s ease';
      
      // تنسيق العنوان ليكون قابلاً للضغط
      h.style.cursor = 'pointer';
      h.style.userSelect = 'none';
      h.title = "اضغط لطي أو إظهار هذا القسم";
      h.prepend(icon); // إضافة السهم قبل النص

      // حدث الضغط للطي والإظهار
      h.addEventListener('click', () => {
        const isCollapsed = h.classList.toggle('is-collapsed');
        // تدوير السهم عند الطي
        icon.style.transform = isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)';
        
        let sibling = h.nextElementSibling;
        while (sibling) {
          // التوقف إذا وصلنا لعنوان بنفس المستوى أو أكبر
          if (h.tagName === 'H2' && sibling.tagName === 'H2') break;
          if (h.tagName === 'H3' && (sibling.tagName === 'H2' || sibling.tagName === 'H3')) break;
          
          sibling.style.display = isCollapsed ? 'none' : '';
          sibling = sibling.nextElementSibling;
        }
      });
    });

  }, [md, draftMode, editMode, submission, onDraftChange]);

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
        {/* تم إزالة الشريط الأزرق ليكون صندوق التحرير نظيفاً ويملأ الشاشة */}
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
