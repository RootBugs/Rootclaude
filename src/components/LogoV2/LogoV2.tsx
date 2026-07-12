import { c as _c } from "react-compiler-runtime";
import * as React from 'react';
import { Box, Text } from '../../ink.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { getLogoDisplayData } from '../../utils/logoV2Utils.js';
import { renderModelSetting } from '../../utils/model/model.js';
import { useMainLoopModel } from '../../hooks/useMainLoopModel.js';
import { useAppState } from '../../state/AppState.js';
import { getEffortSuffix } from '../../utils/effort.js';

function _temp(s: any) { return s.agent; }
function _temp2(s: any) { return s.effortValue; }

const LEFT_PANEL_MAX_WIDTH = 50;

export function LogoV2() {
  const $ = _c(10);
  const model = useMainLoopModel();
  const modelDisplayName = renderModelSetting(model);
  const agent = useAppState(_temp);
  const effortValue = useAppState(_temp2);
  const { version, cwd, billingType, agentName } = getLogoDisplayData();
  const effort = effortValue ? ` · ${getEffortSuffix(effortValue)}` : '';
  const { columns } = useTerminalSize();

  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <Text><Text color="claude">{"Welcome to RootClaude"} </Text><Text dimColor={true}>v{version} </Text></Text>;
    $[0] = t0;
  } else {
    t0 = $[0];
  }

  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <Text dimColor={true}>{cwd}</Text>;
    $[1] = t1;
  } else {
    t1 = $[1];
  }

  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = <Text>{modelDisplayName}{effort}</Text>;
    $[2] = t2;
  } else {
    t2 = $[2];
  }

  let t3;
  if ($[3] !== t0 || $[4] !== t1 || $[5] !== t2) {
    t3 = <Box flexDirection="column">{t0}{t1}{t2}</Box>;
    $[3] = t0;
    $[4] = t1;
    $[5] = t2;
  } else {
    t3 = $[3];
  }

  return t3;
}