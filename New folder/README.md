# Hydra Supply Chain Frontend

Frontend cho hệ thống Supply Chain trên Cardano với Hydra L2.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Quick Start

```bash
# 1. Cài dependencies
npm install

# 2. Init shadcn/ui (chọn New York style)
npx shadcn@latest init

# 3. Thêm Dashboard blocks từ shadcn/ui
npx shadcn@latest add sidebar-07
npx shadcn@latest add login-01

# 4. Thêm các components cần thiết
npx shadcn@latest add button card input label badge skeleton table

# 5. Chạy dev server
npm run dev
```

## shadcn/ui Blocks có sẵn

```bash
# Dashboard với Sidebar (RECOMMENDED)
npx shadcn@latest add sidebar-07

# Login page
npx shadcn@latest add login-01

# Dashboard charts
npx shadcn@latest add chart-area-interactive
npx shadcn@latest add chart-bar-multiple

# Data tables
npx shadcn@latest add data-table
```

Xem tất cả blocks: https://ui.shadcn.com/blocks

## Cấu trúc dự án (Design Patterns)

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard layout group
│   │   ├── dashboard/      # Dashboard page
│   │   ├── products/       # Products CRUD
│   │   ├── collections/    # Collections CRUD
│   │   ├── suppliers/      # Suppliers CRUD
│   │   ├── materials/      # Materials CRUD
│   │   ├── hydra/          # Hydra L2 management
│   │   └── services/       # Service plans
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (Sidebar, Header)
│   └── shared/             # Shared components (LoadingState, ErrorState)
│
├── hooks/                  # Custom hooks (React Query)
│   ├── use-products.ts
│   ├── use-collections.ts
│   ├── use-suppliers.ts
│   ├── use-materials.ts
│   ├── use-hydra.ts
│   └── use-services.ts
│
├── lib/
│   ├── api/                # API Repository Pattern
│   │   ├── client.ts       # HTTP client
│   │   ├── auth.repository.ts
│   │   ├── product.repository.ts
│   │   └── ...
│   └── utils.ts            # Utility functions
│
├── providers/              # React Providers
│   ├── query-provider.tsx  # TanStack Query
│   └── index.tsx           # Composition Root
│
├── stores/                 # Zustand stores
│   └── auth.store.ts
│
└── types/                  # TypeScript types
    └── index.ts

## Import Convention

Tất cả imports đều là **direct imports**, không sử dụng barrel exports (index.ts):

```typescript
// Direct import - ĐÚNG
import { Button } from "@/components/ui/button";
import { productRepository } from "@/lib/api/product.repository";
import { useProducts } from "@/hooks/use-products";

// Barrel export - KHÔNG SỬ DỤNG
// import { Button } from "@/components/ui";
// import { productRepository } from "@/lib/api";
```
```

## SOLID Principles Applied

1. **Single Responsibility**: Mỗi file/function chỉ làm 1 việc
2. **Open/Closed**: Components mở rộng qua props, không sửa code
3. **Liskov Substitution**: Types kế thừa đúng cách
4. **Interface Segregation**: Interfaces nhỏ, cụ thể
5. **Dependency Inversion**: Sử dụng Repository Pattern cho API

## Cài đặt

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## shadcn/ui Components Required

Chạy lệnh sau để cài tất cả components cần thiết:

```bash
npx shadcn@latest add button card input label badge table skeleton sidebar sheet separator tooltip avatar dropdown-menu
```

Hoặc cài từng cái:

```bash
# Core components (BẮT BUỘC)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add separator

# Sidebar (BẮT BUỘC cho dashboard)
npx shadcn@latest add sidebar

# Optional - thêm khi cần
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add textarea
```

## Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints (Backend)

- `GET /auth/nonce` - Lấy nonce để ký
- `POST /auth/verify` - Xác thực ví
- `GET /products` - Danh sách sản phẩm
- `POST /products` - Tạo sản phẩm
- `GET /collections` - Danh sách collections
- `GET /suppliers` - Danh sách nhà cung cấp
- `GET /materials` - Danh sách nguyên liệu
- `GET /hydra/heads` - Danh sách Hydra heads
- `GET /services` - Danh sách gói dịch vụ

## Tích hợp Cardano Wallet

Để tích hợp wallet (Nami, Eternl, Lace), cài thêm:

```bash
npm install @meshsdk/core @meshsdk/react
```

Rồi sửa `/login/page.tsx` để sử dụng Mesh SDK.
