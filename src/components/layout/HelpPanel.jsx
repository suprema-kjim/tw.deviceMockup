import { currentValue } from '../../lib/tree.js';
import { useMockup } from '../../state/MockupContext.jsx';
import { optionLabel } from '../rows/SelectRow.jsx';
import { formatSlide } from '../rows/SlideRow.jsx';
import s from './layout.module.css';

function Details({ node, values, t, ui }) {
  switch (node.type) {
    case 'toggle':
      return (
        <dl className={s.helpProps}>
          <dt>{ui('default')}</dt>
          <dd>{node.default ? ui('on') : ui('off')}</dd>
          <dt>{ui('current')}</dt>
          <dd>{currentValue(node, values) ? ui('on') : ui('off')}</dd>
        </dl>
      );
    case 'slide':
    case 'range':
      return (
        <dl className={s.helpProps}>
          <dt>{node.type === 'range' ? ui('range') : ui('current')}</dt>
          <dd>{formatSlide(node, values, t)}</dd>
        </dl>
      );
    case 'string': {
      const v = t.value(node);
      return v ? (
        <dl className={s.helpProps}>
          <dt>{ui('shownValue')}</dt>
          <dd>{v}</dd>
        </dl>
      ) : null;
    }
    case 'select': {
      const cur = String(currentValue(node, values));
      return (
        <div className={s.helpOptions}>
          <div className={s.helpSubTitle}>{ui('options')}</div>
          <ul>
            {node.options.map((o) => (
              <li key={o.key}>
                <span className={o.name === cur ? s.helpOptionCurrent : undefined}>{optionLabel(node, o.name, t)}</span>
                {o.name === String(node.default) && <span className={s.helpBadge}>{ui('default')}</span>}
                {o.help && <p>{t.text(o.help)}</p>}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    default:
      return null;
  }
}

// 경로의 각 단계를 현재 언어 이름으로 보여주기 위해 부모를 따라 올라간다.
function breadcrumb(node, data, t) {
  const names = [];
  let cur = node.parent;
  while (cur) {
    names.unshift(t.label(cur));
    cur = cur.parent;
  }
  if (node.isScreen) return '';
  return names.length ? names.join(' › ') : node.path.slice(0, -1).map(t.word).join(' › ');
}

export function HelpPanel() {
  const { selected, values, data, t, ui } = useMockup();
  if (!selected) return null;
  const node = selected;
  const helpMap = node.help ?? (node.type === 'option' ? node.parent?.help : undefined);
  const help = t.text(helpMap);
  const isFallback = Boolean(help) && !t.hasText(helpMap);

  return (
    <aside className={s.help} aria-live="polite" lang={t.locale}>
      <nav className={s.helpPath} aria-label={ui('menuPath')}>
        {breadcrumb(node, data, t)}
      </nav>
      <div className={s.helpHead}>
        <h2 className={s.helpTitle}>{t.label(node)}</h2>
        <span className={s.helpType}>{ui('types')[node.type] ?? node.type}</span>
      </div>
      {help ? (
        <>
          {isFallback && <p className={s.helpFallback}>{ui('fallbackHelp')}</p>}
          <p className={s.helpText} lang={isFallback ? t.source : t.locale}>
            {help}
          </p>
        </>
      ) : (
        <p className={s.helpEmpty}>
          {ui('noHelp')}
          <br />
          {ui('noHelpHint')}
        </p>
      )}
      <Details node={node} values={values} t={t} ui={ui} />
    </aside>
  );
}
