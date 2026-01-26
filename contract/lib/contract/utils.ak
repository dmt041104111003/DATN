use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, VerificationKey}
use cardano/assets.{AssetName, PolicyId, flatten, lovelace_of, without_lovelace}
use cardano/transaction.{Input, Output}
use cardano/tx
use contract/types.{Roadmap, DistributionPlan, ProductState, Minted, InTransit, Confirmed, Completed}

pub fn get_roadmap_agent(roadmap: Roadmap, index: Int) -> Option<Address> {
  let Roadmap(agents) = roadmap
  list.at(agents, index)
}

pub fn is_last_agent(roadmap: Roadmap, index: Int) -> Bool {
  let Roadmap(agents) = roadmap
  index == list.length(agents) - 1
}

pub fn roadmap_length(roadmap: Roadmap) -> Int {
  let Roadmap(agents) = roadmap
  list.length(agents)
}

pub fn validate_roadmap(roadmap: Roadmap) -> Bool {
  roadmap_length(roadmap) > 0
}

pub fn validate_state_transition(
  old_state: ProductState,
  new_state: ProductState,
  roadmap: Roadmap,
) -> Bool {
  when old_state is {
    Minted -> when new_state is {
      InTransit(0) -> True
      _ -> False
    }
    InTransit(index) -> when new_state is {
      Confirmed(confirmed_index) -> confirmed_index == index
      _ -> False
    }
    Confirmed(index) -> when new_state is {
      InTransit(next_index) -> next_index == index + 1 && next_index < roadmap_length(roadmap)
      Completed -> is_last_agent(roadmap, index)
      _ -> False
    }
    Completed -> False
  }
}

pub fn check_nft_at_address(
  output: Output,
  policy_id: PolicyId,
  nft_asset_name: AssetName,
  expected_address: Address,
) -> Bool {
  output.address == expected_address && {
    let assets = output.value |> without_lovelace() |> flatten()
    list.length(list.filter(assets, fn((pid, aname, amount)) {
      pid == policy_id && aname == nft_asset_name && amount == 1
    })) == 1
  }
}

pub fn get_ft_amount(value, policy_id: PolicyId, ft_asset_name: AssetName) -> Int {
  let assets = value |> without_lovelace() |> flatten()
  let ft_list = list.filter(assets, fn((pid, aname, _amount)) {
    pid == policy_id && aname == ft_asset_name
  })
  when list.head(ft_list) is {
    Some((_pid, _aname, amount)) -> amount
    None -> 0
  }
}

pub fn check_ft_supply_conservation(
  inputs: List<Input>,
  outputs: List<Output>,
  policy_id: PolicyId,
  ft_asset_name: AssetName,
) -> Bool {
  let input_total = list.foldl(inputs, 0, fn(input, acc) {
    acc + get_ft_amount(input.output.value, policy_id, ft_asset_name)
  })
  let output_total = list.foldl(outputs, 0, fn(output, acc) {
    acc + get_ft_amount(output.value, policy_id, ft_asset_name)
  })
  input_total == output_total
}

pub fn verify_agent_signature(
  extra_signatories: List<VerificationKeyHash>,
  expected_address: Address,
) -> Bool {
  when expected_address.payment_credential is {
    VerificationKey(pkh) -> tx.verify_signature(extra_signatories, pkh)
    _ -> False
  }
}

pub fn verify_enterprise_signature(
  extra_signatories: List<VerificationKeyHash>,
  enterprise: VerificationKeyHash,
) -> Bool {
  tx.verify_signature(extra_signatories, enterprise)
}

pub fn check_minimum_ada(output: Output) -> Bool {
  lovelace_of(output.value) >= types.min_ada_in_utxo
}

pub fn find_nft_output(
  outputs: List<Output>,
  policy_id: PolicyId,
  nft_asset_name: AssetName,
  script_address: Address,
) -> Option<Output> {
  list.find(outputs, fn(output) {
    check_nft_at_address(output, policy_id, nft_asset_name, script_address)
  })
}

pub fn get_ft_at_address(
  outputs: List<Output>,
  address: Address,
  policy_id: PolicyId,
  ft_asset_name: AssetName,
) -> Int {
  let agent_outputs = list.filter(outputs, fn(output) { output.address == address })
  list.foldl(agent_outputs, 0, fn(output, acc) {
    acc + get_ft_amount(output.value, policy_id, ft_asset_name)
  })
}

pub fn get_distribution_amount(plan: DistributionPlan, index: Int) -> Option<Int> {
  let DistributionPlan(amounts) = plan
  list.at(amounts, index)
}

pub fn get_remaining_supply(
  plan: DistributionPlan,
  current_index: Int,
  total_supply: Int,
) -> Int {
  let DistributionPlan(amounts) = plan
  let allocated_up_to_index = {
    let take_n = list.take(amounts, current_index + 1)
    list.foldl(take_n, 0, fn(amount, acc) { acc + amount })
  }
  total_supply - allocated_up_to_index
}

pub fn validate_distribution_plan(
  plan: DistributionPlan,
  roadmap: Roadmap,
  total_supply: Int,
) -> Bool {
  let DistributionPlan(amounts) = plan
  let roadmap_len = roadmap_length(roadmap)
  let plan_len = list.length(amounts)
  let lengths_match = roadmap_len == plan_len
  let total_matches = {
    let plan_total = list.foldl(amounts, 0, fn(amount, acc) { acc + amount })
    plan_total == total_supply
  }
  let all_positive = {
    let negative_count = list.length(list.filter(amounts, fn(amount) { amount < 0 }))
    negative_count == 0
  }
  lengths_match && total_matches && all_positive
}
