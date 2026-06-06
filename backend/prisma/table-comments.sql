-- Chú thích bảng/cột — chạy trên PostgreSQL (Neon / DBeaver)
-- Cách dùng: mở file này → Execute Script (F5)
-- An toàn: chỉ COMMENT, không đổi dữ liệu hay schema

-- =============================================================================
-- BẢNG
-- =============================================================================

COMMENT ON TABLE "Role" IS
  'Danh mục vai trò tham gia chuỗi cung ứng: ENTERPRISE (sản xuất), TRANSIT (vận chuyển), AGENT (đại lý/kho bán).';

COMMENT ON TABLE "User" IS
  'Tài khoản đăng nhập bằng ví Cardano (stake address). Mỗi user có tối đa 1 kho (Warehouse). Liên kết Role qua roleCode.';

COMMENT ON TABLE "WalletNonce" IS
  'Nonce một lần dùng cho đăng nhập ví: POST /auth/nonce → ký → POST /auth/verify. Mỗi address một bản ghi nonce hiện hành.';

COMMENT ON TABLE "Production" IS
  'Vụ mùa / lô sản xuất nông sản. Khóa truy vết chính: inventoryKey (mint NFT Production trên Cardano). Thuộc user ENTERPRISE.';

COMMENT ON TABLE "ContainerBatch" IS
  'Đợt mint nhiều thùng cùng lúc. Theo dõi tiến độ completedBoxes / totalBoxes.';

COMMENT ON TABLE "Container" IS
  'Thùng hàng (đơn vị truy vết QR). Khóa: inventoryKey. Thuộc 1 Production; có thể thuộc ContainerBatch. Trạng thái CONSUMED = đã tiêu thụ.';

COMMENT ON TABLE "Warehouse" IS
  'Kho lưu trữ. Mỗi user (TRANSIT/AGENT) tối đa 1 kho — unique theo registeringCustodianAddress.';

COMMENT ON TABLE "WarehouseStorage" IS
  'Thùng đang nằm trong kho nào. Quan hệ N:1 Container ↔ Warehouse. Điều kiện bảo quản lưu ở conditions.';

COMMENT ON TABLE "RecordOperation" IS
  'Nhật ký giao dịch on-chain (txHash). Gắn Production hoặc Container qua inventoryKey. verified = đã xác minh trên blockchain.';

COMMENT ON TABLE "Image" IS
  'Ảnh minh chứng vụ mùa, lưu IPFS. Gắn Production qua productionInventoryKey.';

-- =============================================================================
-- ENUM (nếu đã tồn tại trên DB)
-- =============================================================================

COMMENT ON TYPE "ProductionStage" IS 'Trạng thái vụ mùa: CREATED → UPDATED → CLOSED.';
COMMENT ON TYPE "ContainerStage" IS 'Trạng thái thùng: CREATE → UPDATE → CONSUMED (đã bán/tiêu thụ).';

-- =============================================================================
-- CỘT — Role
-- =============================================================================

COMMENT ON COLUMN "Role"."code" IS 'Mã vai trò (PK): ENTERPRISE | TRANSIT | AGENT.';
COMMENT ON COLUMN "Role"."name" IS 'Tên hiển thị tiếng Việt của vai trò.';

-- =============================================================================
-- CỘT — User
-- =============================================================================

COMMENT ON COLUMN "User"."address" IS 'Địa chỉ stake ví Cardano (unique). Dùng làm identity đăng nhập.';
COMMENT ON COLUMN "User"."roleCode" IS 'FK → Role.code. Null khi chưa chọn vai trò / chưa hoàn tất đăng ký.';
COMMENT ON COLUMN "User"."displayName" IS 'Tên hiển thị trên hồ sơ.';
COMMENT ON COLUMN "User"."phoneNumber" IS 'Số điện thoại liên hệ.';
COMMENT ON COLUMN "User"."isActive" IS 'false = tài khoản bị vô hiệu hóa.';
COMMENT ON COLUMN "User"."lastLogin" IS 'Thời điểm đăng nhập gần nhất.';

-- =============================================================================
-- CỘT — WalletNonce
-- =============================================================================

COMMENT ON COLUMN "WalletNonce"."address" IS 'Stake address đang yêu cầu nonce (unique mỗi address).';
COMMENT ON COLUMN "WalletNonce"."nonce" IS 'Chuỗi nonce client phải ký để verify.';
COMMENT ON COLUMN "WalletNonce"."expiresAt" IS 'Hết hạn nonce.';
COMMENT ON COLUMN "WalletNonce"."usedAt" IS 'Thời điểm nonce đã dùng thành công; null = chưa dùng.';

-- =============================================================================
-- CỘT — Production
-- =============================================================================

COMMENT ON COLUMN "Production"."inventoryKey" IS 'Mã truy vết duy nhất trên chain & DB (vd: VU-MUA-...). FK target cho Container.';
COMMENT ON COLUMN "Production"."code" IS 'Mã nghiệp vụ hiển thị (có thể trùng format với inventoryKey).';
COMMENT ON COLUMN "Production"."traceSchemeRef" IS 'Tham chiếu scheme/policy truy vết on-chain.';
COMMENT ON COLUMN "Production"."registeringCustodianAddress" IS 'FK → User.address. Chủ sở hữu / người đăng ký (ENTERPRISE).';
COMMENT ON COLUMN "Production"."facilityId" IS 'Mã cơ sở / trang trại.';
COMMENT ON COLUMN "Production"."location" IS 'Địa điểm sản xuất.';
COMMENT ON COLUMN "Production"."farmingMethod" IS 'Phương pháp canh tác.';
COMMENT ON COLUMN "Production"."cropType" IS 'Loại cây trồng.';
COMMENT ON COLUMN "Production"."varietyId" IS 'Mã giống (nếu chọn từ danh mục).';
COMMENT ON COLUMN "Production"."customVariety" IS 'Tên giống tự nhập.';
COMMENT ON COLUMN "Production"."seedingDate" IS 'Ngày gieo trồng.';
COMMENT ON COLUMN "Production"."harvestDate" IS 'Ngày thu hoạch dự kiến/thực tế.';
COMMENT ON COLUMN "Production"."expectedYieldKg" IS 'Sản lượng dự kiến (kg), lưu dạng text.';
COMMENT ON COLUMN "Production"."actualYieldKg" IS 'Sản lượng thực tế (kg).';
COMMENT ON COLUMN "Production"."status" IS 'ProductionStage: CREATED | UPDATED | CLOSED.';
COMMENT ON COLUMN "Production"."certifications" IS 'Chứng nhận (vd: VietGAP, hữu cơ).';
COMMENT ON COLUMN "Production"."note" IS 'Ghi chú thêm.';

-- =============================================================================
-- CỘT — ContainerBatch
-- =============================================================================

COMMENT ON COLUMN "ContainerBatch"."registeringCustodianAddress" IS 'Ví người tạo đợt mint thùng.';
COMMENT ON COLUMN "ContainerBatch"."totalBoxes" IS 'Tổng số thùng cần mint trong đợt.';
COMMENT ON COLUMN "ContainerBatch"."completedBoxes" IS 'Số thùng đã mint xong.';
COMMENT ON COLUMN "ContainerBatch"."status" IS 'IN_PROGRESS | hoàn thành / hủy (text nghiệp vụ).';

-- =============================================================================
-- CỘT — Container
-- =============================================================================

COMMENT ON COLUMN "Container"."inventoryKey" IS 'Mã truy vết thùng (unique). In trên QR, tra cứu /trace/{inventoryKey}.';
COMMENT ON COLUMN "Container"."productionInventoryKey" IS 'FK → Production.inventoryKey. Vụ mùa nguồn.';
COMMENT ON COLUMN "Container"."registeringCustodianAddress" IS 'FK → User.address. Người đăng ký thùng.';
COMMENT ON COLUMN "Container"."batchId" IS 'FK → ContainerBatch.id. Null nếu mint đơn lẻ.';
COMMENT ON COLUMN "Container"."participantWalletAddresses" IS 'JSON array địa chỉ ví các bên tham gia chuỗi (owners on-chain).';
COMMENT ON COLUMN "Container"."participantLocationLabels" IS 'Nhãn điểm dừng chuỗi cung ứng, cách nhau dấu | (vd: Trang trại|Kho trung chuyển|Đại lý).';
COMMENT ON COLUMN "Container"."status" IS 'ContainerStage: CREATE | UPDATE | CONSUMED.';
COMMENT ON COLUMN "Container"."weightPerBoxKg" IS 'Khối lượng mỗi thùng (kg).';
COMMENT ON COLUMN "Container"."productName" IS 'Tên sản phẩm trong thùng.';
COMMENT ON COLUMN "Container"."containerType" IS 'Loại bao bì / thùng.';
COMMENT ON COLUMN "Container"."location" IS 'Vị trí hiện tại (text, bổ sung cho warehouse).';

-- =============================================================================
-- CỘT — Warehouse
-- =============================================================================

COMMENT ON COLUMN "Warehouse"."registeringCustodianAddress" IS 'FK → User.address. Mỗi user chỉ 1 kho (unique).';
COMMENT ON COLUMN "Warehouse"."name" IS 'Tên kho.';
COMMENT ON COLUMN "Warehouse"."location" IS 'Địa chỉ kho.';
COMMENT ON COLUMN "Warehouse"."capacity" IS 'Sức chứa (text: số thùng / diện tích).';

-- =============================================================================
-- CỘT — WarehouseStorage
-- =============================================================================

COMMENT ON COLUMN "WarehouseStorage"."containerInventoryKey" IS 'FK → Container.inventoryKey. Thùng đang lưu.';
COMMENT ON COLUMN "WarehouseStorage"."warehouseId" IS 'FK → Warehouse.id. Kho đang giữ thùng.';
COMMENT ON COLUMN "WarehouseStorage"."conditions" IS 'Điều kiện bảo quản (nhiệt độ, độ ẩm...).';

-- =============================================================================
-- CỘT — RecordOperation
-- =============================================================================

COMMENT ON COLUMN "RecordOperation"."entityType" IS 'Loại thực thể: PRODUCTION | CONTAINER.';
COMMENT ON COLUMN "RecordOperation"."entityKey" IS 'inventoryKey của Production hoặc Container.';
COMMENT ON COLUMN "RecordOperation"."opType" IS 'Loại thao tác on-chain (mint, update, consume...).';
COMMENT ON COLUMN "RecordOperation"."txHash" IS 'Hash giao dịch Cardano.';
COMMENT ON COLUMN "RecordOperation"."verified" IS 'true = đã xác minh tx trên chain.';
COMMENT ON COLUMN "RecordOperation"."verifiedAt" IS 'Thời điểm xác minh thành công.';
COMMENT ON COLUMN "RecordOperation"."payload" IS 'Metadata JSON gửi kèm giao dịch.';
COMMENT ON COLUMN "RecordOperation"."productionInventoryKey" IS 'FK → Production.inventoryKey (nullable).';
COMMENT ON COLUMN "RecordOperation"."containerInventoryKey" IS 'FK → Container.inventoryKey (nullable).';
COMMENT ON COLUMN "RecordOperation"."attempts" IS 'Số lần thử xác minh tx.';
COMMENT ON COLUMN "RecordOperation"."lastCheckedAt" IS 'Lần kiểm tra tx gần nhất.';
COMMENT ON COLUMN "RecordOperation"."lastError" IS 'Lỗi xác minh gần nhất (nếu có).';

-- =============================================================================
-- CỘT — Image
-- =============================================================================

COMMENT ON COLUMN "Image"."productionInventoryKey" IS 'FK → Production.inventoryKey.';
COMMENT ON COLUMN "Image"."ipfsUri" IS 'URI ảnh trên IPFS (ipfs://...).';
COMMENT ON COLUMN "Image"."ipfsHash" IS 'CID / hash IPFS (nếu tách riêng).';
COMMENT ON COLUMN "Image"."createdByAddress" IS 'Ví người upload ảnh.';

-- =============================================================================
-- KIỂM TRA SAU KHI CHẠY
-- =============================================================================

-- SELECT
--   c.relname AS table_name,
--   pg_catalog.obj_description(c.oid, 'pg_class') AS table_comment
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
--   AND c.relkind = 'r'
-- ORDER BY c.relname;
