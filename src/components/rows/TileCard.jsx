import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './dashboard.module.css';

// 대시보드 바로가기 칸: 큰 아이콘 + 이름 (예: 사용자 등록 마법사)
export function TileCard({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <button
      type="button"
      className={cx(s.card, selected?.key === node.key && s.selected, node.className)}
      onClick={() => activate(node)}
    >
      <span className={s.tileIconBox}>
        <Icon name={node.icon} className={s.tileIcon} />
      </span>
      <span className={s.tileLabel}>{t.label(node)}</span>
    </button>
  );
}
