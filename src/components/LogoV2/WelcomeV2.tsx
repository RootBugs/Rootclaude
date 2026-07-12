import { c as _c } from "react-compiler-runtime";
import React from 'react';
import { Box, Text } from 'src/ink.js';
import { ASCII_LOGO } from '../../constants/brand.js';

export function WelcomeV2() {
  const $ = _c(12);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <Text><Text color="claude">{"Welcome to RootClaude"} </Text><Text dimColor={true}>v{MACRO.DISPLAY_VERSION ?? MACRO.VERSION} </Text></Text>;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <Text>{"\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026"}</Text>;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = <Text>{ASCII_LOGO[0]}</Text>;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = <Text>{ASCII_LOGO[1]}</Text>;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = <Text>{ASCII_LOGO[2]}</Text>;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = <Text>{ASCII_LOGO[3]}</Text>;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  let t6;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = <Text>{ASCII_LOGO[4]}</Text>;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  let t7;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = <Text>{ASCII_LOGO[5]}</Text>;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = <Text>{ASCII_LOGO[6]}</Text>;
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  let t9;
  if ($[9] !== t0 || $[10] !== t1) {
    t9 = <Box flexDirection="column" width={110}><Text>{t0}{t1}</Text>{t2}{t3}{t4}{t5}{t6}{t7}{t8}</Box>;
    $[9] = t0;
    $[10] = t1;
    $[11] = t9;
  } else {
    t9 = $[11];
  }
  return t9;
}