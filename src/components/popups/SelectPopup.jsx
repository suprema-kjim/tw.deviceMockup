import { cx } from '../../lib/cx.js';
import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Icon } from '../common/Icon.jsx';
import { SheetHeader } from './SheetHeader.jsx';
import s from './popups.module.css';

export function SelectPopup({ node, onClose }) {
  const { values, setValue, select, t } = useMockup();
  const cur = currentValue(node, values);
  return (
    <div className={s.sheet}>
      <SheetHeader title={t.label(node)} onClose={onClose} />
      <div className={s.optionList}>
        {node.options.map((opt) => {
          const active = opt.name === cur;
          return (
            <button
              key={opt.key}
              type="button"
              className={cx(s.option, active && s.optionActive)}
              onClick={() => {
                setValue(node.key, opt.name);
                if (opt.help) select(opt);
                onClose();
              }}
            >
              <span>{t.label(opt)}</span>
              {active && (
                <span className={s.check}>
                  <Icon name="check" className={s.checkIcon} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
