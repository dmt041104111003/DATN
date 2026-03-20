use aiken/collection/list
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use cardano/tx.{verify_signature}
use cocktail/vodka_address.{address_pub_key}
use contract/types.{Burn, Create, Mint, Remove, Store, Update}
use types/cip68.{CIP68}

validator mint(owners: List<Address>, store: Address) {
  mint(redeemer: Mint, _policy_id: PolicyId, transaction: Transaction) {
    let Transaction { extra_signatories, .. } = transaction
    let is_authorized =
      list.any(
        owners,
        fn(owner) {
          when address_pub_key(owner) is {
            Some(key) -> verify_signature(extra_signatories, key)
            None -> False
          }
        },
      )

    when redeemer is {
      Create -> is_authorized
      Burn -> is_authorized
    }
  }

  else(_) {
    fail
  }
}

validator store(owners: List<Address>) {
  spend(
    datum_option: Option<CIP68>,
    redeemer: Store,
    output_reference: OutputReference,
    transaction: Transaction,
  ) {
    let Transaction { inputs, outputs, extra_signatories, .. } = transaction
    let has_datum =
      when datum_option is {
        Some(_) -> True
        None -> False
      }
    let consumed_input_exists =
      list.any(
        inputs,
        fn(input) { input.output_reference == output_reference },
      )
    let continuing_output_same_address =
      list.any(
        inputs,
        fn(input) {
          if input.output_reference == output_reference {
            list.any(outputs, fn(output) { output.address == input.output.address })
          } else {
            False
          }
        },
      )
    let is_authorized =
      list.any(
        owners,
        fn(owner) {
          when address_pub_key(owner) is {
            Some(key) -> verify_signature(extra_signatories, key)
            None -> False
          }
        },
      )
    when redeemer is {
      Update -> is_authorized && has_datum && consumed_input_exists && continuing_output_same_address
      Remove -> is_authorized && consumed_input_exists
    }
  }

  else(_) {
    fail
  }
}
