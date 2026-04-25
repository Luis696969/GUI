export type SimulationConfig = Record<string, unknown>;

export type ReactionConfig = {
  type?: string;
  substrates?: string[];
  products?: string[];
  biologicals?: string[];
  coefficients?: number[];
  [key: string]: unknown;
};

export type DeviceConfig = {
  reactions?: ReactionConfig[];
  [key: string]: unknown;
};

export type InterfaceLocation = {
  start: [number, number];
  stop: [number, number];
};

export type InterfaceConfig = {
  device1?: string;
  device2?: string;
  locs?: {
    device1?: InterfaceLocation;
    device2?: InterfaceLocation;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ExportConfig = {
  simulation: SimulationConfig;
  devices: Array<Omit<DeviceConfig, 'reactions'>>;
  interfaces: InterfaceConfig[];
  reactions: ReactionConfig[];
  washouts: [];
};

export type BuildConfigInput = {
  simulation?: SimulationConfig;
  devices?: DeviceConfig[];
  interfaces?: InterfaceConfig[];
};

function reactionFingerprint(reaction: ReactionConfig): string {
  return JSON.stringify({
    type: reaction.type,
    substrates: [...(reaction.substrates ?? [])].sort(),
    products: [...(reaction.products ?? [])].sort(),
    biologicals: [...(reaction.biologicals ?? [])].sort(),
    coefficients: (reaction.coefficients ?? []).map(Number)
  });
}

function collectGlobalReactions(devices: DeviceConfig[]): ReactionConfig[] {
  const seen = new Set<string>();
  const reactions: ReactionConfig[] = [];

  devices.forEach((device) => {
    (device.reactions ?? []).forEach((reaction) => {
      const fingerprint = reactionFingerprint(reaction);
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        reactions.push(reaction);
      }
    });
  });

  return reactions;
}

function ensureInterfaceLocKeys(iface: InterfaceConfig): InterfaceConfig {
  const device1Loc = iface.locs?.device1;
  const device2Loc = iface.locs?.device2;

  return {
    ...iface,
    locs: {
      device1: device1Loc,
      device2: device2Loc
    }
  };
}

/**
 * Pure builder that mirrors the legacy export behavior from js/builders/buildConfig.js:
 * - removes nested `device.reactions`
 * - lifts unique reactions to root-level `reactions`
 * - keeps literal `locs.device1` and `locs.device2`
 * - always exports `washouts: []`
 */
export function buildConfig(input: BuildConfigInput = {}): ExportConfig {
  const simulation = input.simulation ?? {};
  const devices = input.devices ?? [];
  const interfaces = (input.interfaces ?? []).map(ensureInterfaceLocKeys);
  const reactions = collectGlobalReactions(devices);

  const exportDevices = devices.map(({ reactions: _reactions, ...deviceWithoutReactions }) => deviceWithoutReactions);

  return {
    simulation,
    devices: exportDevices,
    interfaces,
    reactions,
    washouts: []
  };
}
