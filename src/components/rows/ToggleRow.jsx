import { useMockup } from '../../state/MockupContext.jsx';
import { currentValue } from '../../lib/tree.js';
import { Toggle } from '../common/Toggle.jsx';
import { RowShell } from './RowShell.jsx';

export function ToggleRow({ node }) {
  const { values, setValue, select, t } = useMockup();
  const checked = Boolean(currentValue(node, values));
  return (
    <RowShell node={node}>
      <Toggle
        label={t.label(node)}
        checked={checked}
        onChange={(v) => {
          select(node);
          setValue(node.key, v);
        }}
      />
    </RowShell>
  );
}
