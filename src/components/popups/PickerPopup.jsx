import { useMockup } from '../../state/MockupContext.jsx';
import { AuthChip } from '../rows/AuthMode.jsx';
import s from '../rows/auth.module.css';

// compose 의 하위 chip 들을 화면 가운데 한 줄로 보여준다. 고르면 도움말을 보여주고 닫힌다.
export function PickerPopup({ node, onClose }) {
  const { select, t } = useMockup();
  return (
    <div className={s.picker}>
      {node.children.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className={s.pickerItem}
          onClick={() => {
            select(chip);
            onClose();
          }}
        >
          <AuthChip token={chip.chip ?? chip.icon} />
          <span>{t.label(chip)}</span>
        </button>
      ))}
    </div>
  );
}
