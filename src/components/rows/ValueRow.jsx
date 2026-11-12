import { useMockup } from '../../state/MockupContext.jsx';
import { RowShell, Value } from './RowShell.jsx';

export function ValueRow({ node }) {
  const { t } = useMockup();
  return (
    <RowShell node={node}>
      <Value color={node.color === 'accent' ? 'var(--accent)' : node.color}>{t.value(node)}</Value>
    </RowShell>
  );
}
