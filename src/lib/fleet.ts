export type FleetImage = {
  id: string;
  src: string;
  alt: string;
};

export const fleet: FleetImage[] = [
  { id: "aston-martin", src: "/client-side/cars/astonmartin.jpg", alt: "Aston Martin" },
  { id: "audi", src: "/client-side/cars/audi.jpg", alt: "Audi" },
  { id: "bmw", src: "/client-side/cars/bmw.jpg", alt: "BMW" },
  { id: "mercedes", src: "/client-side/cars/mercedes.webp", alt: "Mercedes-Benz" },
  { id: "tesla", src: "/client-side/cars/tesla.jpg", alt: "Tesla" },
];
