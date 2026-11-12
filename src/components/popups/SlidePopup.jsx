import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { SheetHeader } from './SheetHeader.jsx';
import s from './popups.module.css';

export function SlidePopup({ node, onClose }) {
  const { values, setValue, t } = useMockup();

  if (node.type === 'range') {
    return (
      <div className={s.sheet}>
        <SheetHeader title={t.label(node)} onClose={onClose} />
        <div className={s.slideBody}>
          <div className={s.bubbleStatic}>
            {t.word(node.min)} ~ {t.word(node.max)}
          </div>
        </div>
      </div>
    );
  }

  const min = Number(node.min ?? 0);
  const max = Number(node.max ?? 100);
  const value = Number(currentValue(node, values) ?? min);
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={s.sheet}>
      <SheetHeader title={t.label(node)} onClose={onClose} />
      <div className={s.slideBody}>
        {/* 말풍선은 손잡이 바로 위에 오도록, 트랙 기준으로 위치를 계산한다 */}
        <div className={s.sliderTrack} style={{ '--p': percent }}>
          <div className={s.bubble}>
            {value}
            {node.unit ? ` ${t.word(node.unit)}` : ''}
          </div>
          <input
            type="range"
            className={s.slider}
            min={min}
            max={max}
            value={value}
            aria-label={t.label(node)}
            onChange={(e) => setValue(node.key, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
