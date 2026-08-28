export type CarCategory = "popular" | "large" | "small" | "exclusive";

export type Car = {
  id: string;
  name: string;
  category: CarCategory;
  pricePerDay: number;
  image: string;
};

export const carCategories: { id: CarCategory; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "large", label: "Large Car" },
  { id: "small", label: "Small Car" },
  { id: "exclusive", label: "Exclusive Car" },
];

const images = {
  astonMartin: "/client-side/cars/aston-martin.webp",
  audi: "/client-side/cars/audi.jpg",
  bmw: "/client-side/cars/bmw.avif",
  mercedes: "/client-side/cars/mercedes.webp",
  tesla: "/client-side/cars/tesla.jpg",
  audiS3: "/cars/audi-s3.jpg",
  nissan: "/cars/blue-nissan.jpeg",
  compact: "/cars/compact-car.webp",
  rangeRover: "/cars/range-rover.jpeg",
  yaris: "/cars/red-toyota.webp",
  corolla: "/cars/toyota-corolla.jpg",
};

export const cars: Car[] = [
  { id: "p1", name: "Range Rover Sport", category: "popular", pricePerDay: 145, image: images.rangeRover },
  { id: "p2", name: "Mercedes GLE", category: "popular", pricePerDay: 132, image: images.mercedes },
  { id: "p3", name: "BMW X5 xDrive", category: "popular", pricePerDay: 128, image: images.bmw },
  { id: "p4", name: "Audi S3 Sedan", category: "popular", pricePerDay: 120, image: images.audiS3 },
  { id: "p5", name: "Tesla Model 3", category: "popular", pricePerDay: 110, image: images.tesla },
  { id: "p6", name: "Audi A6 Saloon", category: "popular", pricePerDay: 98, image: images.audi },
  { id: "p7", name: "Toyota Corolla", category: "popular", pricePerDay: 62, image: images.corolla },
  { id: "p8", name: "Toyota Yaris", category: "popular", pricePerDay: 54, image: images.yaris },
  { id: "p9", name: "Nissan Sunny", category: "popular", pricePerDay: 48, image: images.nissan },
  { id: "p10", name: "City Compact", category: "popular", pricePerDay: 42, image: images.compact },

  { id: "l1", name: "Range Rover Sport", category: "large", pricePerDay: 145, image: images.rangeRover },
  { id: "l2", name: "Mercedes GLE", category: "large", pricePerDay: 132, image: images.mercedes },
  { id: "l3", name: "BMW X5 xDrive", category: "large", pricePerDay: 128, image: images.bmw },
  { id: "l4", name: "Audi Q7 Quattro", category: "large", pricePerDay: 124, image: images.audi },
  { id: "l5", name: "Range Rover Vogue", category: "large", pricePerDay: 158, image: images.rangeRover },
  { id: "l6", name: "Mercedes GLS", category: "large", pricePerDay: 165, image: images.mercedes },

  { id: "s1", name: "Toyota Yaris", category: "small", pricePerDay: 54, image: images.yaris },
  { id: "s2", name: "City Compact", category: "small", pricePerDay: 42, image: images.compact },
  { id: "s3", name: "Nissan Sunny", category: "small", pricePerDay: 48, image: images.nissan },
  { id: "s4", name: "Toyota Corolla", category: "small", pricePerDay: 62, image: images.corolla },
  { id: "s5", name: "Toyota Vitz", category: "small", pricePerDay: 38, image: images.compact },
  { id: "s6", name: "Nissan Note", category: "small", pricePerDay: 44, image: images.nissan },

  { id: "e1", name: "Aston Martin DB11", category: "exclusive", pricePerDay: 320, image: images.astonMartin },
  { id: "e2", name: "Tesla Model 3", category: "exclusive", pricePerDay: 110, image: images.tesla },
  { id: "e3", name: "Audi S3 Sedan", category: "exclusive", pricePerDay: 120, image: images.audiS3 },
  { id: "e4", name: "BMW X5 xDrive", category: "exclusive", pricePerDay: 128, image: images.bmw },
  { id: "e5", name: "Mercedes GLE", category: "exclusive", pricePerDay: 132, image: images.mercedes },
  { id: "e6", name: "Aston Martin Vantage", category: "exclusive", pricePerDay: 295, image: images.astonMartin },
];

export const totalCars = cars.length;

export function carsByCategory(category: CarCategory) {
  return cars.filter((car) => car.category === category);
}
