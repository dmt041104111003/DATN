## Trace.Lab3 – On-chain Product Traceability

### Demo
[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

---

<details open>
<summary><strong>English</strong></summary>

### English overview

#### What this project is
- **Trace.Lab3** is an **on-chain shipment / lot traceability platform** on Cardano.
- Each product lot is modeled as a **CIP‑68 NFT** whose **metadata is updated on-chain** as the lot moves through the supply chain.
- The system combines:
  - A **web frontend** for operators (scan, create, track lots),
  - A **NestJS backend** for enterprise logic and user/tenant management,
  - **Aiken smart contracts** enforcing mint / update / burn rules and multi‑party control.

#### Business roles

| **Role**           | **Main responsibilities**                                                  |
|--------------------|---------------------------------------------------------------------------|
| **Admin**          | Manage tenants/organizations, user accounts, roles, global configuration.|
| **Product manager**| Define product lots, attach metadata, trigger on‑chain mint/update/burn. |
| **Warehouse op.**  | Scan lots in/out, confirm roadmap hops, keep on‑chain state in sync.     |
| **Viewer / auditor** | View traceability history, verify authenticity of any lot.             |

#### High‑level architecture

- **Frontend (Next.js App Router, React, TypeScript)**
  - Web UI for:
    - Creating product lots and QR codes.
    - Scanning QR codes to open the lot detail page.
    - Viewing full traceability history and roadmap.
  - Uses **Mesh SDK** + **Blockfrost** to read blockchain data and build transactions where needed.

- **Backend (NestJS on Express, TypeScript)**
  - Multi‑tenant / organization management.
  - Users, roles, authentication/authorization (JWT + Passport).
  - Orchestration of transaction building based on **Cardano multisig policy**.
  - Integration with Blockfrost / Cardano libs to:
    - Query UTXOs and CIP‑68 metadata.
    - Prepare mint / update / burn transactions for the frontend wallet to sign.

- **Smart contracts (Aiken, Plutus v3)**
  - **CIP‑68 pattern** with:
    - A **reference NFT** (CIP68\_100) locked at the contract address, holding lot metadata in the datum.
    - A **user‑facing NFT** (CIP68\_222) held in the owner’s wallet as proof of ownership.
  - Two main validators (typical design):
    - **Mint validator**: controls creation and burn of lot NFTs under a **multi‑owner policy**.
    - **Store / update validator**: controls metadata updates (roadmap, location, status, expiry, etc.).

#### CIP‑68 lot model

- Each **lot** is identified by a **unique asset name** under a specific policy.
- The **reference NFT datum** holds:
  - Core product info (brand, model, description, material, etc.).
  - **Traceability payload**:
    - `expiry`, `current_holder_id`, GPS coordinates,
    - `receiver_list`,
    - a `Traceability-v1` standard marker,
    - **roadmap**: list of shipping / logistics hops.
- **Updating a lot**:
  - Instead of burning and reminting, the contract updates the **datum / on‑chain metadata** while preserving history.
  - Every state change is written to the chain, so the full lifecycle is auditable.

#### Multisig policy & security

- The minting policy is designed to be **multi‑signature capable**:
  - Typically combines a **system “script key”** with the enterprise’s **stake key**.
  - A transaction is only valid when the **required key set** signs together.
- This enables:
  - **No unilateral control** by a single party over mint/burn/update.
  - Alignment with **multi‑party logistics and internal control** models.
- In practice:
  - The **backend** builds transactions according to the policy and required witnesses.
  - The **frontend / wallet** collects user signatures and submits to the Cardano network.


</details>

<details>
<summary><strong>Tiếng Việt</strong></summary>

### Tổng quan dự án

- **Trace.Lab3** là nền tảng **truy xuất nguồn gốc lô hàng on‑chain** trên Cardano.
- Mỗi **lô sản phẩm** được mã hóa thành **NFT CIP‑68**, metadata của NFT được **cập nhật trực tiếp trên blockchain** khi lô di chuyển trong chuỗi cung ứng.
- Hệ thống gồm:
  - **Frontend** (Next.js) cho người dùng thao tác, quét QR, xem lịch sử.
  - **Backend** (NestJS) cho logic doanh nghiệp, quản lý tenant/người dùng/quyền.
  - **Smart contract Aiken** bảo vệ quy tắc mint / update / burn và cơ chế đa chữ ký.

### Vai trò nghiệp vụ

| **Vai trò**            | **Nhiệm vụ chính**                                                      |
|------------------------|-------------------------------------------------------------------------|
| **Admin**              | Quản lý tổ chức/tenant, tài khoản, phân quyền, cấu hình toàn hệ thống.|
| **Product manager**    | Tạo/cập nhật lô, gắn metadata, thao tác mint/update/burn NFT.          |
| **Warehouse operator** | Quét nhập/xuất lô, xác nhận các bước (hop) trong roadmap, đồng bộ trạng thái on‑chain. |
| **Viewer / Auditor**   | Xem lịch sử truy xuất, kiểm tra tính xác thực của từng lô.            |

### Kiến trúc tổng quan

- **Frontend (Next.js App Router + React + TypeScript)**
  - Giao diện web:
    - Tạo lô hàng, tạo QR code.
    - Quét QR code để mở trang chi tiết lô.
    - Hiển thị timeline / roadmap di chuyển của lô.
  - Sử dụng **Mesh SDK** và **Blockfrost API** để đọc dữ liệu on‑chain và hỗ trợ build transaction.

- **Backend (NestJS trên Express, TypeScript)**
  - API cho:
    - Quản lý tenant, tổ chức, tài khoản, phân quyền (JWT, Passport).
    - Điều phối thao tác với Cardano: chuẩn bị transaction mint / update / burn theo policy.
  - Tích hợp **Blockfrost** và thư viện Cardano để:
    - Đọc UTXO, metadata CIP‑68.
    - Tạo transaction thô chuyển cho ví frontend ký.

- **Smart contract (Aiken, Plutus v3)**
  - Mô hình **CIP‑68** với:
    - **Reference NFT (CIP68\_100)** khóa tại địa chỉ hợp đồng, chứa metadata lô trong datum.
    - **User NFT (CIP68\_222)** nằm trong ví người dùng, đóng vai trò bằng chứng sở hữu.
  - Bộ validator điển hình:
    - **Mint validator**: kiểm soát tạo / hủy lot NFT theo chính sách nhiều chủ sở hữu.
    - **Store / update validator**: kiểm soát cập nhật metadata (roadmap, vị trí, trạng thái, hạn sử dụng, …).

### Mô hình CIP‑68 cho lô hàng

- Mỗi lô tương ứng với **asset name duy nhất** dưới một policy.
- **Datum của reference NFT** lưu:
  - Thông tin sản phẩm: thương hiệu, model, mô tả, vật liệu, v.v.
  - Payload truy xuất:
    - `expiry`, `current_holder_id`, toạ độ GPS,
    - `receiver_list`,
    - nhãn tiêu chuẩn `Traceability-v1`,
    - **roadmap**: danh sách các hop vận chuyển.
- **Khi cập nhật lô**:
  - Không cần đốt và mint lại NFT; contract cho phép **cập nhật datum / metadata on‑chain**.
  - Mỗi lần thay đổi đều ghi on‑chain nên lịch sử truy vết được bảo toàn.

### Multisig policy & an toàn hệ thống

- Policy script được thiết kế hỗ trợ **đa chữ ký (multisig)**:
  - Kết hợp **khóa script của hệ thống** và **stake key của doanh nghiệp** (hoặc các bên liên quan).
  - Giao dịch chỉ hợp lệ khi **tập khóa yêu cầu cùng ký**.
- Lợi ích:
  - Tránh việc một bên có thể tự ý mint/burn/update lô.
  - Phù hợp với mô hình kiểm soát nội bộ và logistics đa bên trong nghiên cứu.
- Thực thi:
  - **Backend** build transaction theo policy và khai báo các witness bắt buộc.
  - **Frontend / ví** thu thập chữ ký từ người dùng và submit lên mạng Cardano.



</details>
