import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

function collectUsedLanguages(witness: CSL.TransactionWitnessSet): CSL.Languages {
  const languages = CSL.Languages.new();
  const scripts = witness.plutus_scripts();
  if (!scripts) return languages;

  const seen = new Set<number>();
  for (let i = 0; i < scripts.len(); i++) {
    const kind = scripts.get(i).language_version().kind();
    if (seen.has(kind)) continue;
    seen.add(kind);
    if (kind === CSL.LanguageKind.PlutusV1) languages.add(CSL.Language.new_plutus_v1());
    else if (kind === CSL.LanguageKind.PlutusV2) languages.add(CSL.Language.new_plutus_v2());
    else if (kind === CSL.LanguageKind.PlutusV3) languages.add(CSL.Language.new_plutus_v3());
  }
  return languages;
}

/**
 * Mesh WASM may compute script_data_hash without current Plutus V3 cost models.
 * Re-hash using on-chain cost_models_raw so the node accepts the transaction.
 */
export function fixScriptDataHashInTx(txHex: string, costmdls: CSL.Costmdls): string {
  const clean = txHex.trim().replace(/^0x/i, '');
  const tx = CSL.Transaction.from_hex(clean);
  const body = tx.body();
  const witness = tx.witness_set();
  const redeemers = witness.redeemers();
  if (!redeemers || redeemers.len() === 0) return clean;

  let languages = collectUsedLanguages(witness);
  if (languages.len() === 0) {
    languages = CSL.Languages.new();
    if (costmdls.get(CSL.Language.new_plutus_v3())) {
      languages.add(CSL.Language.new_plutus_v3());
    }
  }
  if (languages.len() === 0) return clean;

  const scoped = costmdls.retain_language_versions(languages);
  const datums = witness.plutus_data();
  const hash = CSL.hash_script_data(
    redeemers,
    scoped,
    datums && datums.len() > 0 ? datums : undefined,
  );
  body.set_script_data_hash(hash);

  const fixed = CSL.Transaction.new(body, witness, tx.auxiliary_data());
  fixed.set_is_valid(tx.is_valid());
  return fixed.to_hex();
}
