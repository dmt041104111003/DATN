# System Architecture: QR Code Supply Chain Traceability

## 1. System Overview

Supply chain traceability platform using QR codes and Cardano blockchain. Products are minted as CIP-68 NFTs with metadata stored on-chain. Each product gets a unique QR code linking to its blockchain record. The system provides a web interface for creating products, scanning QR codes, and viewing full traceability history.

**Key Capabilities:**
- CIP-68 NFT-based product tracking with mutable metadata
- QR code generation and scanning via web interface
- Full supply chain history with transaction-level traceability
- Multi-owner authorization for product management
- Web dashboard (Next.js) for product creation, scanning, and verification

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER (Next.js)            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  /create     │  │  /scan       │  │  /product/{id}   │  │
│  │  Create new  │  │  QR Scanner  │  │  Product detail  │  │
│  │  product     │  │  (Camera)    │  │  + History       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (shadcn/ui + Tailwind CSS)         │   │
│  │  - QR Scanner (@yudiel/react-qr-scanner)             │   │
│  │  - QR Generator (qrcode library)                     │   │
│  │  - Product cards, history timeline                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                   SERVER LAYER (Next.js Server Actions)      │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  actions/product.ts                                 │    │
│  │  - getProduct(): Fetch product metadata from UTXO   │    │
│  │  - CIP-68 reference token lookup                    │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  actions/tracking.ts                                 │   │
│  │  - getTracking(): Full transaction history           │   │
│  │  - Classify actions: Mint/Burn/Transfer/Update       │   │
│  │  - Deserialize CBOR datum per transaction            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CLI Tools (cli/)                                    │   │
│  │  - mint.ts: Mint new product NFT (CIP-68)            │   │
│  │  - update.ts: Update product metadata                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                   CONTRACT LAYER (Aiken Smart Contracts)     │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐    │
│  │  mint validator (traceability.ak)                   │    │
│  │  - Parameterized with owners list + store address   │    │
│  │  - Redeemers: Create | Burn                         │    │
│  │  - Multi-owner authorization                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  store validator (traceability.ak)                   │   │
│  │  - Parameterized with owners list                    │   │
│  │  - Datum type: CIP68 (standard metadata format)      │   │
│  │  - Redeemers: Update | Remove                        │   │
│  │  - Multi-owner authorization                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Off-chain (contract/scripts/)                       │   │
│  │  - mesh.ts: Mesh SDK adapter, script initialization  │   │
│  │  - offchain.ts: Mint, update, burn operations        │   │
│  │  - index.ts: CLI entry point                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                   BLOCKCHAIN LAYER                           │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Blockfrost API (Preprod Testnet)                    │   │
│  │  - Transaction submission                            │   │
│  │  - UTXO queries with inline datum                    │   │
│  │  - Asset transaction history                         │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cardano Blockchain (Preprod)                        │   │
│  │  - CIP-68 NFTs (reference token at store address)    │   │
│  │  - Mutable metadata via datum updates                │   │
│  │  - Full transaction history = supply chain trail     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagram

### Product Creation Flow

```
┌──────────┐  Fill Form  ┌──────────────┐
│ Operator │────────────►│ /create page │
│ (Web UI) │             └──────┬───────┘
└──────────┘                    │
                                ▼
                       ┌─────────────────┐
                       │ cli/mint.ts     │
                       │ 1. Build CIP-68 │
                       │    metadata     │
                       │ 2. Mint NFT     │
                       │    (ref + user  │
                       │     tokens)     │
                       │ 3. Store datum  │
                       │    at contract  │
                       │    address      │
                       └───────┬─────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │ Aiken Contract  │
                       │ mint(Create)    │
                       │ Verify owner    │
                       │ signature       │
                       └───────┬─────────┘
                               │
                               ▼
                       ┌─────────────────┐     ┌─────────────┐
                       │ Cardano Ledger  │     │ QR Code     │
                       │ CIP-68 NFT     │     │ Generated   │
                       │ + Datum stored  │     │ Links to    │
                       └─────────────────┘     │ /product/id │
                                               └─────────────┘
```

### QR Scan & Verification Flow

```
┌──────────────┐  Camera  ┌──────────────┐
│ User/Scanner │─────────►│ /scan page   │
│              │          │ QR decode    │
└──────────────┘          └──────┬───────┘
                                 │ Extract product ID
                                 ▼
                        ┌─────────────────┐
                        │ /product/{id}   │
                        │ page            │
                        └───────┬─────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼                       ▼
           ┌─────────────────┐    ┌─────────────────┐
           │ getProduct()    │    │ getTracking()   │
           │ Fetch UTXO      │    │ Fetch all txs   │
           │ + CIP-68 datum  │    │ for this asset  │
           │ = Current state │    │ = Full history  │
           └───────┬─────────┘    └───────┬─────────┘
                   │                      │
                   ▼                      ▼
           ┌─────────────────┐    ┌─────────────────┐
           │ Product Info    │    │ History Timeline │
           │ Name, Batch,   │    │ Mint → Transfer  │
           │ Location, etc. │    │ → Update → ...   │
           └─────────────────┘    └─────────────────┘
```

## 4. Smart Contract Design

**Language:** Aiken (Plutus v3)

**Mint Validator** — Controls NFT creation and burning:
```aiken
validator mint(owners: List<Address>, store: Address) {
  mint(redeemer: Mint, ...) {
    // Verify at least one owner signed the transaction
    // Redeemers: Create | Burn
  }
}
```

**Store Validator** — Controls metadata updates:
```aiken
validator store(owners: List<Address>) {
  spend(datum: Option<CIP68>, redeemer: Store, ...) {
    // Verify at least one owner signed the transaction
    // Redeemers: Update | Remove
  }
}
```

**CIP-68 Token Pattern:**
- Reference token (100): Stored at contract address with metadata datum
- User token (222): Held in user's wallet as proof of ownership

**Multi-owner Authorization:** Any address in the `owners` list can sign transactions, enabling multi-party supply chain management.

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 | Web application framework |
| UI Components | shadcn/ui + Tailwind CSS | Component library |
| QR Scanner | @yudiel/react-qr-scanner | Camera-based QR reading |
| QR Generator | qrcode | QR code image generation |
| State Management | TanStack React Query | Server state caching |
| Server Actions | Next.js Server Actions | Backend API layer |
| Blockchain SDK | Mesh SDK (@meshsdk/core) | Transaction building |
| CBOR | cbor library | Datum serialization |
| API | Blockfrost API | Blockchain data access |
| Smart Contract | Aiken (CIP-68) | On-chain product management |
| Blockchain | Cardano (Preprod) | Immutable supply chain ledger |
| Runtime | Bun | Package management + CLI scripts |

## 6. Security Considerations

- Multi-owner authorization: Multiple parties can manage products
- CIP-68 reference tokens locked at contract address (not freely transferable)
- All metadata updates require owner signature validation on-chain
- Server-side Blockfrost API key (not exposed to client)
- Mnemonic stored in `.env`, never committed
- QR codes contain only public asset identifiers (no sensitive data)
