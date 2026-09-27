// Log entries are numbered LN (01 = oldest) and anchored as #log-<LN>;
// the timeline cards and the page TOC must agree on the scheme.
export const logNo = (total: number, index: number): string =>
  String(total - index).padStart(2, '0')

export const logAnchorId = (total: number, index: number): string =>
  `log-${logNo(total, index)}`
