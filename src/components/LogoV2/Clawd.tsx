import { c as _c } from "react-compiler-runtime";
import * as React from 'react';
import { Box } from '../../ink.js';

export function Clawd() {
  const $ = _c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <Box />;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}