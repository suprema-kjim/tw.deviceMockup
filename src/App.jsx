import { useEffect, useState } from 'react';
import DeviceMockup from './components/DeviceMockup.jsx';
import { LANGUAGE_NAMES, ui } from './i18n/ui.js';
import { devices } from './lib/devices.js';

// 주소 #<장치>/<언어> 로 장치와 언어를 고른다 (예: #bs3max/en). 언어를 생략하면 YAML 원문 언어.
function useRoute() {
  const read = () => {
    const [id = '', lang = ''] = decodeURIComponent(window.location.hash.slice(1)).split('/');
    return { id, lang };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (id, lang) => {
    window.location.hash = lang ? `${encodeURIComponent(id)}/${encodeURIComponent(lang)}` : encodeURIComponent(id);
  };
  return [route, go];
}

function Problems({ data, u }) {
  if (!data.errors.length && !(import.meta.env.DEV && data.warnings.length)) return null;
  return (
    <details className="problems" open={data.errors.length > 0}>
      <summary>{u('problems', { file: data.file, errors: data.errors.length, warnings: data.warnings.length })}</summary>
      <ul>
        {data.errors.map((e) => (
          <li key={e} className="problem-error">
            {e}
          </li>
        ))}
        {data.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </details>
  );
}

export default function App() {
  const [route, go] = useRoute();
  const data = devices.find((d) => d.device.id === route.id) ?? devices[0];
  const locale = data && data.languages.includes(route.lang) ? route.lang : data?.device.language ?? 'ko';
  const u = ui(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = u('appTitle');
  }, [locale, u]);

  if (!data) return <p className="app-empty">{u('noDevices')}</p>;

  const helpDone = data.stats.helpByLang[locale] ?? 0;
  return (
    <div className="app">
      <header className="app-bar">
        <h1>{u('appTitle')}</h1>
        {devices.length > 1 ? (
          <select value={data.device.id} onChange={(e) => go(e.target.value, locale)} aria-label={u('selectDevice')}>
            {devices.map((d) => (
              <option key={d.device.id} value={d.device.id}>
                {d.device.name}
              </option>
            ))}
          </select>
        ) : (
          <span>{data.device.name}</span>
        )}
        {data.languages.length > 1 && (
          <div className="lang-switch" role="group" aria-label={u('selectLanguage')}>
            {data.languages.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={l === locale}
                className={l === locale ? 'active' : undefined}
                onClick={() => go(data.device.id, l === data.device.language ? '' : l)}
              >
                {LANGUAGE_NAMES[l] ?? l}
              </button>
            ))}
          </div>
        )}
        {import.meta.env.DEV && (
          <span className="app-stat" title={u('helpStatTitle')}>
            {u('helpStat', { done: helpDone, total: data.stats.nodes })}
          </span>
        )}
      </header>
      <Problems data={data} u={u} />
      <main>{data.root && <DeviceMockup key={data.device.id} data={data} locale={locale} />}</main>
    </div>
  );
}
