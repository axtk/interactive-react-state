export function getRandomShape(n: number, x: number, y: number, r: number) {
  const dtheta = 360 / n;
  let path = "";

  for (let i = 0; i < n; i++) {
    const theta = ((i * dtheta - 90 / (n - 2)) * Math.PI) / 180;

    const xi = x + r * Math.cos(theta);
    const yi = y + r * Math.sin(theta);

    path += `${path ? " L" : "M"}${xi},${yi}`;
  }

  return `${path}z`;
}
