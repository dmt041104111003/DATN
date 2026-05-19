import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

type CostModelsRaw = Record<string, number[]>;

let cachedCostmdls: { at: number; costmdls: CSL.Costmdls } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function blockfrostBaseUrl(network: string): string {
  const net = network === 'mainnet' ? 'mainnet' : 'preprod';
  return `https://cardano-${net}.blockfrost.io/api/v0`;
}

export function costmdlsFromBlockfrostRaw(raw: CostModelsRaw | null | undefined): CSL.Costmdls {
  const costmdls = CSL.Costmdls.new();
  for (const lang of ['PlutusV1', 'PlutusV2', 'PlutusV3'] as const) {
    const costs = raw?.[lang];
    if (!Array.isArray(costs) || costs.length === 0) continue;
    const model = CSL.CostModel.from_json(JSON.stringify(costs.map(String)));
    const language =
      lang === 'PlutusV1'
        ? CSL.Language.new_plutus_v1()
        : lang === 'PlutusV2'
          ? CSL.Language.new_plutus_v2()
          : CSL.Language.new_plutus_v3();
    costmdls.insert(language, model);
  }
  return costmdls;
}

export async function fetchOnChainCostmdls(apiKey: string, network: string): Promise<CSL.Costmdls> {
  const now = Date.now();
  if (cachedCostmdls && now - cachedCostmdls.at < CACHE_TTL_MS) {
    return cachedCostmdls.costmdls;
  }

  const res = await fetch(`${blockfrostBaseUrl(network)}/epochs/latest/parameters`, {
    headers: { project_id: apiKey },
  });
  if (!res.ok) {
    throw new Error(`Không tải được protocol parameters (${res.status}).`);
  }
  const data = (await res.json()) as { cost_models_raw?: CostModelsRaw };
  const costmdls = costmdlsFromBlockfrostRaw(data.cost_models_raw);
  if (costmdls.len() === 0) {
    throw new Error('Blockfrost không trả về cost_models_raw.');
  }
  cachedCostmdls = { at: now, costmdls };
  return costmdls;
}
