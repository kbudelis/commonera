export interface PdfLineChunk {
  lines: string[];
  y: number;
  newPageBefore: boolean;
}

export interface PdfLinePaginationOptions {
  startY: number;
  pageTopY: number;
  pageBottomY: number;
  lineHeight: number;
  spaceAfter?: number;
  minLinesAtPageBottom?: number;
}

/**
 * Split an already-wrapped text block into page-sized line chunks.
 *
 * jsPDF does not paginate a long `text(string[])` call. Supplying every line
 * at once therefore draws beyond the Letter page and silently clips the rest.
 * This helper is deliberately independent of jsPDF so the page-boundary
 * behavior can be regression-tested without a browser or canvas.
 */
export function paginatePdfLines(
  lines: string[],
  {
    startY,
    pageTopY,
    pageBottomY,
    lineHeight,
    spaceAfter = 0,
    minLinesAtPageBottom = 2,
  }: PdfLinePaginationOptions,
): { chunks: PdfLineChunk[]; endY: number } {
  if (lineHeight <= 0 || pageBottomY <= pageTopY) {
    throw new Error("Invalid PDF page geometry.");
  }
  if (lines.length === 0) return { chunks: [], endY: startY + spaceAfter };

  const fullPageCapacity = Math.max(1, Math.floor((pageBottomY - pageTopY) / lineHeight));
  const chunks: PdfLineChunk[] = [];
  let lineIndex = 0;
  let y = startY;
  let newPageBefore = false;

  const currentCapacity = Math.max(0, Math.floor((pageBottomY - y) / lineHeight));
  if (lines.length <= fullPageCapacity && lines.length > currentCapacity) {
    y = pageTopY;
    newPageBefore = true;
  }

  while (lineIndex < lines.length) {
    const remaining = lines.length - lineIndex;
    let capacity = Math.max(0, Math.floor((pageBottomY - y) / lineHeight));
    const minimumUsefulCapacity = Math.min(minLinesAtPageBottom, remaining);
    if (capacity < minimumUsefulCapacity && y !== pageTopY) {
      y = pageTopY;
      newPageBefore = true;
      capacity = fullPageCapacity;
    }
    if (capacity === 0) {
      y = pageTopY;
      newPageBefore = true;
      capacity = fullPageCapacity;
    }

    const lineCount = Math.min(capacity, remaining);
    chunks.push({
      lines: lines.slice(lineIndex, lineIndex + lineCount),
      y,
      newPageBefore,
    });
    lineIndex += lineCount;
    y += lineCount * lineHeight;
    newPageBefore = false;

    if (lineIndex < lines.length) {
      y = pageTopY;
      newPageBefore = true;
    }
  }

  return { chunks, endY: y + spaceAfter };
}
