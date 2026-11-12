import { useMockup } from '../../state/MockupContext.jsx';
import s from './popups.module.css';

// popup 타입: 확인 창. 본문은 YAML 의 value 를 쓰고, 없으면 기본 문구를 쓴다.
export function MessagePopup({ node, onClose }) {
  const { t, ui } = useMockup();
  const name = t.label(node);
  return (
    <div className={s.dialog}>
      <div className={s.dialogTitle}>{name}</div>
      <p className={s.dialogText}>{t.value(node) ?? ui('confirmDefault', { name })}</p>
      <div className={s.dialogButtons}>
        <button type="button" className={s.dialogCancel} onClick={onClose}>
          {ui('cancel')}
        </button>
        <button type="button" className={s.dialogOk} onClick={onClose}>
          {ui('ok')}
        </button>
      </div>
    </div>
  );
}
