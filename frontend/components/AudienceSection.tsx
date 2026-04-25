"use client";

import { User, Truck, Building2 } from "lucide-react";

export function AudienceSection() {
  return (
    <section className="w-full min-h-screen flex items-center bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Truy xuất nguồn gốc dành cho ai?
          </h2>
        </div>
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Người tiêu dùng */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <User className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 border-b border-[#c41e3a]/40 pb-5">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a] mb-1">
                Người tiêu dùng:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                Truy xuất nguồn gốc cung cấp đầy đủ thông tin mà người tiêu dùng cần
                biết về thực phẩm đang sử dụng. Giá trị của dữ liệu này sẽ khác nhau
                tùy theo vai trò của từng bên trong chuỗi cung ứng.
              </p>
            </div>
          </div>

          {/* Nhà phân phối / Đại lý */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <Truck className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 border-b border-[#c41e3a]/40 pb-5">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a] mb-1">
                Nhà phân phối / Đại lý:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                Với nhà phân phối hoặc đại lý, truy xuất nguồn gốc giúp tối ưu quản
                lý tồn kho, đảm bảo tính toàn vẹn của sản phẩm trong toàn bộ quá trình
                phân phối và tăng tốc dòng hàng, từ đó nâng hiệu quả chuỗi cung ứng.
              </p>
            </div>
          </div>

          {/* Doanh nghiệp */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 text-[#c41e3a]">
              <Building2 className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-base md:text-lg font-bold text-[#c41e3a]">
                Doanh nghiệp:
              </h3>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                Với doanh nghiệp thực phẩm, truy xuất nguồn gốc thể hiện hình ảnh
                thương hiệu có trách nhiệm và tạo khác biệt ngay trong thị trường
                cạnh tranh cao.
              </p>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed text-justify">
                Đối với doanh nghiệp, truy xuất nguồn gốc đồng nghĩa với thu mua có
                trách nhiệm, bảo vệ thương hiệu, đáp ứng chuẩn thương mại toàn cầu
                và thu hút nhóm khách hàng quan tâm đến tính minh bạch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

