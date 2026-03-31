# Supply Logistics — Tổng quan kiến trúc Backend & Frontend (Traceability CIP-68)

Tài liệu này mô tả nhanh cách **backend** (NestJS + Prisma) và **frontend** (Next.js) của repo `supply-logistics` phối hợp để xây hệ thống **truy xuất nguồn gốc (traceability)** trên **Cardano**, kết hợp dữ liệu **off-chain** (PostgreSQL) và **on-chain** (NFT **CIP-68**, giao dịch qua Blockfrost/Mesh).

Trọng tâm bài toán hiện tại:

- 3 entity chính: **GrowingArea → Plan → Product**.
- Mọi entity dùng **`inventoryKey` (unit CIP-68)** làm khoá định danh/liên kết.
- Media được quản lý tập trung qua `Media` + `EntityMedia` (gắn theo `role`), không lưu `*Ipfs` trực tiếp trong 3 entity.
- Lịch sử xác minh giao dịch được lưu trong `RecordOperation` theo `entityType/entityKey` (và có FK optional về 3 entity để ERD rõ ràng).

---

## Bức tranh tổng thể

| Thành phần | Vai trò |
|------------|---------|
| **Frontend (Next.js)** | Giao diện web, ví Cardano (Eternl), gọi API backend, một số CLI/script tương tác contract |
| **Backend (NestJS)** | Xác thực ví (nonce + chữ ký), JWT + cookie, CRUD off-chain (GrowingArea/Plan/Product/Warehouse), dựng giao dịch (Mesh), verify tx qua Blockfrost |
| **PostgreSQL (Prisma)** | Lưu profile/role, entity off-chain, log giao dịch (`RecordOperation`), media (`Media`/`EntityMedia`), kho (`Warehouse`) |
| **Cardano / Blockfrost** | Nguồn sự thật on-chain: mint/update/burn, tra cứu lịch sử giao dịch theo **`inventoryKey` (unit)** |

---

## Backend (`backend/`)

### Công nghệ

- **NestJS** (HTTP API, module hóa).
- **Prisma** + **PostgreSQL** (`DATABASE_URL`).
- **JWT** (`JWT_SECRET`, hết hạn ~7 ngày), cookie `auth_token` httpOnly khi verify chữ ký.
- **Passport JWT** (`JwtStrategy`, `JwtAuthGuard`).
- **Mesh SDK** + **Blockfrost** (`BLOCKFROST_API_KEY`): dựng giao dịch mint/update/transfer/burn, submit.
- **Cardano Serialization Lib** + **cbor**: xử lý địa chỉ / datum (deserialize) trong các service/helpers.

### Khởi động & cấu hình

- Cổng mặc định: `PORT` hoặc **3001**.
- CORS: `FRONTEND_URL` (mặc định `http://localhost:3000`), `credentials: true`.
- Validation toàn cục: `ValidationPipe` (whitelist, forbid non-whitelisted).

### Module chính (theo `app.module.ts`)

| Module | Chức năng |
|--------|-----------|
| **Auth** | `POST /auth/nonce`, `POST /auth/verify` (set cookie), `POST /auth/logout`, `GET /auth/me` (JWT) — đăng nhập bằng ví Cardano |
| **Profile** | Tạo/cập nhật profile theo ví, gán role (ví dụ `ENTERPRISE`, `AGENT`), liệt kê profile |
| **GrowingArea** | `GET /growing-areas`, `POST /growing-areas` (JWT) — quản lý GrowingArea off-chain theo `inventoryKey` |
| **GrowingAreaContract** | `GET /growing-areas/contract/info`, `POST /growing-areas/contract/create`, `POST /growing-areas/contract/delete` (JWT) — dựng unsigned tx |
| **GrowingAreaRetire** | `POST /growing-areas/:inventoryKey/retire` (JWT) — ghi `RecordOperation` retire chờ verify |
| **Plan** | `GET /plans`, `POST /plans`, `PATCH /plans/:inventoryKey`, `POST /plans/:inventoryKey/harvest`, `POST /plans/:inventoryKey/packaging` (JWT) |
| **PlanContract** | `GET /plans/contract/info`, `POST /plans/contract/create`, `POST /plans/contract/save`, `POST /plans/contract/delete` (JWT) |
| **PlanRetire** | `POST /plans/:inventoryKey/retire` (JWT) |
| **Product** | `POST /products`, `PATCH /products/:inventoryKey`, `POST /products/clear-warehouse`… (JWT) — quản lý Product/checkpoint |
| **ProductContract** | `GET /products/contract/info`, `POST /products/contract/create`, `POST /products/contract/save`, `POST /products/contract/delete` (JWT) |
| **ProductRetire** | `POST /products/:inventoryKey/retire` (JWT) |
| **RecordOperation** | `GET /record-operations?entityType=&entityKey=` (JWT) |
| **Media** | `POST /media/upload` (JWT) — upload Pinata + upsert `Media` |
| **Trace** | `GET /trace/:inventoryKey` — truy vết công khai theo unit |
| **Warehouse** | CRUD kho theo ví chủ — **JWT** |
| **Health** | Endpoint kiểm tra sức khỏe dịch vụ |

### Luồng xác thực (rút gọn)

1. Client lấy **nonce** với địa chỉ stake/payment đã chuẩn hóa.
2. Ví ký nonce; client gửi **verify** với `signature` + `key`.
3. Backend kiểm tra nonce (đang lưu tạm trong bộ nhớ process), phát JWT và set cookie `auth_token`. (Frontend giải mã JWT để biết `role` và `profileId`.)

### Dữ liệu (Prisma) — ý chính

- **CustodianAccount** / **Profile**: một ví (address) có thể có nhiều profile theo `roleCode`.
- **GrowingArea**: vùng trồng, khóa nghiệp vụ là `inventoryKey` (unit CIP-68).
- **Plan**: kế hoạch, khóa nghiệp vụ là `inventoryKey`, FK tới GrowingArea bằng `growingAreaInventoryKey`, có `growingAreaSnapshot`.
- **Product**: lô/lot, khóa nghiệp vụ là `inventoryKey`, FK tới Plan bằng `planInventoryKey`, có `status` và có thể gắn `warehouseId`.
- **RecordOperation**: log giao dịch theo `entityType/entityKey` với `txHash`, `opType`, `verified/verifiedAt` (có FK optional về 3 entity để ERD rõ ràng).
- **Media** + **EntityMedia**: `Media.ipfsUri` unique; `EntityMedia` gắn media vào entity theo `(entityType, entityKey, role)` (unique).
- **Warehouse**: kho theo `siteCustodianAddress` và `code`, giới hạn `maxProducts`.

### Contract service (backend)

- Các endpoint contract hiện được tách theo entity:
  - `POST /growing-areas/contract/create|delete`
  - `POST /plans/contract/create|save|delete`
  - `POST /products/contract/create|save|delete`
- Các endpoint này trả về **unsigned tx** để client ký/submit. Backend kiểm tra input và dựng tx dựa trên danh sách `owners`.

---

## Frontend (`frontend/`)

### Công nghệ

- **Next.js** (App Router), **React 19**, **Tailwind CSS 4**.
- **TanStack React Query** (`providers/query.tsx`).
- **Mesh SDK** (`@meshsdk/*`), **Blockfrost**: ví, build/sign tx phía client khi cần.
- Gọi backend bằng `fetch`; **QR** (`@yudiel/react-qr-scanner`, `qrcode`) cho quét/mã sản phẩm.

### Bố cục route (App Router)

- **`/`** (`app/(home)/`): landing (Hero, Feature, v.v.) — có `Header` / `Footer` qua `AppShell`.
- **`/dashboard/*`**: legacy URL — middleware redirect sang workspace theo role.
- **`/enterprise/*`**: workspace doanh nghiệp (UI nằm trong `/enterprise/pages/*`).
- **`/agent/*`**: workspace agent (UI nằm trong `/agent/pages/*`).
- **`/transit/*`**: workspace transit (UI nằm trong `/transit/pages/*`).
- **`/enterprise/pages/product-tools/*`**: enterprise-only tools (areas/plans/products).
- **`/product/[id]`**, **`/scan`**, **`/create`**, **`/role-setup`**: luồng công khai / quét / tạo / thiết lập role.

### `middleware.ts`

- Redirect legacy URLs (dashboard, asset-tools, các nhánh cũ).
- Bọc auth cho `/agent`, `/transit`, `/enterprise`: không có `auth_token` hoặc chưa có `profileId` → về `/` hoặc `/role-setup`.
- `ENTERPRISE` chỉ được vào `product-tools` và được mirror từ `/agent`/`/transit` sang `/enterprise/pages/*` khi cần.

Ghi chú: `/dashboard/*` là legacy và luôn bị redirect về workspace theo role (`/enterprise` | `/agent` | `/transit`).

### Xác thực ví

- `hooks/useWalletAuth.ts`: ưu tiên **Eternl** (`window.cardano.eternl`), lấy change address, gọi backend `auth/nonce` + `auth/verify` với `credentials: 'include'`.
- `lib/wallet.ts`: tiện ích Bech32, Mesh wallet, v.v. phục vụ ký và địa chỉ.

### Tích hợp backend

- Biến môi trường: `NEXT_PUBLIC_BACKEND_URL` (mặc định thường `http://localhost:3001`).
- Cookie `auth_token` dùng cho các request có `credentials: 'include'`.

### Smart contract (Aiken) — `frontend/contract/`

- Mã nguồn validator (ví dụ `validators/traceability.ak`), build bằng **Aiken**; artifact Plutus trong `plutus.json` / `build/`.
- Thư mục `contract/scripts/`: **offchain** TypeScript (Mesh) — mint/update tương tự backend, phục vụ CLI (`npm run mint`, `update`, `get-product`) và thử nghiệm.

---

## Luồng nghiệp vụ điển hình

1. **Đăng nhập**: Frontend → nonce → ký → verify → JWT trong cookie.
2. **Chọn / tạo profile** (role): backend lưu `Profile`, token mang `role` để phân quyền.
3. **Tạo GrowingArea/Plan/Product**: UI tạo unsigned tx qua `*/contract/*`, ví ký/submit, sau đó gọi API `POST /growing-areas`, `POST /plans`, `POST /products` để lưu DB theo `inventoryKey`.
4. **Harvest/Packaging/Dispatch/Checkin/Consume/Retire**: ghi `RecordOperation` với `txHash` chờ verify; backend cron verify tx và cập nhật trạng thái entity.
5. **Truy vết công khai**: `GET /trace/:inventoryKey` lấy lịch sử theo unit.
6. **Media**: upload `POST /media/upload` → nhận `ipfsUri` → attach vào entity bằng `EntityMedia.role` (certificate/invoice/images…).

---

## Biến môi trường (tham khảo)

| Biến | Nơi dùng |
|------|-----------|
| `DATABASE_URL` | Backend — PostgreSQL |
| `JWT_SECRET` | Backend — ký JWT |
| `BLOCKFROST_API_KEY` | Backend (và logic tương tự frontend nếu cấu hình) |
| `APP_NETWORK` | Backend — `mainnet` vs mạng khác (auth Blockfrost network) |
| `FRONTEND_URL`, `PORT`, `COOKIE_*` | Backend — CORS & cookie |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend — base URL API |

---

## Ghi chú

- **Network Blockfrost** phụ thuộc `APP_NETWORK` (mainnet/preview/preprod) trong backend.

---

*Tài liệu được sinh từ việc đọc mã nguồn trong repo; nếu bạn thêm route hoặc đổi env, nên cập nhật các bảng và luồng tương ứng.*
