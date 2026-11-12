import { Row } from './Row.jsx';
import s from './dashboard.module.css';
import f from './form.module.css';

// 연달아 나오는 칸형 항목은 한 묶음으로, 나머지는 한 줄씩 그린다.
//   stat·tile → layout: grid (기본) 3칸 격자 / layout: list 세로 목록
//   check     → 아이콘 선택 칸 한 줄 (3칸)
//   pad       → 색 타일 버튼 2칸 격자 (예: 근태 코드)
//   choice    → 하나만 고르는 아이콘 칸 4칸 격자 (예: 근태 코드 등록)
const GROUP_OF = { stat: 'cards', tile: 'cards', check: 'checks', pad: 'pads', choice: 'choices' };

function group(rows) {
  const blocks = [];
  for (const node of rows) {
    const last = blocks[blocks.length - 1];
    const kind = GROUP_OF[node.type];
    if (kind) {
      if (last?.kind === kind) last.items.push(node);
      else blocks.push({ kind, key: node.key, items: [node] });
    } else {
      blocks.push({ kind: null, key: node.key, node });
    }
  }
  return blocks;
}

function groupClass(kind, layout, count) {
  if (kind === 'checks') return f.checkRow;
  if (kind === 'pads') return f.padGrid;
  if (kind === 'choices') return f.choiceGrid;
  if (layout === 'list') return `${s.statList} ${count === 1 ? s.statListSingle : ''}`;
  return s.grid;
}

export function RowList({ rows, layout = 'grid' }) {
  const variant = layout === 'list' ? 'row' : 'card';
  return group(rows).map((b) =>
    b.kind ? (
      <div key={b.key} className={groupClass(b.kind, layout, b.items.length)}>
        {b.items.map((n) => (
          <Row key={n.key} node={n} variant={variant} />
        ))}
      </div>
    ) : (
      <Row key={b.key} node={b.node} />
    ),
  );
}
