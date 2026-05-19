"use client";

import Image from "next/image";
import { GovSectionHeader } from "./GovSectionHeader";

export function AboutSection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="gov-section overflow-hidden">
          <GovSectionHeader index="02" title="Giới thiệu hệ thống" />
          <div className="gov-section-body w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-[4fr_3fr] gap-8 items-center">
            <div className="relative w-full min-h-[320px] md:min-h-[420px]">
              <Image src="/b.png" alt="Giới thiệu" fill className="object-contain" priority />
            </div>
            <div className="space-y-3 text-sm md:text-base text-gray-800 leading-relaxed text-justify">
              <p>
                Truy xuất nguồn gốc đầu-cuối giúp mọi bên liên quan kiểm chứng hành trình từng lô hàng, từ nông trại
                đến người mua cuối. Quét QR cho biết sản phẩm là gì, đã đi qua đâu và ai chịu trách nhiệm từng chặng.
              </p>
              <p>
                Với đội vận hành, cách làm này giảm đối soát thủ công. Kho và đơn vị trung chuyển đồng bộ công suất;
                mỗi cập nhật có xác thực mật mã để chuỗi truy xuất khớp tồn kho thực tế.
              </p>
              <p>
                Với người tiêu dùng và đơn vị kiểm toán, cùng một mã QR mở góc nhìn đáng tin về xuất xứ, chất lượng
                và lịch sử luân chuyển — minh bạch, chống sửa đổi, dễ kiểm tra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
