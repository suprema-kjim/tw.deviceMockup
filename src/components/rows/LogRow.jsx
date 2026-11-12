import { cx } from '../../lib/cx.js';
import { formatDateTime } from '../../lib/i18n.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './log.module.css';

// 상태별 원형 아이콘 (색은 테마 변수 --log-<상태>)
const STATUS_ICON = { info: 'info', warning: 'info', success: 'check', fail: 'close' };

// 이벤트 로그 한 줄: 상태 아이콘 + 이벤트 이름 + 발생 시각
export function LogRow({ node }) {
  const { activate, selected, t, ui } = useMockup();
  const status = node.status ?? 'info';
  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(s.log, selected?.key === node.key && s.selected, node.className)}
      onClick={() => activate(node)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(node)}
    >
      <span className={cx(s.badge, s[status])}>
        <Icon name={STATUS_ICON[status] ?? 'info'} className={s.badgeIcon} />
      </span>
      <span className={s.text}>
        <span className={s.title}>{t.label(node)}</span>
        {node.time && <span className={s.time}>{formatDateTime(node.time, ui)}</span>}
      </span>
    </div>
  );
}
