import type { DeviceModel } from '../devices/types';
import type { InterfaceModel, SegmentLoc } from '../interfaces/types';
import type { ReactionModel } from '../reactions/types';
import { DEFAULT_SIMULATION } from '../simulation/defaults';
import type { SimulationModel } from '../simulation/types';
import type { BuildConfigInput, ExportConfig } from './types';

function reactionFingerprint(reaction: ReactionModel): string {
  return JSON.stringify({
    type: reaction.type,
    substrates: [...reaction.substrates].sort(),
    products: [...reaction.products].sort(),
    biologicals: [...reaction.biologicals].sort(),
    coefficients: reaction.coefficients.map(Number)
  });
}

function collectGlobalReactions(devices: DeviceModel[]): ReactionModel[] {
  const seen = new Set<string>();
  const reactions: ReactionModel[] = [];

  devices.forEach((device) => {
    device.reactions.forEach((reaction) => {
      const fingerprint = reactionFingerprint(reaction);
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        reactions.push(reaction);
      }
    });
  });

  return reactions;
}

function ensureInterfaceLocKeys(iface: InterfaceModel): InterfaceModel {
  const defaultLoc: SegmentLoc = { start: [0, 0], stop: [0, 0] };

  return {
    ...iface,
    locs: {
      device1: iface.locs.device1 ?? defaultLoc,
      device2: iface.locs.device2 ?? defaultLoc
    }
  };
}

function normalizeSimulation(simulation?: Partial<SimulationModel>): SimulationModel {
  return {
    T: simulation?.T ?? DEFAULT_SIMULATION.T,
    dt: simulation?.dt ?? DEFAULT_SIMULATION.dt,
    run_solver: simulation?.run_solver ?? DEFAULT_SIMULATION.run_solver,
    times_to_plot: simulation?.times_to_plot ?? [...DEFAULT_SIMULATION.times_to_plot]
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
  const simulation = normalizeSimulation(input.simulation);
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
