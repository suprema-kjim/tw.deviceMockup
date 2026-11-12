import { AuthModeRow, ComposeArea } from './AuthMode.jsx';
import { CategorySection } from './CategorySection.jsx';
import { ActionButton, AvatarBox, CheckTile, ChoiceTile, FieldRow, GroupBlock, PadButton } from './FormParts.jsx';
import { InfoPanel } from './InfoPanel.jsx';
import { InputRow } from './InputRow.jsx';
import { Keypad, TextBox } from './Keypad.jsx';
import { LinkRow } from './LinkRow.jsx';
import { LogRow } from './LogRow.jsx';
import { SectionBlock } from './SectionBlock.jsx';
import { SelectRow } from './SelectRow.jsx';
import { SlideRow } from './SlideRow.jsx';
import { StatCard } from './StatCard.jsx';
import { TileCard } from './TileCard.jsx';
import { ToggleRow } from './ToggleRow.jsx';
import { ValueRow } from './ValueRow.jsx';

// 타입 → 행 컴포넌트. 새 타입은 컴포넌트를 만들고 여기에 한 줄 추가한다.
// CategorySection·SectionBlock 이 다시 Row 를 쓰는 순환 import 가 있으므로,
// 모듈을 읽는 시점이 아니라 그릴 때 표를 만든다 (읽는 순서와 상관없이 안전).
const rowComponents = () => ({
  category: CategorySection,
  toggle: ToggleRow,
  select: SelectRow,
  slide: SlideRow,
  range: SlideRow,
  string: ValueRow,
  input: InputRow,
  parent: LinkRow,
  item: LinkRow,
  popup: LinkRow,
  image: LinkRow,
  button: LinkRow,
  // 대시보드 요소 (연속된 stat/tile 은 RowList 가 격자로 묶는다)
  stat: StatCard,
  tile: TileCard,
  info: InfoPanel,
  // 목록 화면 요소
  section: SectionBlock,
  log: LogRow,
  // 입력 화면 요소 (연속된 check 는 RowList 가 한 줄로 묶는다)
  avatar: AvatarBox,
  field: FieldRow,
  check: CheckTile,
  action: ActionButton,
  pad: PadButton,
  group: GroupBlock,
  // 인증 모드 화면 요소 (chip 은 compose 의 팝업에서만 그린다)
  authmode: AuthModeRow,
  compose: ComposeArea,
  chip: () => null,
  // 글자 입력 화면 요소
  textbox: TextBox,
  keypad: Keypad,
  choice: ChoiceTile,
});

export function Row({ node, ...props }) {
  const Component = rowComponents()[node.type] ?? LinkRow;
  return <Component node={node} {...props} />;
}
