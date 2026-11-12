import { useMockup } from '../../state/MockupContext.jsx';
import { currentValue } from '../../lib/tree.js';
import { RowShell } from './RowShell.jsx';
import s from './rows.module.css';

export function InputRow({ node }) {
  const { values, setValue, select, t } = useMockup();
  return (
    <RowShell node={node}>
      <input
        className={s.input}
        value={currentValue(node, values) ?? t.value(node) ?? ''}
        aria-label={t.label(node)}
        placeholder={t.placeholder(node)}
        onClick={(e) => {
          e.stopPropagation();
          select(node);
        }}
        onChange={(e) => setValue(node.key, e.target.value)}
      />
    </RowShell>
  );
}
