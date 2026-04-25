import type { DeviceModel } from '../devices/types';
import type { InterfaceModel } from '../interfaces/types';
import type { ReactionModel } from '../reactions/types';
import type { SimulationModel } from '../simulation/types';

export type ExportConfig = {
  simulation: SimulationModel;
  devices: Array<Omit<DeviceModel, 'reactions'>>;
  interfaces: InterfaceModel[];
  reactions: ReactionModel[];
  washouts: [];
};

export type BuildConfigInput = {
  simulation?: Partial<SimulationModel>;
  devices?: DeviceModel[];
  interfaces?: InterfaceModel[];
};
