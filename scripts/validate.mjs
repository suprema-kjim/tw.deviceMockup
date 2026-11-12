// 장치 YAML 검증 + 언어별 도움말·번역 작성 현황.
// 사용법: npm run validate              (모든 장치)
//         npm run validate -- bs3max    (특정 장치)
//         npm run validate -- --missing (도움말·번역이 없는 항목 목록까지 출력)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { missingTranslations } from '../src/lib/i18n.js';
import { loadDevices } from '../src/lib/loadDevice.js';

const DEVICE_DIR = 'src/devices';
const ICON_DIR = 'src/icons';
const PUBLIC_DIR = 'public';

const args = process.argv.slice(2);
const showMissing = args.includes('--missing');
const only = args.filter((a) => !a.startsWith('--'));

const icons = new Set(readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')));
const sources = Object.fromEntries(
  readdirSync(DEVICE_DIR)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => [f, readFileSync(join(DEVICE_DIR, f), 'utf8')]),
);
const all = loadDevices(sources).filter((d) => only.length === 0 || only.includes(d.device.id));

let failed = false;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

for (const data of all) {
  const warnings = [...data.warnings];
  const { device, stats } = data;

  for (const n of data.iconRefs) {
    if (!icons.has(n.icon)) warnings.push(`${n.path.join(' > ')}: 아이콘 "${n.icon}" 이(가) src/icons 에 없습니다`);
  }
  if (device.theme !== 'default' && !existsSync(join('src/themes', `${device.theme}.css`))) {
    warnings.push(`테마 파일 src/themes/${device.theme}.css 이(가) 없습니다 (기본 테마로 표시됩니다)`);
  }
  for (const lang of data.languages) {
    if (lang !== device.language && !data.messages[lang]) {
      warnings.push(`languages 에 ${lang} 이(가) 있지만 ${device.id}.${lang}.yaml 사전이 없습니다 (npm run i18n -- ${device.id} ${lang})`);
    }
  }

  const missingImages = new Set();
  for (const n of data.index.values()) {
    for (const file of Object.values(n.image ?? {})) {
      if (/^(https?:)?\/\//.test(file)) continue;
      const p = join(PUBLIC_DIR, file.replace(/^\//, ''));
      if (!existsSync(p)) missingImages.add(p);
    }
  }

  console.log(`\n■ ${data.file}  (${device.name}, ${device.screen.width}x${device.screen.height}, theme: ${device.theme})`);
  for (const lang of data.languages) {
    const help = stats.helpByLang[lang] ?? 0;
    const optHelp = stats.optionHelpByLang[lang] ?? 0;
    let line = `  [${lang}] 도움말: 메뉴 ${help}/${stats.nodes} (${pct(help, stats.nodes)}%), 선택지 ${optHelp}/${stats.options}`;
    if (lang !== device.language) {
      const missing = missingTranslations(data, lang);
      line += `, 이름 번역 없음 ${missing.size}개`;
    }
    console.log(line);
  }

  for (const e of data.errors) console.log(`  ✖ ${e}`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  if (missingImages.size) {
    console.log(`  ⚠ 없는 이미지 ${missingImages.size}개 (화면에는 자리표시로 나옵니다)`);
    for (const p of missingImages) console.log(`     - ${p}`);
  }

  if (showMissing) {
    for (const lang of data.languages) {
      const noHelp = [...data.index.values()].filter((n) => n.type !== 'option' && !n.anonymous && !n.help?.[lang]);
      if (noHelp.length) {
        console.log(`  [${lang}] 도움말이 없는 항목:`);
        for (const n of noHelp) console.log(`     - ${n.path.join(' > ')}`);
      }
      if (lang !== device.language) {
        const missing = missingTranslations(data, lang);
        if (missing.size) {
          console.log(`  [${lang}] 이름 번역이 없는 원문:`);
          for (const [text, where] of missing) console.log(`     - ${text}   (${where})`);
        }
      }
    }
  }
  if (data.errors.length) failed = true;
}

if (all.length === 0) console.log('검사할 YAML 파일이 없습니다.');
console.log(failed ? '\n오류가 있습니다.' : '\n오류 없음.');
process.exit(failed ? 1 : 0);
