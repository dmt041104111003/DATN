export declare function hashString(input: string): string;
export declare function hashCertification(certName: string, issueDate: Date | string, expiryDate?: Date | string | null): string;
export declare function hashMedia(url: string, type: string): string;
export declare function hashProductMaterial(materialId: string, quantity: number, unit?: string | null): string;
export declare function hashMaterial(name: string, supplierId: string, harvestDate?: Date | string | null): string;
