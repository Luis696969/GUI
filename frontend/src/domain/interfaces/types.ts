export type SegmentLoc = {
  start: [number, number];
  stop: [number, number];
};

export type InterfaceLocs = {
  device1: SegmentLoc;
  device2: SegmentLoc;
};

export type InterfaceModel = {
  device1: string;
  device2: string;
  locs: InterfaceLocs;
  D_interface?: Record<string, number>;
};
