export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  avatar?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "viezh-robert",
    name: "Viezh Robert",
    location: "Warsaw, Poland",
    rating: 5,
    avatar: "/client-side/people/review1.jpg",
    quote:
      "Wow... I am very happy to use this premium service. It far exceeded my expectations and I'll definitely be back.",
  },
  {
    id: "alia-khan",
    name: "Alia Khan",
    location: "Gulshan, Dhaka",
    rating: 5,
    avatar: "/client-side/people/review3.avif",
    quote:
      "Booking took two minutes and the car arrived spotless. The team kept me updated the whole way through.",
  },
  {
    id: "ryan-adams",
    name: "Ryan Adams",
    location: "Boston, USA",
    rating: 5,
    avatar: "/client-side/people/review2.webp",
    quote:
      "Best rental experience I have had in Dhaka. Transparent pricing, no hidden fees and a beautiful fleet.",
  },
  {
    id: "sadia-rahman",
    name: "Sadia Rahman",
    location: "Banani, Dhaka",
    rating: 5,
    avatar: "/client-side/people/review4.jpg",
    quote:
      "I rented the Range Rover for a wedding weekend. Immaculate condition and the driver was extremely professional.",
  },
  {
    id: "james-lee",
    name: "James Lee",
    location: "Singapore",
    rating: 4,
    avatar: "/client-side/people/review2.webp",
    quote:
      "Great value for a premium car. Pick-up at the airport was seamless and the paperwork was already sorted.",
  },
  {
    id: "nusrat-jahan",
    name: "Nusrat Jahan",
    location: "Dhanmondi, Dhaka",
    rating: 5,
    avatar: "/client-side/people/review5.jpeg",
    quote:
      "Customer support answered within minutes on a Sunday night. That alone earns my loyalty for future trips.",
  },
];
