import type { ReactionModel } from '../reactions/types';

export type DeviceDomainModel = {
  Lx: number;
  Ly: number;
  Nx: number;
  Ny: number;
};

export type ChemicalModel = {
  name: string;
  max_concentration?: number;
  diffusion_coef?: number;
  initial_profile?: string;
};

export type CellModel = {
  name: string;
  concentration?: number;
  diffusion_coef?: number;
  shape?: string;
};

export type EntryModel = {
  position: [number, number];
  chemical: string;
  concentration?: number;
};

export type DeviceModel = {
  id: string;
  domain: DeviceDomainModel;
  chemicals: ChemicalModel[];
  cells: CellModel[];
  entries: EntryModel[];
  reactions: ReactionModel[];
} & Record<string, unknown>;
