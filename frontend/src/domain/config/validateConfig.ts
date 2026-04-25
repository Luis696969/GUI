import { configSchema, type ConfigSchema } from './schema';

export type ValidationIssue = {
  code: string;
  path: Array<string | number>;
  message: string;
};

export type ValidationErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
  issues: ValidationIssue[];
};

export type ValidateConfigResult =
  | { success: true; data: ConfigSchema; errors: null; warnings: ValidationIssue[] }
  | { success: false; data?: undefined; errors: ValidationErrors; warnings: ValidationIssue[] };

function buildValidationError(issues: ValidationIssue[]): ValidationErrors {
  return {
    formErrors: [],
    fieldErrors: {},
    issues
  };
}

function makeIssue(path: Array<string | number>, message: string, code = 'custom'): ValidationIssue {
  return { code, path, message };
}

function isWithinDomain([x, y]: [number, number], domain: { Lx: number; Ly: number }): boolean {
  return x >= 0 && x <= domain.Lx && y >= 0 && y <= domain.Ly;
}

export function validateConfig(config: unknown): ValidateConfigResult {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const flattened = result.error.flatten();

    return {
      success: false,
      warnings: [],
      errors: {
        formErrors: flattened.formErrors,
        fieldErrors: flattened.fieldErrors,
        issues: result.error.issues.map((issue) => ({
          code: issue.code,
          path: issue.path,
          message: issue.message
        }))
      }
    };
  }

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const data = result.data;

  const deviceById = new Map<string, ConfigSchema['devices'][number]>();
  const chemicalSetByDeviceId = new Map<string, Set<string>>();
  const cellSetByDeviceId = new Map<string, Set<string>>();

  data.devices.forEach((device, deviceIndex) => {
    const deviceId = device.id.trim();
    if (deviceById.has(deviceId)) {
      errors.push(
        makeIssue(['devices', deviceIndex, 'id'], `Duplicate device id "${deviceId}" encountered in config.`)
      );
      return;
    }

    deviceById.set(deviceId, device);

    const chemicalSet = new Set(device.chemicals.map((chemical) => chemical.name.trim()));
    const cellSet = new Set(device.cells.map((cell) => cell.name.trim()));

    chemicalSetByDeviceId.set(deviceId, chemicalSet);
    cellSetByDeviceId.set(deviceId, cellSet);

    device.entries.forEach((entry, entryIndex) => {
      if (!chemicalSet.has(entry.chemical.trim())) {
        errors.push(
          makeIssue(
            ['devices', deviceIndex, 'entries', entryIndex, 'chemical'],
            `Entry ${entryIndex + 1} in device "${deviceId}" references unknown chemical "${entry.chemical}".`
          )
        );
      }
    });
  });

  const allowedChemicalNamespace = new Set<string>();
  const allowedCellNamespace = new Set<string>();

  chemicalSetByDeviceId.forEach((chemicalSet) => {
    chemicalSet.forEach((name) => allowedChemicalNamespace.add(name));
  });
  cellSetByDeviceId.forEach((cellSet) => {
    cellSet.forEach((name) => allowedCellNamespace.add(name));
  });

  data.interfaces.forEach((iface, interfaceIndex) => {
    const device1 = deviceById.get(iface.device1);
    const device2 = deviceById.get(iface.device2);

    if (!device1) {
      errors.push(
        makeIssue(
          ['interfaces', interfaceIndex, 'device1'],
          `Interface ${interfaceIndex + 1} references unknown device1 "${iface.device1}".`
        )
      );
    }

    if (!device2) {
      errors.push(
        makeIssue(
          ['interfaces', interfaceIndex, 'device2'],
          `Interface ${interfaceIndex + 1} references unknown device2 "${iface.device2}".`
        )
      );
    }

    if (device1) {
      const start = iface.locs.device1.start;
      const stop = iface.locs.device1.stop;
      if (!isWithinDomain(start, device1.domain) || !isWithinDomain(stop, device1.domain)) {
        errors.push(
          makeIssue(
            ['interfaces', interfaceIndex, 'locs', 'device1'],
            `Interface ${interfaceIndex + 1} locs.device1 must be within domain of device "${iface.device1}".`
          )
        );
      }
    }

    if (device2) {
      const start = iface.locs.device2.start;
      const stop = iface.locs.device2.stop;
      if (!isWithinDomain(start, device2.domain) || !isWithinDomain(stop, device2.domain)) {
        errors.push(
          makeIssue(
            ['interfaces', interfaceIndex, 'locs', 'device2'],
            `Interface ${interfaceIndex + 1} locs.device2 must be within domain of device "${iface.device2}".`
          )
        );
      }
    }

    if (device1 && device2) {
      const device1Chemicals = chemicalSetByDeviceId.get(iface.device1) ?? new Set<string>();
      const device2Chemicals = chemicalSetByDeviceId.get(iface.device2) ?? new Set<string>();
      const sharedChemicals = [...device1Chemicals].filter((chemical) => device2Chemicals.has(chemical));

      if (sharedChemicals.length === 0) {
        warnings.push(
          makeIssue(
            ['interfaces', interfaceIndex],
            `Interface ${interfaceIndex + 1} connects devices "${iface.device1}" and "${iface.device2}" with zero shared chemicals.`,
            'warning'
          )
        );
      }
    }
  });

  data.reactions.forEach((reaction, reactionIndex) => {
    reaction.substrates.forEach((substrate, substrateIndex) => {
      if (!allowedChemicalNamespace.has(substrate)) {
        errors.push(
          makeIssue(
            ['reactions', reactionIndex, 'substrates', substrateIndex],
            `Reaction ${reactionIndex + 1} references unknown substrate "${substrate}".`
          )
        );
      }
    });

    reaction.products.forEach((product, productIndex) => {
      if (!allowedChemicalNamespace.has(product)) {
        errors.push(
          makeIssue(
            ['reactions', reactionIndex, 'products', productIndex],
            `Reaction ${reactionIndex + 1} references unknown product "${product}".`
          )
        );
      }
    });

    reaction.biologicals.forEach((biological, biologicalIndex) => {
      if (!allowedCellNamespace.has(biological)) {
        errors.push(
          makeIssue(
            ['reactions', reactionIndex, 'biologicals', biologicalIndex],
            `Reaction ${reactionIndex + 1} references unknown biological "${biological}".`
          )
        );
      }
    });

    if (reaction.type === 'cell_consumption_waste') {
      if (reaction.substrates.length !== 1 || reaction.products.length !== 1 || reaction.biologicals.length !== 1) {
        errors.push(
          makeIssue(
            ['reactions', reactionIndex],
            'Reaction type "cell_consumption_waste" requires exactly 1 substrate, 1 product, and 1 biological.'
          )
        );
      }
    }

    if (reaction.type === 'sink' && reaction.substrates.length < 1) {
      errors.push(makeIssue(['reactions', reactionIndex, 'substrates'], 'Reaction type "sink" requires at least 1 substrate.'));
    }

    if (reaction.type === 'cells_killing_cells' && reaction.biologicals.length < 2) {
      errors.push(
        makeIssue(
          ['reactions', reactionIndex, 'biologicals'],
          'Reaction type "cells_killing_cells" requires at least 2 biologicals.'
        )
      );
    }
  });

  if (errors.length > 0) {
    return {
      success: false,
      errors: buildValidationError(errors),
      warnings
    };
  }

  return {
    success: true,
    data,
    errors: null,
    warnings
  };
}
