import { useMemo, useReducer } from 'react';
import { DEFAULT_SIMULATION } from '../domain/simulation/defaults';
import type { SimulationModel } from '../domain/simulation/types';
import type { CellModel, ChemicalModel, DeviceModel, EntryModel } from '../domain/devices/types';
import type { InterfaceModel } from '../domain/interfaces/types';
import type { ReactionModel } from '../domain/reactions/types';

export type AppState = {
  simulation: SimulationModel;
  devices: DeviceModel[];
  interfaces: InterfaceModel[];
};

export type DeviceSummary = {
  id: string;
  chemicals: number;
  cells: number;
  entries: number;
  reactions: number;
};

export type InterfaceSharedChemicals = {
  index: number;
  device1: string;
  device2: string;
  sharedChemicals: string[];
};

type SimulationActions =
  | { type: 'simulation/replace'; payload: SimulationModel }
  | { type: 'simulation/update'; payload: Partial<SimulationModel> };

type DeviceActions =
  | { type: 'device/add'; payload: DeviceModel }
  | { type: 'device/remove'; payload: { deviceId: string } }
  | { type: 'device/update'; payload: { deviceId: string; patch: Partial<DeviceModel> } };

type ChemicalActions =
  | { type: 'chemical/add'; payload: { deviceId: string; chemical: ChemicalModel } }
  | { type: 'chemical/remove'; payload: { deviceId: string; chemicalName: string } }
  | { type: 'chemical/update'; payload: { deviceId: string; chemicalName: string; patch: Partial<ChemicalModel> } };

type CellActions =
  | { type: 'cell/add'; payload: { deviceId: string; cell: CellModel } }
  | { type: 'cell/remove'; payload: { deviceId: string; cellName: string } }
  | { type: 'cell/update'; payload: { deviceId: string; cellName: string; patch: Partial<CellModel> } };

type EntryActions =
  | { type: 'entry/add'; payload: { deviceId: string; entry: EntryModel } }
  | { type: 'entry/remove'; payload: { deviceId: string; index: number } }
  | { type: 'entry/update'; payload: { deviceId: string; index: number; patch: Partial<EntryModel> } };

type ReactionActions =
  | { type: 'reaction/add'; payload: { deviceId: string; reaction: ReactionModel } }
  | { type: 'reaction/remove'; payload: { deviceId: string; index: number } }
  | { type: 'reaction/update'; payload: { deviceId: string; index: number; patch: Partial<ReactionModel> } };

type InterfaceActions =
  | { type: 'interface/add'; payload: InterfaceModel }
  | { type: 'interface/remove'; payload: { index: number } }
  | { type: 'interface/update'; payload: { index: number; patch: Partial<InterfaceModel> } };

export type ConfigAction =
  | SimulationActions
  | DeviceActions
  | ChemicalActions
  | CellActions
  | EntryActions
  | ReactionActions
  | InterfaceActions;

const initialState: AppState = {
  simulation: DEFAULT_SIMULATION,
  devices: [],
  interfaces: []
};

function updateDevice(state: AppState, deviceId: string, updater: (device: DeviceModel) => DeviceModel): AppState {
  return {
    ...state,
    devices: state.devices.map((device) => (device.id === deviceId ? updater(device) : device))
  };
}

function removeAt<T>(values: T[], index: number): T[] {
  return values.filter((_, valueIndex) => valueIndex !== index);
}

function updateAt<T>(values: T[], index: number, patch: Partial<T>): T[] {
  return values.map((value, valueIndex) => (valueIndex === index ? { ...value, ...patch } : value));
}

export function configReducer(state: AppState, action: ConfigAction): AppState {
  switch (action.type) {
    case 'simulation/replace':
      return { ...state, simulation: action.payload };
    case 'simulation/update':
      return { ...state, simulation: { ...state.simulation, ...action.payload } };
    case 'device/add':
      return { ...state, devices: [...state.devices, action.payload] };
    case 'device/remove':
      return { ...state, devices: state.devices.filter((device) => device.id !== action.payload.deviceId) };
    case 'device/update':
      return updateDevice(state, action.payload.deviceId, (device) => ({ ...device, ...action.payload.patch }));

    case 'chemical/add':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        chemicals: [...device.chemicals, action.payload.chemical]
      }));
    case 'chemical/remove':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        chemicals: device.chemicals.filter((chemical) => chemical.name !== action.payload.chemicalName)
      }));
    case 'chemical/update':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        chemicals: device.chemicals.map((chemical) =>
          chemical.name === action.payload.chemicalName ? { ...chemical, ...action.payload.patch } : chemical
        )
      }));

    case 'cell/add':
      return updateDevice(state, action.payload.deviceId, (device) => ({ ...device, cells: [...device.cells, action.payload.cell] }));
    case 'cell/remove':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        cells: device.cells.filter((cell) => cell.name !== action.payload.cellName)
      }));
    case 'cell/update':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        cells: device.cells.map((cell) => (cell.name === action.payload.cellName ? { ...cell, ...action.payload.patch } : cell))
      }));

    case 'entry/add':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        entries: [...device.entries, action.payload.entry]
      }));
    case 'entry/remove':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        entries: removeAt(device.entries, action.payload.index)
      }));
    case 'entry/update':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        entries: updateAt(device.entries, action.payload.index, action.payload.patch)
      }));

    case 'reaction/add':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        reactions: [...device.reactions, action.payload.reaction]
      }));
    case 'reaction/remove':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        reactions: removeAt(device.reactions, action.payload.index)
      }));
    case 'reaction/update':
      return updateDevice(state, action.payload.deviceId, (device) => ({
        ...device,
        reactions: updateAt(device.reactions, action.payload.index, action.payload.patch)
      }));

    case 'interface/add':
      return { ...state, interfaces: [...state.interfaces, action.payload] };
    case 'interface/remove':
      return { ...state, interfaces: removeAt(state.interfaces, action.payload.index) };
    case 'interface/update':
      return { ...state, interfaces: updateAt(state.interfaces, action.payload.index, action.payload.patch) };

    default:
      return state;
  }
}

function reactionFingerprint(reaction: ReactionModel): string {
  return JSON.stringify({
    type: reaction.type,
    substrates: [...reaction.substrates].sort(),
    products: [...reaction.products].sort(),
    biologicals: [...reaction.biologicals].sort(),
    coefficients: [...reaction.coefficients].map(Number)
  });
}

export function selectSharedChemicalsByInterface(state: AppState): InterfaceSharedChemicals[] {
  return state.interfaces.map((iface, index) => {
    const device1 = state.devices.find((device) => device.id === iface.device1);
    const device2 = state.devices.find((device) => device.id === iface.device2);

    const chemicals1 = new Set(device1?.chemicals.map((chemical) => chemical.name) ?? []);
    const sharedChemicals = (device2?.chemicals ?? [])
      .map((chemical) => chemical.name)
      .filter((name) => chemicals1.has(name));

    return {
      index,
      device1: iface.device1,
      device2: iface.device2,
      sharedChemicals
    };
  });
}

export function selectDeviceSummaries(state: AppState): DeviceSummary[] {
  return state.devices.map((device) => ({
    id: device.id,
    chemicals: device.chemicals.length,
    cells: device.cells.length,
    entries: device.entries.length,
    reactions: device.reactions.length
  }));
}

export function selectRootReactionProjection(state: AppState): ReactionModel[] {
  const seen = new Set<string>();
  const projected: ReactionModel[] = [];

  state.devices.forEach((device) => {
    device.reactions.forEach((reaction) => {
      const key = reactionFingerprint(reaction);
      if (!seen.has(key)) {
        seen.add(key);
        projected.push(reaction);
      }
    });
  });

  return projected;
}

export const configActions = {
  updateSimulation: (payload: Partial<SimulationModel>): ConfigAction => ({ type: 'simulation/update', payload }),
  addDevice: (payload: DeviceModel): ConfigAction => ({ type: 'device/add', payload }),
  updateDevice: (payload: { deviceId: string; patch: Partial<DeviceModel> }): ConfigAction => ({ type: 'device/update', payload }),
  removeDevice: (payload: { deviceId: string }): ConfigAction => ({ type: 'device/remove', payload }),
  addChemical: (payload: { deviceId: string; chemical: ChemicalModel }): ConfigAction => ({ type: 'chemical/add', payload }),
  updateChemical: (payload: { deviceId: string; chemicalName: string; patch: Partial<ChemicalModel> }): ConfigAction => ({ type: 'chemical/update', payload }),
  removeChemical: (payload: { deviceId: string; chemicalName: string }): ConfigAction => ({ type: 'chemical/remove', payload }),
  addCell: (payload: { deviceId: string; cell: CellModel }): ConfigAction => ({ type: 'cell/add', payload }),
  updateCell: (payload: { deviceId: string; cellName: string; patch: Partial<CellModel> }): ConfigAction => ({ type: 'cell/update', payload }),
  removeCell: (payload: { deviceId: string; cellName: string }): ConfigAction => ({ type: 'cell/remove', payload }),
  addEntry: (payload: { deviceId: string; entry: EntryModel }): ConfigAction => ({ type: 'entry/add', payload }),
  updateEntry: (payload: { deviceId: string; index: number; patch: Partial<EntryModel> }): ConfigAction => ({ type: 'entry/update', payload }),
  removeEntry: (payload: { deviceId: string; index: number }): ConfigAction => ({ type: 'entry/remove', payload }),
  addReaction: (payload: { deviceId: string; reaction: ReactionModel }): ConfigAction => ({ type: 'reaction/add', payload }),
  updateReaction: (payload: { deviceId: string; index: number; patch: Partial<ReactionModel> }): ConfigAction => ({ type: 'reaction/update', payload }),
  removeReaction: (payload: { deviceId: string; index: number }): ConfigAction => ({ type: 'reaction/remove', payload }),
  addInterface: (payload: InterfaceModel): ConfigAction => ({ type: 'interface/add', payload }),
  updateInterface: (payload: { index: number; patch: Partial<InterfaceModel> }): ConfigAction => ({ type: 'interface/update', payload }),
  removeInterface: (payload: { index: number }): ConfigAction => ({ type: 'interface/remove', payload })
};

export function useConfigReducer(initial: AppState = initialState) {
  const [state, dispatch] = useReducer(configReducer, initial);

  const selectors = useMemo(
    () => ({
      sharedChemicalsByInterface: selectSharedChemicalsByInterface(state),
      deviceSummaries: selectDeviceSummaries(state),
      rootReactionProjection: selectRootReactionProjection(state)
    }),
    [state]
  );

  return { state, dispatch, selectors };
}
