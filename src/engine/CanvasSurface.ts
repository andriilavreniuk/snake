const FONT_STACK = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export type TextAlign = 'left' | 'center' | 'right';

export type CornerRadius = {
  readonly tl: number;
  readonly tr: number;
  readonly br: number;
  readonly bl: number;
};

export class CanvasSurface {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('no 2d context');
    }
    this.ctx = ctx;
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  focus(): void {
    this.canvas.focus();
  }

  clear(color: string): void {
    this.fillRect(0, 0, this.width, this.height, color);
  }

  fillRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  fillCircle(cx: number, cy: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  fillRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: CornerRadius,
    color: string,
  ): void {
    this.ctx.fillStyle = color;
    roundedRectPath(this.ctx, x, y, width, height, radii);
    this.ctx.fill();
  }

  strokeRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    lineWidth = 2,
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, width, height);
  }

  text(
    value: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: TextAlign = 'left',
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px ${FONT_STACK}`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(value, x, y);
  }
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadius,
): void {
  const max = Math.min(width, height) / 2;
  const tl = Math.min(Math.max(radii.tl, 0), max);
  const tr = Math.min(Math.max(radii.tr, 0), max);
  const br = Math.min(Math.max(radii.br, 0), max);
  const bl = Math.min(Math.max(radii.bl, 0), max);

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  if (tr === 0) {
    ctx.lineTo(x + width, y);
  } else {
    ctx.arcTo(x + width, y, x + width, y + tr, tr);
  }
  ctx.lineTo(x + width, y + height - br);
  if (br === 0) {
    ctx.lineTo(x + width, y + height);
  } else {
    ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
  }
  ctx.lineTo(x + bl, y + height);
  if (bl === 0) {
    ctx.lineTo(x, y + height);
  } else {
    ctx.arcTo(x, y + height, x, y + height - bl, bl);
  }
  ctx.lineTo(x, y + tl);
  if (tl === 0) {
    ctx.lineTo(x, y);
  } else {
    ctx.arcTo(x, y, x + tl, y, tl);
  }
  ctx.closePath();
}
