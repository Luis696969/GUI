import type { ReactionModel } from '../reactions/types';

export type DeviceModel = {
  reactions: ReactionModel[];
} & Record<string, unknown>;
