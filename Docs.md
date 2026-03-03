Short project description
Trace.Lab3 is an on-chain product traceability platform built on Cardano using CIP‑68 NFTs. It lets businesses encode product lots as NFTs, manage mint/update/burn lifecycles, and track shipments via an “NFT warehouse” with role-based access through a NestJS backend and a Next.js admin/landing frontend.
Main folders and what they contain
e:\trace\backend
Purpose: NestJS backend + Cardano smart-contract integration and tests.
Key contents:
package.json: NestJS app plus Aiken contract tooling and Prisma.
src/main.ts: Express-based Nest bootstrap with global exception filter and CORS; entrypoint for the API server.
src/app.module.ts (implied, referenced by main.ts): root Nest module wiring all feature modules.
src/core/cardano/**: Cardano integration layer (CIP‑68 contract wrapper cip68.contract.ts, mint-script.ts, mesh.adapter.ts, blockfrost.fetcher.ts, cardano.module.ts, cardano.service.ts).
src/auth/**: Authentication module with JWT/nonce flow (auth.controller.ts, auth.service.ts, DTOs, auth.repository.ts, in-memory-nonce.store.ts, prisma-auth.repository.ts, use-cases like verify-and-issue-token, create-profile-and-issue-token).
src/profile/**: Profile management (profile.controller.ts, profile.service.ts, domain ports for ProfileRepositoryPort and AvatarStoragePort, Prisma and upload adapters, application use-cases). Detailed architecture is documented in backend/docs/profile.md.
src/product/**: Product/lots domain (DTOs, product.controller.ts, product.service.ts, product.repository.ts, Prisma adapter, use-cases like list-batches, list-roadmap, record-product-tx).
src/warehouse/**: NFT warehouse domain (module, controller, service, repository ports + Prisma implementation, use-cases such as add-to-warehouse, list-my-inventory, mark-shipped, remove-item, get-recipient-by-roadmap).
src/order/**: Order/roadmap management (module, controller, service, repository, DTOs; use-cases for record-order, confirm-order-complete, list-orders-for-profile).
src/certificate/**: Certificates for lots (module, controller, service, repository, DTOs; use-cases create-certificate, list-certificates, get-certificate-by-id).
src/ipfs/**: IPFS client abstraction (ipfs-client.port.ts, Pinata-based adapter pinata-ipfs.client.ts, service and use-cases like upload-file, get-gateway-url).
src/upload/**: Generic upload module using Cloudinary or similar (upload.service.ts, upload.controller.ts, image-storage.port.ts, module).
src/health/**: Health check module (/health endpoints).
src/shared/**: Shared utilities and types.
src/prisma/**: PrismaModule and PrismaService used across repositories.
validators/*.ak, lib/contract/*.ak, aiken.lock: Aiken smart-contract sources/config for CIP‑68 and multisig validators.
prisma/schema.prisma, prisma/seed.ts, prisma/Readme.md: database schema, seeding, and Prisma-related docs.
dist/**: Compiled JS output of the Nest app.
e:\trace\frontend
Purpose: Next.js (App Router) frontend for public traceability views and an admin dashboard.
Key contents:
package.json: Next.js + React + Tailwind, plus Cardano libraries (@emurgo/cardano-serialization-lib-browser, @meshsdk/core), mapping (leaflet), QR/code/PDF (qrcode, jspdf).
app/layout.tsx, app/page.tsx: root layout and marketing/landing page.
app/trace/page.tsx, app/trace/[id]/page.tsx: traceability views for lots (landing search + per-lot detail).
app/admin/**: admin area using App Router with nested routes:
(authenticated)/dashboard, products, warehouse, order, certificate, account, page.tsx etc.: main authenticated admin screens.
login/page.tsx: login/auth entry.
components/**: UI components for products, warehouse, orders, certificates, accounts, layout, role selection, pagination, maps, dialogs.
lib/**: client-side API wrappers for auth, account, profiles, product, warehouse, order, certificate, ipfs, upload, jwt.
utils/**: helpers for pagination, dates, coordinates, encoding (e.g., asset IDs), wallet integration, string/array helpers.
context/**: admin-side context/hooks like useWalletAuth.
styles/**: CSS modules for admin UI.
components/**: shared landing-page components (Hero, Network, Trace, About, CoreValues, etc.), Header, Footer, RouteMap, globe.tsx.
constants/**: static content/config for hero, about, support, menu, footer, core values.
context/LanguageProvider.tsx: language selection for landing.
utils/**: network endpoints, route-map helpers, generic utils.
types/**: shared TypeScript types for trace data, maps, QR, etc.
public/**: static images/assets used across landing and admin.
next.config.mjs, tailwind.config.ts, postcss.config.js, styles/globals.css, styles/landing.css, styles/globe.override.css: app configuration and global styling.
e:\trace root
README.md: bilingual (English/Vietnamese) project overview, including roles, stack, high-level smart contract design (CIP‑68, mint/update/burn lifecycle, multisig).
(Likely) repo-level config files such as .gitignore, etc. (not fully enumerated here).
Main technologies and frameworks
Languages:
TypeScript for both backend and frontend.
Aiken for on-chain Cardano smart contracts (CIP‑68, multisig scripts, .ak validator files).
Backend stack (from backend/package.json and src/main.ts):
NestJS 10 on Express (@nestjs/common, @nestjs/core, @nestjs/platform-express).
Prisma 7 as ORM (@prisma/client, @prisma/adapter-pg, @prisma/adapter-neon, PrismaService).
PostgreSQL (pg) as primary database.
Cardano SDKs: @emurgo/cardano-serialization-lib-nodejs, @meshsdk/core for building Cardano transactions and CIP‑68 interactions.
Validation/serialization: class-validator, class-transformer.
Infra integrations: axios, dotenv, cloudinary (uploads), pinata (IPFS), form-data, bech32, cbor, jsonwebtoken, lodash, rxjs, reflect-metadata.
Testing: Jest + ts-jest, @jest/globals.
Frontend stack (from frontend/package.json and frontend structure):
Next.js (App Router) with React and TypeScript.
Styling: Tailwind CSS + custom CSS modules and global styles.
Cardano client: @emurgo/cardano-serialization-lib-browser, @meshsdk/core for wallet and transaction building in the browser.
UX libraries: leaflet for maps/location, qrcode for QR generation, jspdf for PDF export (likely certificates or trace reports).
Smart-contract / blockchain layer:
Aiken-based contracts and validators for CIP‑68 lots (validators/*.ak, lib/contract/utils.ak, aiken.lock, build:contracts, aiken docs).
CIP‑68 NFT pattern, multisig policies as described in README.md and implemented via core/cardano/**.
High-level end-to-end structure and data flow
Overall architecture:
A NestJS backend exposes REST APIs (controllers for auth, profile, product, warehouse, order, certificate, ipfs, upload, trace, health).
The backend is structured in clean architecture / hexagonal style:
Controllers as thin HTTP layer.
Services as façades providing module-level APIs.
Application use-cases per operation (e.g. create-profile-and-issue-token, trace-asset, add-to-warehouse, record-order, list-certificates).
Domain ports (repository and storage interfaces) that are implemented in infra adapters using Prisma, Cloudinary, Pinata, Cardano libs.
A Next.js frontend consumes these APIs:
Public landing and trace views for anyone to look up and verify lot history.
Admin interface for authenticated roles (Admin, Product manager, Warehouse operator, Viewer/Auditor) to manage products, lots, certificates, warehouse inventory, and orders.
Cardano/Aiken layer is encapsulated:
Backend builds TXs using the CIP‑68 contract wrapper and @meshsdk/core/serialization libs, enforces mint/update/burn rules and multisig policies.
Frontend/wallet handles collecting actual user signatures and submitting TXs, as described in the root README.
Typical flow for a product lot (inferred from module names and README):
Admin/Product manager uses the frontend admin (/admin/(authenticated)/products) to create or update a lot and trigger mint/update/burn actions.
UI calls product/order/certificate/warehouse APIs on the backend:
Backend auth module issues JWTs based on wallet signatures (via nonce + verify-and-issue-token use-case).
Product/order use-cases coordinate with core/cardano and Aiken scripts to build transactions for minting or updating CIP‑68 NFTs representing lots.
Warehouse module tracks on/off-chain state transitions (e.g., scanning in/out, confirming roadmap hops).
IPFS/upload modules handle off-chain file uploads via Pinata/Cloudinary (e.g., certificates, images), and store URLs in DB / NFT metadata.
Certificate module issues and fetches certificates linked to lots.
Traceability:
Backend trace module and related Cardano utilities assemble end-to-end trace history combining:
On-chain transactions/events (via CIP‑68 datum updates and policies).
Off-chain metadata from DB (warehouse movements, certificates, profiles).
Frontend app/trace/[id]/page.tsx and associated components render the route map, timeline, location map, and verification info for a lot.
Authentication and profiles:
Wallet-based auth (using Cardano serialization libs and meshsdk) is coordinated by the frontend admin auth flows and auth backend module (nonce generation, signature verification, JWT issuing).
Profiles (documented in backend/docs/profile.md) connect wallets to roles and additional metadata (display name, location, coordinates, avatar), and the JWT payload carries profile info; backend services often verify JWT and then delegate to use-cases.
Unusual / important aspects for a newcomer
Hexagonal/Clean architecture:
Every business module (auth, profile, product, warehouse, order, certificate) is structured as controller → service façade → use-cases → domain ports → infra adapters (Prisma, storage, etc.).
This is documented for ProfileModule in detail in backend/docs/profile.md and is likely the reference style for other modules.
Cardano + CIP‑68 integration:
Custom smart contracts are written in Aiken, not just using off-the-shelf Mesh SDK templates; see validators/*.ak, lib/contract/utils.ak, core/cardano/cip68/*.ts.
The backend builds multisig transactions and expects the frontend/wallet to provide witnesses; this affects how you design both backend endpoints and frontend wallet flows.
Multi-role admin app:
The frontend admin area is role-aware (Admin, Product manager, Warehouse operator, Viewer/Auditor), so many backend endpoints assume specific roles/permissions encoded in the JWT/profile.
Infra dependencies:
The project uses Prisma with Postgres and potentially Neon or standard PG adapters; DB setup and migrations are orchestrated via prisma CLI (see backend/prisma/schema.prisma, backend/prisma/Readme.md).
File storage and IPFS uploads are abstracted behind ports; local dev will require valid Cloudinary/Pinata and Cardano network credentials and environment variables (see .env referenced by dotenv/config in main.ts).
Important docs and pointers within the repo
Root project overview:
e:\trace\README.md – main bilingual description of the project, roles, stack, and Cardano/CIP‑68 design (including mint/update/burn lifecycle and multisig policy).
Backend profile architecture:
e:\trace\backend\docs\profile.md – detailed Clean Architecture write-up for the ProfileModule, including controller endpoints, service, use-cases, domain ports, adapters, and request flows. This is a good template for understanding/writing other modules.
Database / Prisma:
e:\trace\backend\prisma\schema.prisma – full DB schema (tables for profiles, products, lots, warehouse entries, orders, certificates, etc.).
e:\trace\backend\prisma\Readme.md – Prisma-specific notes (setup, migration, seeding).
Cardano contracts and integration (by code, not prose docs):
e:\trace\backend\src\core\cardano\cip68\cip68.contract.ts – TS interface to the CIP‑68 contract.
e:\trace\backend\validators\*.ak and e:\trace\backend\lib\contract\utils.ak – Aiken on-chain code and helpers.
e:\trace\backend\src\core\cardano\blockfrost.fetcher.ts, cardano.service.ts, mint-script.ts – network interaction and script building.
Frontend admin/trace flows:
e:\trace\frontend\app\trace\page.tsx and e:\trace\frontend\app\trace\[id]\page.tsx – user-facing trace UI.
e:\trace\frontend\app\admin/** – full structure of the admin dashboard, libraries and utilities for interacting with the backend and Cardano wallets.