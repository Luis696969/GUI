import type { AppState } from '../hooks/useConfigReducer';

const RUN_SIMULATION_ENDPOINT = '/run-simulation';

export type RunSimulationResult = {
  data: unknown | null;
  statusMessage: string;
  backendOk: boolean;
};

export async function postRunSimulation(config: AppState): Promise<RunSimulationResult> {
  try {
    const response = await fetch(RUN_SIMULATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        data: payload,
        backendOk: false,
        statusMessage:
          'Backend simulation unavailable. You can still copy or download the generated JSON.'
      };
    }

    return {
      data: payload,
      backendOk: true,
      statusMessage: 'Simulation submitted to backend.'
    };
  } catch {
    return {
      data: null,
      backendOk: false,
      statusMessage:
        'Backend request failed. You can still copy or download the generated JSON.'
    };
  }
}
