import { useMockup } from '../../state/MockupContext.jsx';
import { MessagePopup } from './MessagePopup.jsx';
import { PickerPopup } from './PickerPopup.jsx';
import { SelectPopup } from './SelectPopup.jsx';
import { SlidePopup } from './SlidePopup.jsx';
import s from './popups.module.css';

const POPUPS = { select: SelectPopup, slide: SlidePopup, message: MessagePopup, picker: PickerPopup };

// 팝업 종류별 바깥 영역 모양
const OVERLAY = { message: s.overlayCenter, picker: `${s.overlayCenter} ${s.overlayLight}` };

// 장치 화면 위에 덮이는 팝업. 바깥(어두운 영역)을 누르면 닫힌다.
export function PopupLayer() {
  const { popup, closePopup } = useMockup();
  if (!popup) return null;
  const Popup = POPUPS[popup.kind];
  if (!Popup) return null;
  return (
    <div className={OVERLAY[popup.kind] ?? s.overlay} onClick={closePopup}>
      <div onClick={(e) => e.stopPropagation()} className={s.holder}>
        <Popup node={popup.node} onClose={closePopup} />
      </div>
    </div>
  );
}
