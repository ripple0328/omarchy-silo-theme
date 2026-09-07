export function strokePoints(from, to, spacing) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  return Array.from({length: steps + 1}, (_, i) => ({x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps}));
}
export class Coverage {
  constructor(width, height) {
    this.width = width; this.height = height;
    this.cells = new Uint8Array(width * height); this.count = 0;
  }
  wipe(x, y, radius) {
    const left = Math.max(0, Math.floor(x-radius)), right = Math.min(this.width-1, Math.ceil(x+radius));
    const top = Math.max(0, Math.floor(y-radius)), bottom = Math.min(this.height-1, Math.ceil(y+radius));
    for (let row=top; row<=bottom; row++) for (let col=left; col<=right; col++) {
      const index=row*this.width+col;
      if (!this.cells[index] && Math.hypot(col+.5-x,row+.5-y)<=radius) {this.cells[index]=1;this.count++;}
    }
    return this.count / this.cells.length;
  }
  get fraction(){return this.count / this.cells.length;}
}
export function advanceRound(state, seconds, coverage) {
  if (state.phase !== 'playing') return {...state};
  if (coverage >= .85) return {...state, phase:'won'};
  const remaining = Math.max(0, state.remaining - Math.max(0,seconds));
  return {...state, remaining, phase: remaining === 0 ? 'lost' : 'playing'};
}
