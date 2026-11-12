// 입력 화면(layout: form) 요소: 프로필 사진(avatar), 가운데 입력 칸(field),
// 아이콘 선택 칸(check), 아래쪽 큰 버튼(action).
import { cx } from '../../lib/cx.js';
import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import { RowList } from './RowList.jsx';
import s from './form.module.css';

// 사람 실루엣(icon, 기본 avatar) + 오른쪽 카메라 아이콘
export function AvatarBox({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <button
      type="button"
      className={cx(s.avatar, selected?.key === node.key && s.selected, node.className)}
      onClick={() => activate(node)}
      aria-label={t.label(node)}
      title={t.label(node)}
    >
      <Icon name={node.icon ?? 'avatar'} className={s.avatarImage} />
      <Icon name="camera" className={s.avatarCamera} />
    </button>
  );
}

// 가운데 정렬 입력 칸 + 지우기(x) 버튼 + 밑줄. 값이 비면 placeholder 를 보여준다.
export function FieldRow({ node }) {
  const { values, setValue, select, selected, t, ui } = useMockup();
  const stored = currentValue(node, values);
  const value = stored ?? t.value(node) ?? '';
  return (
    <div className={cx(s.field, selected?.key === node.key && s.selected, node.className)} onClick={() => select(node)}>
      <input
        className={cx(s.fieldInput, node.readonly && s.fieldReadonly)}
        value={value}
        readOnly={node.readonly}
        placeholder={t.placeholder(node)}
        aria-label={t.label(node)}
        onFocus={() => select(node)}
        onChange={(e) => setValue(node.key, e.target.value)}
      />
      {!node.readonly && (
      <button
        type="button"
        className={s.clear}
        aria-label={ui('clear')}
        onClick={(e) => {
          e.stopPropagation();
          select(node);
          setValue(node.key, '');
        }}
      >
        <Icon name="close" className={s.clearIcon} />
      </button>
      )}
    </div>
  );
}

// 아이콘 선택 칸: 누르면 켜짐/꺼짐. 켜지면 분홍 원 + 체크 표시 + 강조색 이름.
export function CheckTile({ node }) {
  const { values, setValue, select, selected, t } = useMockup();
  const on = Boolean(currentValue(node, values));
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      className={cx(s.check, on && s.checkOn, selected?.key === node.key && s.selected, node.className)}
      onClick={() => {
        select(node);
        setValue(node.key, !on);
      }}
    >
      <span className={s.checkCircle}>
        <Icon name={node.icon} className={s.checkIcon} />
        {on && (
          <span className={s.checkBadge}>
            <Icon name="check" className={s.checkBadgeIcon} />
          </span>
        )}
      </span>
      <span className={s.checkLabel}>{t.label(node)}</span>
    </button>
  );
}

// 화면 아래쪽 큰 버튼. goto 가 있으면 이동하고, 없으면 눌러도 도움말만 보여준다 (예: 사용자 추가의 "다음").
export function ActionButton({ node }) {
  const { activate, select, selected, t } = useMockup();
  return (
    <div className={s.actionWrap}>
      <button
        type="button"
        className={cx(s.action, selected?.key === node.key && s.selected, node.className)}
        style={node.color ? { background: node.color } : undefined}
        onClick={() => (node.goto ? activate(node) : select(node))}
      >
        {t.label(node)}
      </button>
    </div>
  );
}

// 색 타일 버튼 (아이콘 + 이름, 배경색은 color). 연달아 적으면 2칸 격자. 예: 근태 코드 선택
export function PadButton({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <button
      type="button"
      className={cx(s.pad, selected?.key === node.key && s.padSelected, node.className)}
      style={node.color ? { background: node.color } : undefined}
      onClick={() => activate(node)}
    >
      {node.icon && <Icon name={node.icon} className={s.padIcon} />}
      <span>{t.label(node)}</span>
    </button>
  );
}

// 하위 항목을 배경이 있는 한 덩어리로 묶는다. style 로 이 묶음 안의 테마 변수를 바꿀 수 있다.
// 예: 사용자 편집 화면 위쪽의 푸른 회색 프로필 영역
export function GroupBlock({ node }) {
  return (
    <div className={cx(s.group, node.className)} style={node.style}>
      <RowList rows={node.children} layout={node.layout} />
    </div>
  );
}

// 같은 묶음에서 하나만 고르는 아이콘 칸 (라디오). 고른 칸은 강조색 테두리와 아이콘.
// 처음 선택은 "choice on" 으로 적은 칸. 선택값은 부모 키에 저장한다.
export function ChoiceTile({ node }) {
  const { values, setValue, select, selected, t } = useMockup();
  const groupKey = `${node.parent?.key}::choice`;
  const initial = node.parent?.children.find((c) => c.type === 'choice' && c.default)?.key;
  const on = (values[groupKey] ?? initial) === node.key;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={t.label(node) || `${t.label(node.parent)} ${node.icon ?? ''}`.trim()}
      title={t.label(node) || undefined}
      className={cx(s.choice, on && s.choiceOn, selected?.key === node.key && s.selected, node.className)}
      onClick={() => {
        select(node);
        setValue(groupKey, node.key);
      }}
    >
      <Icon name={node.icon} className={s.choiceIcon} />
      {node.badge && (
        <svg viewBox="0 0 10 10" className={cx(s.choiceBadge, node.badge === 'out' ? s.badgeOut : s.badgeIn)} aria-hidden="true">
          {node.badge === 'out' ? <path d="M2 2l6 6M4 8h4V4" /> : <path d="M2 8l6-6M4 2h4v4" />}
        </svg>
      )}
    </button>
  );
}
