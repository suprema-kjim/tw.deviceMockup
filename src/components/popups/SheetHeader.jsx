import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import s from './popups.module.css';

export function SheetHeader({ title, onClose }) {
  const { ui } = useMockup();
  return (
    <div className={s.sheetHeader}>
      <span className={s.sheetTitle}>{title}</span>
      <button type="button" className={s.close} onClick={onClose} aria-label={ui('close')}>
        <Icon name="close" className={s.closeIcon} />
      </button>
    </div>
  );
}
