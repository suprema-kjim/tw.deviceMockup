import { useMockup } from '../../state/MockupContext.jsx';
import { currentValue } from '../../lib/tree.js';
import { RowShell, Value } from './RowShell.jsx';

export function formatSlide(node, values, t) {
  if (node.type === 'range') return `${t.word(node.min)} ~ ${t.word(node.max)}`;
  const v = currentValue(node, values) ?? 0;
  return node.unit ? `${v} ${t.word(node.unit)}` : String(v);
}

export function SlideRow({ node }) {
  const { values, t } = useMockup();
  return (
    <RowShell node={node}>
      <Value>{formatSlide(node, values, t)}</Value>
    </RowShell>
  );
}
