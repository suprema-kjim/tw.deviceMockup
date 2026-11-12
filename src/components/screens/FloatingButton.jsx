import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './screens.module.css';

const SLOT_CLASS = {
  'top-left': s.slotTopLeft,
  'top-right': s.slotTopRight,
  'bottom-left': s.slotBottomLeft,
  'bottom-right': s.slotBottomRight,
};

// 화면 모서리에 떠 있는 버튼 (예: 사용자 추가 +, 정보 i)
export function FloatingButton({ node }) {
  const { activate, selected, t } = useMockup();
  const small = node.slot?.startsWith('top');
  return (
    <button
      type="button"
      className={cx(
        s.floating,
        small ? s.floatingSmall : s.floatingLarge,
        SLOT_CLASS[node.slot],
        selected?.key === node.key && s.floatingSelected,
        node.className,
      )}
      style={node.color ? { background: node.color } : undefined}
      onClick={() => activate(node)}
      aria-label={t.label(node)}
      title={t.label(node)}
    >
      <Icon name={node.icon ?? 'plus'} className={s.floatingIcon} />
    </button>
  );
}
