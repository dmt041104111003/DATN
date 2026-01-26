use cardano/address.{Address}
use aiken/crypto.{VerificationKeyHash}

pub type ProductState {
  Minted
  InTransit(Int)
  Confirmed(Int)
  Completed
}

pub type Roadmap {
  Roadmap(List<Address>)
}

pub type DistributionPlan {
  DistributionPlan(List<Int>)
}

pub type HashRoots {
  HashRoots(ByteArray, ByteArray, ByteArray)
}

pub type ProductDatum {
  ProductDatum(ProductState, Roadmap, HashRoots, VerificationKeyHash, DistributionPlan)
}

pub type TraceabilityRedeemer {
  StartTransit(Bool)
  ConfirmReceipt(Bool)
  TransferToNext(Bool)
  MarkCompleted(Bool)
  Burn
}

pub type MintRedeemer {
  Mint(Roadmap, HashRoots, Int, DistributionPlan)
}

pub const min_ada_in_utxo = 2000000
