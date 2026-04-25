"use client";

import Image from "next/image";

export function AboutSection() {
  return (
    <section className="w-full min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[4fr_3fr] gap-8 md:gap-14 items-center">
          <div className="relative w-full min-h-[380px] md:min-h-[520px]">
            <Image
              src="/b.png"
              alt="Giới thiệu"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 md:text-white">
              Truy xuất nguồn gốc nông sản thực phẩm
            </h2>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              Truy xuất nguồn gốc đầu-cuối giúp mọi bên liên quan kiểm chứng được
              toàn bộ hành trình của từng lô hàng, từ nông trại hoặc cơ sở đóng gói,
              qua các điểm logistics đến người mua cuối cùng. Quét QR cho biết sản
              phẩm là gì, đã đi qua đâu và ai chịu trách nhiệm ở từng chặng.
            </p>
            <p className="text-sm md:text-base text-gray-700 md:text-gray-100 leading-relaxed text-justify">
              Với đội vận hành, cách làm này giảm đối soát thủ công và lỗi bàn giao.
              Kho và đơn vị trung chuyển đồng bộ công suất, lịch điều phối; mỗi cập
              nhật đều có xác thực mật mã để chuỗi truy xuất luôn khớp với tồn kho
              thực tế tại hiện trường.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify">
              Với người tiêu dùng và đơn vị kiểm toán, cùng một mã QR mở ra góc nhìn
              đáng tin cậy về xuất xứ, cam kết chất lượng và lịch sử luân chuyển.
              Dữ liệu sổ cái dùng chung giúp chuỗi cung ứng nông sản minh bạch,
              chống sửa đổi nhưng vẫn dễ kiểm tra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
