export const categories = [
  {
    id: "makanan",
    name: "Makanan",
    icon: "🍽️",
  },
];

export const products = [
  {
    id: "siomay",
    categoryId: "makanan",
    name: "Siomay",
    description: "Siomay ayam dengan tekstur lembut dan rasa gurih.",
    price: 12000,
    image: "/images/siomay.jpg",

    options: [
      {
        id: "sauce",
        name: "Pilih Saus",
        required: true,
        multiple: true,
        values: [
          {
            id: "mentai",
            name: "Mentai",
            price: 0,
          },
          {
            id: "ter-tar",
            name: "Ter-Tar",
            price: 0,
          },
          {
            id: "brulee",
            name: "Brulee",
            price: 0,
          },
          {
            id: "hot-volcano",
            name: "Hot Volcano",
            price: 0,
          },
        ],
      },
    ],

    pcs: [4, 6, 16],
  },
];