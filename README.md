## Trace.Lab3 – On-chain Product Traceability

<details open>
<summary><strong>English</strong></summary>

### English overview

#### Description
- **Goal**: build a shipment/lot traceability platform based on CIP‑68 NFTs, allowing businesses to digitize products, track their lifecycle on Cardano, and manage an “NFT warehouse” according to user roles.

#### Roles

| Role              | Main tasks                                                                 |
|-------------------|---------------------------------------------------------------------------|
| Admin             | Manage tenants/organizations, user accounts, roles, high‑level settings. |
| Product manager   | Create/update product lots, attach metadata, trigger mint/update/burn.   |
| Warehouse operator| Scan lots in/out, confirm hops in the roadmap, manage on‑chain status.   |
| Viewer/auditor    | View traceability history and verify lot authenticity.                   |

#### Backend & Frontend

| Layer    | Language & framework                   |
|---------|-----------------------------------------|
| Backend | TypeScript, NestJS on Express           |
| Frontend| Next.js (App Router), React, TypeScript |


#### Smart contract
- **Encoding lots as CIP‑68 NFTs**:
  - Each product lot is represented by a **CIP‑68 NFT** on Cardano, with:
    - A **representative NFT token** for the lot (user‑facing asset).
    - A **datum / reference NFT** carrying the data payload (expiry, current holder, roadmap, etc.).
  - This mechanism enables:
    - **Uniqueness** (unique asset name per lot).
    - **Traceability** via changes to holder/address state and related metadata.

- **Managing the mint – update – burn lifecycle on CIP‑68**:
  - **Mint**: the contract receives parameters (policy, assetName, CIP‑68 metadata) to issue the NFT corresponding to the product lot.
  - **Update**: instead of burning and recreating the NFT, CIP‑68 allows updating **datum / on‑chain metadata** while preserving the trace history:
    - Update `propertiesJson` (expiry, current_holder_id, coordinates, receiver list, `Traceability-v1` standard, …).
    - Update the roadmap (sequence of shipping hops) without breaking the link to the original lot.
  - **Burn**: the contract enforces conditions for burning the NFT (policy, time, valid owner), reflecting the end of the lot’s lifecycle.

- **Multisig policy on Cardano (core technology protecting lot operations)**:
  - The policy script can be configured as **multisig**:
    - Combine multiple keys: e.g. a **script key** (controlled by the system) + the enterprise’s **stake key**.
    - Only when the required key set signs together will mint/update/burn transactions be valid.
  - This helps:
    - Reduce the risk of unilateral operations (no single party can arbitrarily mint/burn).
    - Align with multi‑party control/logistics models in research (multi‑party control).
  - In practice:
    - The backend builds transactions according to the multisig policy (requiring multiple witnesses).
    - The frontend/wallet is responsible for collecting signatures (witnesses) from corresponding users, then submitting to the Cardano network.

</details>

<details>
<summary><strong>Tiếng Việt</strong></summary>

### Mô tả
- **Mục tiêu**: xây dựng nền tảng truy xuất nguồn gốc lô hàng dựa trên NFT CIP‑68, cho phép doanh nghiệp số hóa sản phẩm, theo dõi vòng đời trên Cardano và quản lý “kho NFT” theo vai trò người dùng.

### Vai trò

| Vai trò              | Nhiệm vụ chính                                                           |
|----------------------|-------------------------------------------------------------------------|
| Admin                | Quản lý tổ chức/tenant, tài khoản người dùng, phân quyền, cấu hình hệ thống. |
| Product manager      | Tạo/cập nhật lô sản phẩm, gắn metadata, thao tác mint/update/burn NFT. |
| Warehouse operator   | Quét nhập/xuất lô, xác nhận các bước (hop) trong roadmap, cập nhật trạng thái on‑chain. |
| Viewer/Auditor       | Xem lịch sử truy xuất, kiểm tra tính xác thực của từng lô hàng.        |

### Backend & Frontend

| Lớp     | Ngôn ngữ & framework                    |
|---------|-----------------------------------------|
| Backend | TypeScript, NestJS trên Express         |
| Frontend| Next.js (App Router), React, TypeScript |

### Smart contract
- **Mã hóa lô hàng thành NFT CIP‑68**:
  - Mỗi lô sản phẩm được biểu diễn bằng một **CIP‑68 NFT** trên Cardano, với:
    - **Token NFT đại diện** cho lô hàng (user-facing asset).
    - **Datum / reference NFT** mang payload dữ liệu (expiry, current holder, roadmap, v.v.).
  - Cơ chế này cho phép:
    - **Tính duy nhất** (unique asset name theo lô).
    - **Tính truy vết** thông qua thay đổi trạng thái holder/address và metadata liên quan.

### Quản lý vòng đời mint – update – burn trên CIP‑68
- **Mint**: hợp đồng nhận các tham số (policy, assetName, metadata CIP‑68) để phát hành NFT tương ứng với lô sản phẩm.
- **Update**: thay vì đốt và tạo lại NFT, CIP‑68 cho phép cập nhật **datum / metadata on-chain**, duy trì lịch sử truy vết:
  - Cập nhật `propertiesJson` (expiry, current_holder_id, tọa độ, receiver list, tiêu chuẩn `Traceability-v1`, …).
  - Cập nhật roadmap (chuỗi hop vận chuyển) mà không phá vỡ liên kết tới lô gốc.
- **Burn**: hợp đồng áp đặt điều kiện hủy NFT (policy, thời điểm, chủ sở hữu hợp lệ), phản ánh kết thúc vòng đời lô hàng.

### Multisig policy trên Cardano (công nghệ lõi bảo vệ thao tác lô hàng)
- Policy script có thể được cấu hình dạng **multisig**:
  - Kết hợp nhiều khóa: ví dụ **script key** (do hệ thống kiểm soát) + **stake key** của doanh nghiệp.
  - Chỉ khi tập khóa yêu cầu cùng ký, giao dịch mint/update/burn mới hợp lệ.
- Điều này giúp:
  - Giảm rủi ro thao tác đơn lẻ (một bên không tự ý mint/burn).
  - Bám sát mô hình kiểm soát nội bộ/logistics đa bên trong nghiên cứu NCKH (multi‑party control).
- Về mặt thực thi:
  - Backend build transaction theo policy multisig (yêu cầu nhiều witness).
  - Frontend/ví chịu trách nhiệm thu thập chữ ký (witness) từ người dùng tương ứng, sau đó submit lên mạng Cardano.

</details>
