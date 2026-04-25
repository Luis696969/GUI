export function validateTimeStep(T, dt) {
  if (!(T > 0)) throw new Error('Total simulation time T must be > 0.');
  if (!(dt > 0)) throw new Error('Time step dt must be > 0.');
  if (dt > T) throw new Error('Time step dt must be lower than or equal to total simulation time T.');
}

export function validateTimesToPlot(timesToPlot, T) {
  timesToPlot.forEach((time) => {
    if (time < 0 || time > T) throw new Error(`Time to plot ${time} must be between 0 and T (${T}).`);
  });
}

export function validateDomainGrid(domain, deviceName) {
  if (!Number.isInteger(domain.Nx) || domain.Nx < 3) throw new Error(`Nx of ${deviceName} must be an integer >= 3.`);
  if (!Number.isInteger(domain.Ny) || domain.Ny < 3) throw new Error(`Ny of ${deviceName} must be an integer >= 3.`);
  if (!(domain.Lx > 0)) throw new Error(`Lx of ${deviceName} must be > 0.`);
  if (!(domain.Ly > 0)) throw new Error(`Ly of ${deviceName} must be > 0.`);
}

export function validateNonEmptyName(name, label, deviceName, position) {
  if (!name) throw new Error(`A ${label} has no name in ${deviceName} at position ${position}.`);
}

export function validateNoDuplicateNames(items, label, deviceName) {
  const seen = new Set();
  items.forEach((item) => {
    const normalized = item.name.toLowerCase();
    if (seen.has(normalized)) throw new Error(`${label} "${item.name}" is duplicated in ${deviceName}.`);
    seen.add(normalized);
  });
}

export function validatePointInDomain(x, y, domain, label) {
  if (x < 0 || x > domain.Lx) throw new Error(`${label}: x must be between 0 and ${domain.Lx}.`);
  if (y < 0 || y > domain.Ly) throw new Error(`${label}: y must be between 0 and ${domain.Ly}.`);
}
