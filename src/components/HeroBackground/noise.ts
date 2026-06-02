/**
 * Simplex noise implementation (2D)
 * Based on Stefan Gustavson's paper
 */
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const grad3 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

const perm = new Uint8Array(512);
const gradP = new Array(512);

function seed(s: number) {
  let n = s;
  if (n > 0 && n < 1) n *= 65536;
  n = Math.floor(n);
  if (n < 256) n |= n << 8;

  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let v: number;
    if (i & 1) {
      v = p[i] ^ (n & 255);
    } else {
      v = p[i] ^ ((n >> 8) & 255);
    }
    // Simple hash
    v = ((i * 168 + 37) ^ n) & 255;
    p[i] = v;
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad3[perm[i] % 8];
  }
}

seed(Math.random() * 65536);

export function noise2D(x: number, y: number): number {
  let n0: number, n1: number, n2: number;

  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - i + t;
  const y0 = y - j + t;

  let i1: number, j1: number;
  if (x0 > y0) {
    i1 = 1; j1 = 0;
  } else {
    i1 = 0; j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  const ii = i & 255;
  const jj = j & 255;
  const gi0 = gradP[ii + perm[jj]];
  const gi1 = gradP[ii + i1 + perm[jj + j1]];
  const gi2 = gradP[ii + 1 + perm[jj + 1]];

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) {
    n0 = 0;
  } else {
    t0 *= t0;
    n0 = t0 * t0 * (gi0[0] * x0 + gi0[1] * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) {
    n1 = 0;
  } else {
    t1 *= t1;
    n1 = t1 * t1 * (gi1[0] * x1 + gi1[1] * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) {
    n2 = 0;
  } else {
    t2 *= t2;
    n2 = t2 * t2 * (gi2[0] * x2 + gi2[1] * y2);
  }

  return 70 * (n0 + n1 + n2);
}
