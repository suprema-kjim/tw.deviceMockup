import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import s from './dashboard.module.css';

// 이름/값 두 칸으로 촘촘하게 보여주는 정보 묶음 (예: 대시보드 아래 장치 정보).
// 묶음 이름은 화면에 표시하지 않고, 도움말에서만 쓴다.
export function InfoPanel({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <section className={cx(s.info, node.className)} aria-label={t.label(node)}>
      {node.children.map((child) => (
        <div
          key={child.key}
          role="button"
          tabIndex={0}
          className={cx(s.infoRow, selected?.key === child.key && s.selected)}
          onClick={() => activate(child)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(child)}
        >
          <span className={s.infoLabel}>{t.label(child)}</span>
          <span className={s.infoValue}>{t.value(child)}</span>
        </div>
      ))}
    </section>
  );
}
