import { isOpenable } from '../../lib/tree.js';
import { Chevron, RowShell } from './RowShell.jsx';

// parent / item / popup / button 등: 누르면 하위 화면·기능 화면으로 이동하거나 도움말만 표시한다.
export function LinkRow({ node }) {
  const showChevron = node.type === 'parent' && (isOpenable(node) || Boolean(node.goto));
  return <RowShell node={node}>{showChevron && <Chevron />}</RowShell>;
}
