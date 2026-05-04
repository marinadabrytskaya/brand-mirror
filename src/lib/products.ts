export type BrandMirrorProduct = "quick_diagnosis" | "full_report";

export const FULL_REPORT_PRODUCT: BrandMirrorProduct = "full_report";
export const QUICK_DIAGNOSIS_PRODUCT: BrandMirrorProduct = "quick_diagnosis";

export const BRANDMIRROR_PRODUCTS: Record<
  BrandMirrorProduct,
  {
    name: string;
    displayPrice: "$67" | "$149";
    regularDisplayPrice: "$97" | "$197";
    usdCents: number;
    regularUsdCents: number;
    zarCents: number;
    successPath: "/quick-diagnosis" | "/full-report";
    paystackMetadataProduct: "brandmirror_quick_diagnosis" | "brandmirror_full_report";
  }
> = {
  quick_diagnosis: {
    name: "BrandMirror Quick Diagnosis",
    displayPrice: "$67",
    regularDisplayPrice: "$97",
    usdCents: 6_700,
    regularUsdCents: 9_700,
    zarCents: 1_250_00,
    successPath: "/quick-diagnosis",
    paystackMetadataProduct: "brandmirror_quick_diagnosis",
  },
  full_report: {
    name: "BrandMirror Full Report",
    displayPrice: "$149",
    regularDisplayPrice: "$197",
    usdCents: 14_900,
    regularUsdCents: 19_700,
    zarCents: 2_800_00,
    successPath: "/full-report",
    paystackMetadataProduct: "brandmirror_full_report",
  },
};

export function getBrandMirrorProduct(value?: string | null): BrandMirrorProduct {
  const normalized = (value || "").trim().toLowerCase();
  if (
    normalized === "quick" ||
    normalized === "quick_diagnosis" ||
    normalized === "brandmirror_quick_diagnosis"
  ) {
    return QUICK_DIAGNOSIS_PRODUCT;
  }
  return FULL_REPORT_PRODUCT;
}

export function getBrandMirrorProductConfig(product?: string | null) {
  return BRANDMIRROR_PRODUCTS[getBrandMirrorProduct(product)];
}

export function canAccessBrandMirrorProduct(
  accessProduct: string | null | undefined,
  requestedProduct: BrandMirrorProduct,
) {
  const product = getBrandMirrorProduct(accessProduct);
  return (
    product === requestedProduct ||
    (product === FULL_REPORT_PRODUCT && requestedProduct === QUICK_DIAGNOSIS_PRODUCT)
  );
}
