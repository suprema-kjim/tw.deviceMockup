import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './screens.module.css';

// 이미지 위의 클릭 영역. 이미지가 없을 때는 위치를 알 수 있도록 이름을 함께 표시한다.
export function Hotspot({ node, showLabel }) {
  const { activate, selected, t } = useMockup();
  const [x, y, width, height] = node.area ?? [0, 0, 0, 0];
  return (
    <button
      type="button"
      className={cx(s.hotspot, selected?.key === node.key && s.hotspotSelected, node.className)}
      style={{ left: x, top: y, width, height }}
      onClick={() => activate(node)}
      aria-label={t.label(node)}
      title={t.label(node)}
    >
      {showLabel && (
        <>
          {node.icon && <Icon name={node.icon} className={s.hotspotIcon} />}
          <span>{t.label(node)}</span>
        </>
      )}
    </button>
  );
}
