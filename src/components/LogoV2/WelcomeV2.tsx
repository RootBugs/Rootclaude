import { c as _c } from "react-compiler-runtime";
import React from 'react';
import { Box, Text } from 'src/ink.js';

export function WelcomeV2() {
  const $ = _c(3);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <Text><Text color="claude">{"Welcome to RootClaude"} </Text><Text dimColor={true}>v{MACRO.DISPLAY_VERSION ?? MACRO.VERSION} </Text></Text>;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] !== t0) {
    t1 = <Box>{t0}</Box>;
    $[1] = t0;
  } else {
    t1 = $[1];
  }
  return t1;
}