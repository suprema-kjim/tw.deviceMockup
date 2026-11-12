import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './rows.module.css';

// 모든 행의 공통 틀: 선택 표시, 클릭 시 activate, 왼쪽 아이콘과 이름.
export function RowShell({ node, children, onClick }) {
  const { selected, activate, t } = useMockup();
  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(s.row, selected?.key === node.key && s.selected, node.className)}
      onClick={onClick ?? (() => activate(node))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (onClick ?? (() => activate(node)))();
        }
      }}
    >
      {node.icon && <Icon name={node.icon} className={s.rowIcon} />}
      <span className={s.title}>{t.label(node)}</span>
      {children}
    </div>
  );
}

export function Chevron() {
  return <Icon name="chevron-right" className={s.chevron} />;
}

// color: 값 글자색 (YAML 의 color, 'accent' 는 테마 강조색)
export function Value({ children, color }) {
  return (
    <span className={s.value} style={color ? { color } : undefined}>
      {children}
    </span>
  );
}
