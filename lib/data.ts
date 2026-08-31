/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MENU DATA  —  update name, price, image, description here
 *  All other logic (cart, WhatsApp, UI) reads from this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Customization {
  label: string;          // e.g. "Spice Level"
  options: string[];      // e.g. ["Mild", "Medium", "Hot", "Extra Hot"]
  defaultIndex: number;   // index of the default option
}

export interface Food {
  id: number;
  name: string;
  description: string;
  price: number;          // in ₹, integer
  rating: number;
  reviews: number;
  category: string;
  veg: boolean;
  image: string;
  popular?: boolean;      // show in "Popular" category
  available?: boolean;    // admin can toggle visibility; defaults to true
  customizations?: Customization[];
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = [
  "All",
  "Popular",
  "Starters",
  "Soups",
  "Main Course",
  "Breads",
  "Biryani & Rice",
  "Desserts",
  "Drinks",
] as const;

export type Category = (typeof categories)[number];

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const foods: Food[] = [
  // ── STARTERS ────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Paneer Tikka",
    description:
      "Chunks of fresh cottage cheese marinated in spiced yoghurt and grilled in a tandoor. Served with mint chutney and sliced onions.",
    price: 249,
    rating: 4.8,
    reviews: 124,
    category: "Starters",
    veg: true,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Chicken Tikka",
    description:
      "Boneless chicken pieces marinated in a smoky spiced yoghurt blend, skewered and flame-grilled to perfection.",
    price: 289,
    rating: 4.7,
    reviews: 98,
    category: "Starters",
    veg: false,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 4,
    name: "Seekh Kebab",
    description:
      "Minced lamb blended with fresh herbs, onions and warming spices, shaped on skewers and slow-cooked over charcoal.",
    price: 319,
    rating: 4.6,
    reviews: 82,
    category: "Starters",
    veg: false,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot"],
        defaultIndex: 1,
      },
    ],
  },

  // ── SOUPS ────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: "Tomato Shorba",
    description:
      "A velvety Indian-style tomato broth simmered with whole spices, finished with cream and fresh coriander.",
    price: 129,
    rating: 4.4,
    reviews: 45,
    category: "Soups",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Sweet Corn Soup",
    description:
      "Classic Indo-Chinese sweet corn chowder with finely shredded vegetables and a light cornflour finish.",
    price: 119,
    rating: 4.3,
    reviews: 38,
    category: "Soups",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Type",
        options: ["Veg", "Chicken"],
        defaultIndex: 0,
      },
    ],
  },

  // ── MAIN COURSE ──────────────────────────────────────────────────────────────
  {
    id: 7,
    name: "Butter Chicken",
    description:
      "Succulent tandoor-roasted chicken pieces simmered in a rich, velvety tomato-cream sauce perfumed with kasuri methi.",
    price: 349,
    rating: 4.9,
    reviews: 238,
    category: "Main Course",
    veg: false,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot"],
        defaultIndex: 0,
      },
      {
        label: "Portion",
        options: ["Half", "Full"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 8,
    name: "Dal Makhani",
    description:
      "Whole black lentils and kidney beans slow-cooked overnight, finished with butter, cream and a hint of smokiness.",
    price: 229,
    rating: 4.8,
    reviews: 156,
    category: "Main Course",
    veg: true,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9,
    name: "Palak Paneer",
    description:
      "Fresh cottage cheese cubes nestled in a smooth, spiced spinach gravy. A North Indian classic at its finest.",
    price: 249,
    rating: 4.6,
    reviews: 112,
    category: "Main Course",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 10,
    name: "Mutton Rogan Josh",
    description:
      "Tender slow-braised mutton in a bold Kashmiri red gravy of whole spices, ginger and caramelised onions.",
    price: 419,
    rating: 4.7,
    reviews: 89,
    category: "Main Course",
    veg: false,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
        defaultIndex: 2,
      },
    ],
  },
  {
    id: 11,
    name: "Paneer Butter Masala",
    description:
      "Golden-seared paneer cubes in a luscious, slightly sweet tomato-cashew gravy. Rich, comforting, crowd-pleasing.",
    price: 269,
    rating: 4.7,
    reviews: 143,
    category: "Main Course",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  },

  // ── BREADS ───────────────────────────────────────────────────────────────────
  {
    id: 12,
    name: "Butter Naan",
    description:
      "Soft, pillowy leavened bread baked fresh in a tandoor and brushed generously with cultured butter.",
    price: 59,
    rating: 4.7,
    reviews: 201,
    category: "Breads",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Type",
        options: ["Plain", "Butter", "Garlic Butter", "Cheese"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 13,
    name: "Tandoori Roti",
    description:
      "Wholemeal flatbread baked directly on the walls of a blazing tandoor. Light, charred edges, served hot.",
    price: 39,
    rating: 4.5,
    reviews: 134,
    category: "Breads",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 14,
    name: "Paratha",
    description:
      "Flaky whole-wheat flatbread pan-fried in ghee. Choose from aloo, gobi or onion stuffing.",
    price: 79,
    rating: 4.6,
    reviews: 88,
    category: "Breads",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Stuffing",
        options: ["Aloo", "Gobi", "Onion", "Mixed Veg"],
        defaultIndex: 0,
      },
    ],
  },

  // ── BIRYANI & RICE ───────────────────────────────────────────────────────────
  {
    id: 15,
    name: "Chicken Biryani",
    description:
      "Long-grain basmati rice layered with spice-marinated chicken, caramelised onions and saffron, dum-cooked in a sealed pot.",
    price: 329,
    rating: 4.7,
    reviews: 187,
    category: "Biryani & Rice",
    veg: false,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot"],
        defaultIndex: 1,
      },
      {
        label: "Portion",
        options: ["Half", "Full"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 16,
    name: "Veg Biryani",
    description:
      "Seasonal vegetables and paneer slow-cooked with fragrant basmati in whole-spice–infused ghee. Topped with crispy onions.",
    price: 269,
    rating: 4.5,
    reviews: 94,
    category: "Biryani & Rice",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Spice Level",
        options: ["Mild", "Medium", "Hot"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 20,
    name: "Kulfi",
    description:
      "Dense, intensely flavoured Indian ice cream set on a stick. Available in malai, pista or rose-falooda variants.",
    price: 99,
    rating: 4.7,
    reviews: 77,
    category: "Desserts",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Flavour",
        options: ["Malai", "Pista", "Rose Falooda", "Mango"],
        defaultIndex: 0,
      },
    ],
  },

  // ── DRINKS ───────────────────────────────────────────────────────────────────
  {
    id: 21,
    name: "Mango Lassi",
    description:
      "Thick, chilled yoghurt whipped with Alphonso mango pulp, a pinch of cardamom and a drizzle of honey.",
    price: 99,
    rating: 4.7,
    reviews: 211,
    category: "Drinks",
    veg: true,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Sweetness",
        options: ["Less Sweet", "Regular", "Extra Sweet"],
        defaultIndex: 1,
      },
    ],
  },
  {
    id: 22,
    name: "Masala Chai",
    description:
      "Boldly brewed black tea simmered with ginger, cardamom, clove and cinnamon. Served with steamed milk.",
    price: 59,
    rating: 4.8,
    reviews: 189,
    category: "Drinks",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 23,
    name: "Fresh Lime Soda",
    description:
      "Freshly squeezed lime juice topped with chilled sparkling water. Choose sweet, salted or mixed.",
    price: 69,
    rating: 4.5,
    reviews: 102,
    category: "Drinks",
    veg: true,
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80",
    customizations: [
      {
        label: "Variant",
        options: ["Sweet", "Salted", "Mixed"],
        defaultIndex: 2,
      },
    ],
  },
];
