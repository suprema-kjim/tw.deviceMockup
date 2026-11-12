import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './dashboard.module.css';

const R = 46; // 링 반지름 (viewBox 100 기준)
const CIRCUMFERENCE = 2 * Math.PI * R;

const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

// progress 를 적지 않고 max 가 있으면 값/최대값으로 계산한다. 값이 0 이면 호를 그리지 않는다.
function progressOf(node, value) {
  if (typeof node.progress === 'number') return node.progress;
  if (node.max === undefined) return null;
  const v = toNumber(value);
  const max = toNumber(node.max);
  if (!(v > 0) || !(max > 0)) return null;
  return Math.min(1, v / max);
}

function Ring({ node, value }) {
  const progress = progressOf(node, value);
  const hasProgress = progress !== null;
  // 아주 작은 값도 시작점이 보이도록 최소 길이의 호를 그린다 (실제 장치와 같은 점 표시)
  const arc = hasProgress ? Math.max(progress, 0.004) * CIRCUMFERENCE : 0;
  return (
    <span className={s.ring}>
      <svg viewBox="0 0 100 100" className={s.ringSvg} aria-hidden="true">
        <circle cx="50" cy="50" r={R} className={s.ringTrack} />
        {hasProgress && (
          <circle
            cx="50"
            cy="50"
            r={R}
            className={s.ringArc}
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
            transform="rotate(-90 50 50)"
          />
        )}
      </svg>
      <Icon name={node.icon} className={s.ringIcon} />
    </span>
  );
}

// 원형 수치: 회색 링 + 진행 호(progress) + 가운데 아이콘
//   variant="card": 링 아래 숫자 (대시보드 격자)
//   variant="row" : 링 오른쪽에 이름과 "값 / 최대값" (사용자 등록현황)
export function StatCard({ node, variant = 'card' }) {
  const { activate, selected, t } = useMockup();
  const label = t.label(node);
  const value = t.value(node);
  const row = variant === 'row';

  return (
    <button
      type="button"
      className={cx(s.card, row && s.cardRow, selected?.key === node.key && s.selected, node.className)}
      onClick={() => activate(node)}
      aria-label={`${label} ${value ?? ''}`.trim()}
      title={label}
    >
      <Ring node={node} value={value} />
      {row ? (
        <span className={s.statText}>
          <span className={s.statLabel}>{label}</span>
          <span className={s.statValue}>
            {value}
            {node.max !== undefined && <span className={s.statMax}>/ {t.word(node.max)}</span>}
          </span>
        </span>
      ) : (
        <span className={s.statValue}>{value}</span>
      )}
    </button>
  );
}
