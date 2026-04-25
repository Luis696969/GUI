import type { InterfaceModel, SegmentLoc } from './types';

export const DEFAULT_SEGMENT_LOC: SegmentLoc = {
  start: [0, 0],
  stop: [0, 0]
};

export const DEFAULT_INTERFACE: InterfaceModel = {
  device1: '',
  device2: '',
  locs: {
    device1: DEFAULT_SEGMENT_LOC,
    device2: DEFAULT_SEGMENT_LOC
  }
};
