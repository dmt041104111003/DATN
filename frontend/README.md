# QR Code Supply Chain Traceability on Cardano

A supply chain traceability platform using QR codes and Cardano blockchain. Products are minted as **CIP-68 NFTs** with mutable on-chain metadata. Each product gets a unique QR code linking to its blockchain-verified record. The web interface allows creating products, scanning QR codes, and viewing full traceability history.

## 📹 Demo

[![Watch the video](https://img.youtube.com/vi/h_saOa3uWoo/0.jpg)](https://www.youtube.com/watch?v=h_saOa3uWoo&feature=youtu.be)

## Features

- **CIP-68 NFT Product Tracking** — Each product is an NFT with mutable metadata (location, status, details)
- **QR Code Generation & Scanning** — Camera-based QR scanning via web UI, instant redirect to product page
- **Full Supply Chain History** — Transaction-level traceability with action classification (Mint/Transfer/Update/Burn)
- **Multi-Owner Authorization** — Multiple wallet addresses can manage products (Aiken smart contract RBAC)
- **Visual Timeline** — Interactive supply chain milestones with progress tracking
- **CBOR Datum Deserialization** — Inline datum parsing for real-time product metadata display

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 | Web application (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 | Component library + styling |
| QR Scanner | @yudiel/react-qr-scanner | Camera-based QR reading |
| QR Generator | qrcode | QR code image generation |
| State | TanStack React Query | Server state caching |
| Backend | Next.js Server Actions | API layer (actions/) |
| Blockchain SDK | Mesh SDK (@meshsdk/core) | Transaction building |
| CBOR | cbor | Datum serialization/deserialization |
| API | Blockfrost API | Blockchain data access (preprod) |
| Smart Contract | Aiken (Plutus v3) | On-chain validators |
| Runtime | Bun | Package management + CLI scripts |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 WEB UI (Next.js App Router)              │
│                                                         │
│  /(home)        /create          /scan      /product/id │
│  Landing page   QR generator     QR scanner  Timeline   │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              SERVER ACTIONS (actions/)                   │
│                                                         │
│  product.ts → getProduct()    Fetch CIP-68 datum        │
│  tracking.ts → getTracking()  Full tx history + classify│
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│              CLI TOOLS (cli/)                            │
│                                                         │
│  mint.ts → Mint new product NFT (CIP-68)                │
│  update.ts → Update product metadata (location, etc.)   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│           SMART CONTRACTS (Aiken - Plutus v3)           │
│                                                         │
│  mint validator: Create / Burn (multi-owner auth)       │
│  store validator: Update / Remove (multi-owner auth)    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              Cardano Blockchain (Preprod)
              via Blockfrost API
```

## Smart Contract Design

Two parameterized validators in `contract/validators/traceability.ak`:

**Mint Validator** — Controls NFT creation and burning:
```aiken
validator mint(owners: List<Address>, store: Address) {
  mint(redeemer: Mint, ...) {
    // Verify at least one owner signed the tx
    // Redeemers: Create | Burn
  }
}
```

**Store Validator** — Controls metadata updates at the contract address:
```aiken
validator store(owners: List<Address>) {
  spend(datum: Option<CIP68>, redeemer: Store, ...) {
    // Verify at least one owner signed the tx
    // Redeemers: Update | Remove
  }
}
```

**CIP-68 Token Pattern:**
- **Reference token (100):** Stored at contract address with metadata datum (name, brand, model, location, roadmap, etc.)
- **User token (222):** Held in user's wallet as proof of ownership

**Dependencies:** aiken-lang/stdlib v3.0.0, sidan-lab/vodka v0.1.22, logical-mechanism/assist v0.5.1

## Project Structure

```
iot5-qr-code-traceability/
├── app/                        # Next.js App Router pages
│   ├── (home)/page.tsx         # Landing page (Create QR / Scan QR)
│   ├── create/page.tsx         # QR code generator (enter issuers + product name)
│   ├── scan/page.tsx           # Camera-based QR scanner
│   ├── product/[id]/page.tsx   # Product detail + supply chain timeline
│   ├── layout.tsx              # Root layout (Geist fonts + QueryProvider)
│   └── globals.css             # Tailwind CSS v4 styles
├── actions/                    # Next.js Server Actions
│   ├── product.ts              # getProduct() — fetch CIP-68 datum from UTXO
│   └── tracking.ts             # getTracking() — full tx history with action classification
├── cli/                        # CLI tools (run via bun)
│   ├── mint.ts                 # Mint new product NFT
│   └── update.ts               # Update product metadata
├── contract/                   # Aiken smart contracts
│   ├── validators/
│   │   └── traceability.ak     # mint + store validators
│   ├── lib/contract/
│   │   └── types.ak            # Mint (Create|Burn) and Store (Update|Remove) types
│   ├── scripts/
│   │   ├── mesh.ts             # MeshAdapter — script initialization + wallet utilities
│   │   ├── offchain.ts         # Contract class — mint, update, burn operations
│   │   └── index.ts            # CLI entry point with formatted output
│   ├── plutus.json             # Compiled contract blueprint
│   └── aiken.toml              # Aiken project config (Plutus v3)
├── providers/
│   ├── cardano.tsx             # BlockfrostProvider instance
│   └── query.tsx               # TanStack QueryClientProvider
├── lib/
│   └── utils.ts                # cn(), deserializeDatum(), convertToKeyValue(), axios instance
├── components/ui/
│   └── button.tsx              # shadcn/ui Button component
├── tests/
│   └── mesh.test.ts            # Jest tests for mint, update, burn, getProduct, getTracking
├── package.json                # Dependencies + scripts
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
└── .env.example                # Required env vars
```

## Prerequisites

- **Bun** (package manager + runtime)
- **Node.js** 20+
- **Aiken** v1.1.21+ (for smart contract compilation)
- **Blockfrost API key** (preprod testnet) — [blockfrost.io](https://blockfrost.io)
- **Cardano wallet mnemonic** with test ADA — [Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)

## Quick Start

### 1. Install Dependencies

```bash
cd iot5-qr-code-traceability
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
BLOCKFROST_API_KEY="preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
MNEMONIC="your 24-word mnemonic phrase here"
```

### 3. Build Smart Contracts (optional — `plutus.json` is pre-compiled)

```bash
bun run contract:build    # cd contract && aiken build
bun run contract:test     # cd contract && aiken check
bun run contract:fmt      # cd contract && aiken fmt
```

### 4. Run Web Application

```bash
bun run dev               # Next.js dev server with Turbopack
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Mint a Product (CLI)

```bash
bun run mint              # Mint a new CIP-68 product NFT
```

This mints a reference token (100) at the contract address and a user token (222) to your wallet. Metadata includes name, brand, model, material, battery, location, roadmap, etc.

### 6. Update Product Metadata (CLI)

```bash
bun run update            # Update product location/metadata on-chain
```

Updates the inline datum at the contract address — e.g. changing `location` from "Viet Nam" to "Russia" to track supply chain movement.

## Web Pages

### Home (`/`)
Landing page with two main actions:
- **Create QR Code** — Navigate to `/create`
- **Scan QR Code** — Navigate to `/scan`

### Create QR (`/create`)
1. Enter issuer wallet address(es) (comma-separated or one per line)
2. Enter product name (must match the minted asset name)
3. Click "Generate QR Code"
4. The system fetches the CIP-68 reference token UTXO → generates a QR code linking to `/product/{policyId+assetName}`
5. Download QR image or navigate directly to the product page

### Scan QR (`/scan`)
- Opens device camera via `@yudiel/react-qr-scanner`
- Scans QR code → auto-redirects to `/product/{id}` if it's a valid product URL
- Shows scanned text for non-product QR codes

### Product Detail (`/product/[id]`)
- **Supply Chain Timeline** — Visual milestones based on the product's `roadmap` metadata field
- **Current Milestone** — Location, timestamp, action type, blockchain transaction link
- **Transfer History** — All transactions for this asset, chronologically sorted
- **Product Details** — Brand, model, material, battery, description from CIP-68 datum

## How It Works

### Product Creation Flow
1. Operator runs `bun run mint` with product metadata
2. `Contract.mint()` builds a Plutus v3 transaction:
   - Mints reference token (CIP68_100) → sent to contract address with inline datum
   - Mints user token (CIP68_222) → sent to wallet
3. Transaction signed, submitted, confirmed on Cardano preprod
4. QR code generated from `/create` page links to the product's on-chain record

### Tracking & Verification Flow
1. User scans QR code → redirected to `/product/{policyId+assetName}`
2. `getProduct()` fetches the UTXO at the contract address → deserializes CBOR datum
3. `getTracking()` fetches all transactions for this asset unit via Blockfrost API
4. Each transaction classified as Mint/Burn/Transfer/Update based on input/output quantities
5. Timeline rendered with milestones from the `roadmap` metadata field

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `bun run dev` | Start Next.js dev server (Turbopack) |
| `build` | `bun run build` | Build for production |
| `start` | `bun run start` | Start production server |
| `lint` | `bun run lint` | Run ESLint |
| `mint` | `bun run mint` | Mint new product NFT (CIP-68) |
| `update` | `bun run update` | Update product metadata on-chain |
| `contract:build` | `bun run contract:build` | Compile Aiken contracts |
| `contract:test` | `bun run contract:test` | Run Aiken tests |
| `contract:fmt` | `bun run contract:fmt` | Format Aiken code |

## Security Notes

- Multi-owner authorization: Any address in the `owners` list can sign transactions
- CIP-68 reference tokens locked at contract address (not freely transferable)
- All metadata updates require on-chain owner signature validation
- Server-side Blockfrost API key (not exposed to client via Server Actions)
- Mnemonic stored in `.env`, never committed to git
- QR codes contain only public asset identifiers (no sensitive data)

## License

MIT
