use aiken/collection/list
use cardano/address.{Address}
use cardano/assets.{AssetName, PolicyId}
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction, find_input}
use contract/types.{
  ProductDatum,
  TraceabilityRedeemer,
  DistributionPlan,
  Minted,
  InTransit,
  Confirmed,
  Completed,
  StartTransit,
  ConfirmReceipt,
  TransferToNext,
  MarkCompleted,
  Burn,
}
use contract/utils

validator traceability(
  policy_id: PolicyId,
  nft_asset_name: AssetName,
  ft_asset_name: AssetName,
  script_address: Address,
) {
  spend(
    datum: Option<ProductDatum>,
    redeemer: TraceabilityRedeemer,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    let Transaction { inputs, outputs, extra_signatories, .. } = transaction
    
    expect Some(input) = find_input(inputs, output_reference)
    expect Some(old_datum_from_param) = datum
    let ProductDatum(old_state, old_roadmap, old_hash_roots, old_enterprise, old_plan) = old_datum_from_param
    
    expect _ = utils.check_nft_at_address(input.output, policy_id, nft_asset_name, script_address)?
    expect _ = utils.check_ft_supply_conservation(inputs, outputs, policy_id, ft_asset_name)?
    
    let total_supply = {
      let DistributionPlan(amounts) = old_plan
      list.foldl(amounts, 0, fn(amount, acc) { acc + amount })
    }
    
    when redeemer is {
      Burn -> {
        expect _ = utils.verify_enterprise_signature(extra_signatories, old_enterprise)?
        expect None = utils.find_nft_output(outputs, policy_id, nft_asset_name, script_address)
        True
      }
      
      StartTransit(gps_valid) -> {
        expect Minted = old_state
        expect Some(nft_output) = utils.find_nft_output(outputs, policy_id, nft_asset_name, script_address)
        expect InlineDatum(new_datum_raw) = nft_output.datum
        expect ProductDatum(new_state, new_roadmap, new_hash_roots, new_enterprise, new_plan) = new_datum_raw
        expect InTransit(0) = new_state
        expect _ = utils.validate_state_transition(old_state, new_state, old_roadmap)?
        expect Some(first_agent_address) = utils.get_roadmap_agent(old_roadmap, 0)
        expect _ = utils.verify_enterprise_signature(extra_signatories, old_enterprise)?
        expect True = old_hash_roots == new_hash_roots && old_enterprise == new_enterprise && old_roadmap == new_roadmap && old_plan == new_plan
        expect Some(first_amount) = utils.get_distribution_amount(old_plan, 0)
        let first_agent_ft = utils.get_ft_at_address(outputs, first_agent_address, policy_id, ft_asset_name)
        expect _ = (first_agent_ft == first_amount)?
        expect _ = utils.check_minimum_ada(nft_output)?
        expect _ = gps_valid?
        True
      }
      
      ConfirmReceipt(gps_valid) -> {
        expect InTransit(transit_index) = old_state
        expect Some(nft_output) = utils.find_nft_output(outputs, policy_id, nft_asset_name, script_address)
        expect InlineDatum(new_datum_raw) = nft_output.datum
        expect ProductDatum(new_state, new_roadmap, new_hash_roots, new_enterprise, new_plan) = new_datum_raw
        expect Confirmed(confirmed_index) = new_state
        expect _ = (transit_index == confirmed_index)?
        expect _ = utils.validate_state_transition(old_state, new_state, old_roadmap)?
        expect Some(current_agent_address) = utils.get_roadmap_agent(old_roadmap, transit_index)
        expect _ = utils.verify_agent_signature(extra_signatories, current_agent_address)?
        expect True = old_hash_roots == new_hash_roots && old_enterprise == new_enterprise && old_roadmap == new_roadmap && old_plan == new_plan
        expect Some(agent_amount) = utils.get_distribution_amount(old_plan, transit_index)
        let agent_ft = utils.get_ft_at_address(outputs, current_agent_address, policy_id, ft_asset_name)
        expect _ = (agent_ft == agent_amount)?
        expect _ = utils.check_minimum_ada(nft_output)?
        expect _ = gps_valid?
        True
      }
      
      TransferToNext(gps_valid) -> {
        expect Confirmed(confirmed_index) = old_state
        expect Some(nft_output) = utils.find_nft_output(outputs, policy_id, nft_asset_name, script_address)
        expect InlineDatum(new_datum_raw) = nft_output.datum
        expect ProductDatum(new_state, new_roadmap, new_hash_roots, new_enterprise, new_plan) = new_datum_raw
        expect InTransit(transit_index) = new_state
        expect _ = (transit_index == confirmed_index + 1)?
        expect _ = utils.validate_state_transition(old_state, new_state, old_roadmap)?
        expect Some(next_agent_address) = utils.get_roadmap_agent(old_roadmap, confirmed_index + 1)
        expect Some(current_agent_address) = utils.get_roadmap_agent(old_roadmap, confirmed_index)
        expect _ = utils.verify_agent_signature(extra_signatories, current_agent_address)?
        expect True = old_hash_roots == new_hash_roots && old_enterprise == new_enterprise && old_roadmap == new_roadmap && old_plan == new_plan
        let remaining = utils.get_remaining_supply(old_plan, confirmed_index, total_supply)
        let next_agent_ft = utils.get_ft_at_address(outputs, next_agent_address, policy_id, ft_asset_name)
        expect _ = (next_agent_ft == remaining)?
        expect _ = utils.check_minimum_ada(nft_output)?
        expect _ = gps_valid?
        True
      }
      
      MarkCompleted(gps_valid) -> {
        expect Confirmed(confirmed_index) = old_state
        expect Some(nft_output) = utils.find_nft_output(outputs, policy_id, nft_asset_name, script_address)
        expect InlineDatum(new_datum_raw) = nft_output.datum
        expect ProductDatum(new_state, new_roadmap, new_hash_roots, new_enterprise, new_plan) = new_datum_raw
        expect Completed = new_state
        expect _ = utils.is_last_agent(old_roadmap, confirmed_index)?
        expect _ = utils.validate_state_transition(old_state, new_state, old_roadmap)?
        expect Some(last_agent_address) = utils.get_roadmap_agent(old_roadmap, confirmed_index)
        expect _ = utils.verify_agent_signature(extra_signatories, last_agent_address)?
        expect True = old_hash_roots == new_hash_roots && old_enterprise == new_enterprise && old_roadmap == new_roadmap && old_plan == new_plan
        expect Some(last_amount) = utils.get_distribution_amount(old_plan, confirmed_index)
        let last_agent_ft = utils.get_ft_at_address(outputs, last_agent_address, policy_id, ft_asset_name)
        expect _ = (last_agent_ft == last_amount)?
        expect _ = utils.check_minimum_ada(nft_output)?
        expect _ = gps_valid?
        True
      }
    }
  }
  
  else(_) {
    fail
  }
}
