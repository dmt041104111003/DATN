-- CreateTable
CREATE TABLE "product_material" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_material_product_id_material_id_key" ON "product_material"("product_id", "material_id");

-- AddForeignKey
ALTER TABLE "product_material" ADD CONSTRAINT "product_material_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_material" ADD CONSTRAINT "product_material_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "raw_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
