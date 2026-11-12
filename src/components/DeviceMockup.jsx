import { MockupProvider } from '../state/MockupContext.jsx';
import { DeviceFrame } from './layout/DeviceFrame.jsx';
import { HelpPanel } from './layout/HelpPanel.jsx';
import { DeviceScreen } from './screens/DeviceScreen.jsx';

// 진입 컴포넌트: 장치 틀 + 화면 + 도움말 패널을 조립만 한다.
// locale 이 바뀌어도 다시 마운트하지 않으므로 보던 화면·값이 그대로 유지된다.
export default function DeviceMockup({ data, locale }) {
  return (
    <MockupProvider data={data} locale={locale}>
      <div className="mockup-layout">
        <DeviceFrame screen={data.device.screen} theme={data.device.theme}>
          <DeviceScreen />
        </DeviceFrame>
        <HelpPanel />
      </div>
    </MockupProvider>
  );
}
