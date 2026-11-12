import { cx } from '../../lib/cx.js';
import s from './common.module.css';

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx(s.toggle, checked && s.toggleOn)}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <span className={s.toggleKnob} />
    </button>
  );
}
