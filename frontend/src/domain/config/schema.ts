import { z } from 'zod';

const ALLOWED_REACTION_TYPES = ['cell_consumption_waste', 'sink', 'cells_killing_cells'] as const;

const nonEmptyNameSchema = z.string().trim().min(1, 'Name cannot be empty.');

const simulationSchema = z
  .object({
    T: z.number().positive('simulation.T must be > 0.'),
    dt: z.number().positive('simulation.dt must be > 0.'),
    run_solver: z.boolean(),
    times_to_plot: z.array(z.number())
  })
  .superRefine((simulation, ctx) => {
    if (simulation.dt > simulation.T) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dt'],
        message: 'simulation.dt must be <= simulation.T.'
      });
    }

    simulation.times_to_plot.forEach((time, index) => {
      if (time < 0 || time > simulation.T) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['times_to_plot', index],
          message: `simulation.times_to_plot[${index}] must be within [0, simulation.T].`
        });
      }
    });
  });

const domainSchema = z.object({
  Lx: z.number().positive('domain.Lx must be > 0.'),
  Ly: z.number().positive('domain.Ly must be > 0.'),
  Nx: z.number().int('domain.Nx must be an integer.').min(3, 'domain.Nx must be >= 3.'),
  Ny: z.number().int('domain.Ny must be an integer.').min(3, 'domain.Ny must be >= 3.')
});

const chemicalSchema = z.object({
  name: nonEmptyNameSchema
}).passthrough();

const cellSchema = z.object({
  name: nonEmptyNameSchema
}).passthrough();

const entrySchema = z.object({
  position: z.tuple([z.number(), z.number()]),
  chemical: nonEmptyNameSchema,
  concentration: z.number().nonnegative().optional()
}).passthrough();

const reactionSchema = z.object({
  type: z.enum(ALLOWED_REACTION_TYPES),
  substrates: z.array(nonEmptyNameSchema),
  products: z.array(nonEmptyNameSchema),
  biologicals: z.array(nonEmptyNameSchema),
  coefficients: z.array(z.number()).optional()
});

const deviceSchema = z
  .object({
    id: nonEmptyNameSchema,
    domain: domainSchema,
    chemicals: z.array(chemicalSchema),
    cells: z.array(cellSchema),
    entries: z.array(entrySchema),
    reactions: z.array(reactionSchema).optional()
  })
  .passthrough()
  .superRefine((device, ctx) => {
    const chemicalNames = new Set<string>();
    device.chemicals.forEach((chemical, index) => {
      const name = chemical.name.trim();
      if (chemicalNames.has(name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chemicals', index, 'name'],
          message: `Duplicate chemical name "${name}" in device "${device.id}".`
        });
      }
      chemicalNames.add(name);
    });

    const cellNames = new Set<string>();
    device.cells.forEach((cell, index) => {
      const name = cell.name.trim();
      if (cellNames.has(name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cells', index, 'name'],
          message: `Duplicate cell name "${name}" in device "${device.id}".`
        });
      }
      cellNames.add(name);
    });

    device.entries.forEach((entry, index) => {
      const [x, y] = entry.position;
      if (x < 0 || x > device.domain.Lx || y < 0 || y > device.domain.Ly) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['entries', index, 'position'],
          message: `Entry ${index + 1} in device "${device.id}" must be within domain bounds [0, Lx] x [0, Ly].`
        });
      }
    });
  });

const segmentLocSchema = z.object({
  start: z.tuple([z.number(), z.number()]),
  stop: z.tuple([z.number(), z.number()])
});

const interfaceSchema = z
  .object({
    device1: nonEmptyNameSchema,
    device2: nonEmptyNameSchema,
    locs: z
      .object({
        device1: segmentLocSchema,
        device2: segmentLocSchema
      })
      .strict(),
    D_interface: z.record(z.number().min(0, 'All D_interface values must be >= 0.')).default({})
  })
  .superRefine((iface, ctx) => {
    if (iface.device1 === iface.device2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['device2'],
        message: 'Interface device1 and device2 must be different.'
      });
    }
  });

export const configSchema = z.object({
  simulation: simulationSchema,
  devices: z.array(deviceSchema),
  interfaces: z.array(interfaceSchema),
  reactions: z.array(reactionSchema),
  washouts: z.array(z.unknown())
});

export type ConfigSchema = z.infer<typeof configSchema>;

export { validateConfig } from './validateConfig';
export type { ValidateConfigResult, ValidationErrors, ValidationIssue } from './validateConfig';
