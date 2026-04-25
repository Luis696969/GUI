export function validateInterfaceDevicesDiffer(device1Id, device2Id, index) {
  if (device1Id === device2Id) throw new Error(`Interface ${index + 1}: device 1 and device 2 must be different.`);
}

export function validateInterfaceSegmentPointsInDomain(loc, domain, label) {
  const points = [loc.start, loc.stop];
  points.forEach(([x, y], pointIndex) => {
    if (x < 0 || x > domain.Lx) throw new Error(`${label}: point ${pointIndex + 1} x=${x} is outside [0, ${domain.Lx}].`);
    if (y < 0 || y > domain.Ly) throw new Error(`${label}: point ${pointIndex + 1} y=${y} is outside [0, ${domain.Ly}].`);
  });
}

export function validateInterfaceDiffusion(DInterface, label) {
  Object.entries(DInterface || {}).forEach(([chemical, value]) => {
    if (value < 0) throw new Error(`${label}: D_interface for ${chemical} must be >= 0.`);
  });
}
