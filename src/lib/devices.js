// src/devices/*.yaml 을 모두 읽는다. <장치>.yaml 은 메뉴 정의, <장치>.<언어>.yaml 은 언어 사전.
// YAML 을 저장하면 Vite 가 화면을 바로 갱신한다.
import { loadDevices } from './loadDevice.js';

const sources = import.meta.glob('../devices/*.yaml', { query: '?raw', import: 'default', eager: true });

export const devices = loadDevices(sources).sort((a, b) => a.file.localeCompare(b.file));
