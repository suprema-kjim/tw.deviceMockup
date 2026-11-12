import { cx } from '../../lib/cx.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { Row } from './Row.jsx';
import s from './rows.module.css';

export function CategorySection({ node }) {
  const { selected, select, t } = useMockup();
  return (
    <section className={cx(s.section, node.className)}>
      <div
        className={cx(s.sectionTitle, selected?.key === node.key && s.selected)}
        onClick={() => select(node)}
      >
        {t.label(node)}
      </div>
      {node.children.map((child) => (
        <Row key={child.key} node={child} />
      ))}
    </section>
  );
}
