export const productCategories = ["SUV", "Sedan", "Hatchback", "Coupe", "Pickup"] as const;

export type ProductCategory = (typeof productCategories)[number];
