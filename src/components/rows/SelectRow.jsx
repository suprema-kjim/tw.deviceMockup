import { useMockup } from '../../state/MockupContext.jsx';
import { currentValue } from '../../lib/tree.js';
import { Chevron, RowShell, Value } from './RowShell.jsx';

// 선택값(원문 이름)을 현재 언어로 표시
export function optionLabel(node, name, t) {
  const opt = node.options.find((o) => o.name === String(name));
  return opt ? t.label(opt) : t.word(name);
}

export function SelectRow({ node }) {
  const { values, t } = useMockup();
  return (
    <RowShell node={node}>
      <Value>{optionLabel(node, currentValue(node, values), t)}</Value>
      <Chevron />
    </RowShell>
  );
}
