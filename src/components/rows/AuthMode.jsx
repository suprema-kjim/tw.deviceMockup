// 인증 모드 화면 요소: 인증 수단 칩(chip), 인증 모드 한 줄(authmode), 추가 영역(compose)
import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './auth.module.css';

// 인증 수단 이름 → 칩 안에 그릴 아이콘(여러 개면 넓은 알약 모양) 또는 글자
const CHIPS = {
  face: { icons: ['face'] },
  card: { icons: ['card'] },
  qr: { icons: ['qr-scan'] },
  'card-qr': { icons: ['card', 'qr-scan'] },
  pin: { icons: ['key'] },
  fingerprint: { icons: ['fingerprint'] },
  id: { text: 'ID' },
};

export function AuthChip({ token }) {
  const def = CHIPS[token] ?? { text: token };
  const wide = (def.icons?.length ?? 0) > 1;
  return (
    <span className={cx(s.chip, wide && s.chipWide)} aria-hidden="true">
      {def.text ? (
        <span className={s.chipText}>{def.text}</span>
      ) : (
        def.icons.map((name) => <Icon key={name} name={name} className={s.chipIcon} />)
      )}
    </span>
  );
}

// 인증 모드 한 줄: combo 의 칩을 + 와 / 로 이어 보여주고, 오른쪽에 값(스케줄)
//   combo: [card-qr, +, face, /, pin]  → (카드/QR) + (얼굴) / (PIN)
export function AuthModeRow({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(s.row, selected?.key === node.key && s.selected, node.className)}
      onClick={() => activate(node)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(node)}
      aria-label={t.label(node)}
    >
      <span className={s.combo}>
        {(node.combo ?? []).map((tok, i) =>
          tok === '+' || tok === '/' ? (
            <span key={i} className={s.joiner}>
              {tok}
            </span>
          ) : (
            <AuthChip key={i} token={tok} />
          ),
        )}
      </span>
      <span className={s.value}>{t.value(node)}</span>
    </div>
  );
}

// 점선 원 + 버튼이 있는 영역. 누르면 하위 chip 들을 고르는 팝업(picker)이 열린다.
export function ComposeArea({ node }) {
  const { activate, selected, t } = useMockup();
  return (
    <div className={cx(s.compose, node.className)}>
      <button
        type="button"
        className={cx(s.addCircle, selected?.key === node.key && s.selected)}
        onClick={() => activate(node)}
        aria-label={t.label(node)}
        title={t.label(node)}
      >
        <Icon name="plus" className={s.addIcon} />
      </button>
    </div>
  );
}
