import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import { RowList } from './RowList.jsx';
import s from './log.module.css';

// 제목 막대(이름 + 개수 + 오른쪽 아이콘)와 그 아래 목록. 예: "전체 이벤트 로그 33  (i)"
// 제목 막대는 목록이 길어져도 위에 고정된다.
export function SectionBlock({ node }) {
  const { activate, selected, t } = useMockup();
  const count = t.value(node);
  return (
    <section className={cx(s.section, node.className)}>
      <div
        role="button"
        tabIndex={0}
        className={cx(s.bar, selected?.key === node.key && s.selected)}
        onClick={() => activate(node)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(node)}
      >
        <span className={s.barTitle}>{t.label(node)}</span>
        {count && <span className={s.barCount}>{count}</span>}
        {node.icon && (
          <span className={s.barIcon} style={node.color ? { background: node.color } : undefined}>
            <Icon name={node.icon} className={s.barIconSvg} />
          </span>
        )}
      </div>
      <div className={s.sectionBody}>
        <RowList rows={node.children} />
      </div>
    </section>
  );
}
