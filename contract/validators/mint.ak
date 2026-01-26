use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{flatten, without_lovelace}
use cardano/transaction.{Transaction}
use contract/types.{MintRedeemer, Mint}
use contract/utils

validator product_mint(enterprise: VerificationKeyHash) {
  mint(redeemer: MintRedeemer, ctx: Transaction, _purpose) {
    let Transaction { extra_signatories, mint, .. } = ctx
    expect _ = utils.verify_enterprise_signature(extra_signatories, enterprise)?
    let minted_assets = mint |> without_lovelace() |> flatten()
    expect _ = (list.length(minted_assets) >= 1)?
    let Mint(roadmap, _hash_roots, ft_total_supply, plan) = redeemer
    let roadmap_valid = utils.validate_roadmap(roadmap)
    let supply_valid = ft_total_supply > 0
    let plan_valid = utils.validate_distribution_plan(plan, roadmap, ft_total_supply)
    expect True = roadmap_valid && supply_valid && plan_valid
    True
  }
  else(_) {
    fail
  }
}
