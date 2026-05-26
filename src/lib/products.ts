/**
 * Single source of truth for the GLZ Bearings product catalogue.
 * Imported by the products page UI and the PDF catalogue generator so the
 * downloadable brochure always reflects the live catalogue.
 */

export type BearingType = "Ball" | "Roller" | "Specialty";
export type SpeedClass = "High" | "Medium" | "Standard";
export type LoadClass = "Heavy" | "Medium" | "Light";

export type Product = {
  slug: string;
  name: string;
  type: BearingType;
  speed: SpeedClass;
  load: LoadClass;
  material: string;
  tempRange: string;
  corrosionResistant: boolean;
  desc: string;
  applications: string[];
  img: string;
  availability: "In Stock" | "Made to Order";
};

export const PRODUCTS: Product[] = [
  {
    slug: "deep-groove-ball",
    name: "Deep Groove Ball Bearing",
    type: "Ball",
    speed: "High",
    load: "Medium",
    material: "Chrome Steel",
    tempRange: "−40 to 150 °C",
    corrosionResistant: false,
    desc: "Versatile single-row design handling combined radial and moderate axial loads with low friction and quiet running.",
    applications: ["Electric motors", "Pumps", "Appliances"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUqSSUjZ3z1imOpmCMsdsWu2ChLseUUKYobkgrC_wcC15JcR5_lhsEl7UyfRzkUweHiOUOLtywkKOVJ8J9tKqgRB2FQ3W4qNm8yA6Wzvq15PWOdjiAj8i8Wn0TGLfYpUWU-lJM8PIqqaOjh9lVNhMNnl590gb1fJK59ty85l4xmz8r6zuJgEqEFS_Gv1sslwaUfA0BeEQjA6gywwbn72lILgmnKadbIcxoxA8AC7baGjpig4zVkjXnd5mV0eJn8XZWmfC-BVMiA",
    availability: "In Stock",
  },
  {
    slug: "angular-contact",
    name: "Angular Contact Ball Bearing",
    type: "Ball",
    speed: "High",
    load: "Medium",
    material: "Chrome Steel",
    tempRange: "−30 to 150 °C",
    corrosionResistant: false,
    desc: "Raceways arranged to support combined radial and thrust loads — purpose-built for spindle and gear applications.",
    applications: ["Machine tool spindles", "Gearboxes", "Pumps"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoPsW7IoqZqvfqBwmJh0p1zP1V1pwJx1bx7cl1toSlh6NVeqbqtobvGzJgpdy0I_CFBfzx8TeAIsQt16BpNb6CCnfHZ3QFjNte6AGU62zYQGzRosMRp41XiNWZCMCsPSe_QBztp9HCu2PlCwaBWXVihBhYJ16McxizPuqNvFxrzpHrPJ7P4tZJPqZUHr46UXg30Crrb3DowvEkKYoF0dyREOodqY3qK_J8_-kvOTquLURU2WxUVVEElT8fMm6dEQGa8y87ZBpyJg",
    availability: "In Stock",
  },
  {
    slug: "stainless-ball",
    name: "Stainless Ball Bearing",
    type: "Ball",
    speed: "High",
    load: "Light",
    material: "440C Stainless",
    tempRange: "−40 to 200 °C",
    corrosionResistant: true,
    desc: "Stainless rings and rolling elements for wet, washdown and corrosive environments without sacrificing precision.",
    applications: ["Food & beverage", "Medical", "Marine"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhZmgJqJ0gO-GN76x-ywhzLv0ys8cQt6EPNAHyqrOOG6diZEZexMEk1cw1aWQ05M3PGfqqB9UMDMWMNzMMxpjB3BwbxTAYRdWWYfXskpQjuJpL2GJgJ3a1vedYrFg2BEcc-KFwNdffJXTdROC5g5ZsdWyw7Hoj9zfWl6CB2qWvlH37YOjFGRsoS8eYZIua3P2ZebxPbQqWpnxiI5sn6rU7X6sJJo-X1MdQD-k6Mtmkh2hX7lRcbFo7wosyxuirMlmb6A9PzPcg",
    availability: "Made to Order",
  },
  {
    slug: "spherical-roller",
    name: "Spherical Roller Bearing",
    type: "Roller",
    speed: "Medium",
    load: "Heavy",
    material: "Carburised Steel",
    tempRange: "−30 to 200 °C",
    corrosionResistant: false,
    desc: "Self-aligning two-row design absorbing the heaviest radial loads, shock loads and shaft deflection with composure.",
    applications: ["Mining", "Paper mills", "Marine propulsion"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUqSSUjZ3z1imOpmCMsdsWu2ChLseUUKYobkgrC_wcC15JcR5_lhsEl7UyfRzkUweHiOUOLtywkKOVJ8J9tKqgRB2FQ3W4qNm8yA6Wzvq15PWOdjiAj8i8Wn0TGLfYpUWU-lJM8PIqqaOjh9lVNhMNnl590gb1fJK59ty85l4xmz8r6zuJgEqEFS_Gv1sslwaUfA0BeEQjA6gywwbn72lILgmnKadbIcxoxA8AC7baGjpig4zVkjXnd5mV0eJn8XZWmfC-BVMiA",
    availability: "In Stock",
  },
  {
    slug: "cylindrical-roller",
    name: "Cylindrical Roller Bearing",
    type: "Roller",
    speed: "High",
    load: "Heavy",
    material: "Through-Hardened Steel",
    tempRange: "−30 to 180 °C",
    corrosionResistant: false,
    desc: "High radial capacity with separable design — engineered for rotational rigidity at speed in heavy-duty drivelines.",
    applications: ["Gearboxes", "Traction motors", "Compressors"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoPsW7IoqZqvfqBwmJh0p1zP1V1pwJx1bx7cl1toSlh6NVeqbqtobvGzJgpdy0I_CFBfzx8TeAIsQt16BpNb6CCnfHZ3QFjNte6AGU62zYQGzRosMRp41XiNWZCMCsPSe_QBztp9HCu2PlCwaBWXVihBhYJ16McxizPuqNvFxrzpHrPJ7P4tZJPqZUHr46UXg30Crrb3DowvEkKYoF0dyREOodqY3qK_J8_-kvOTquLURU2WxUVVEElT8fMm6dEQGa8y87ZBpyJg",
    availability: "In Stock",
  },
  {
    slug: "tapered-roller",
    name: "Tapered Roller Bearing",
    type: "Roller",
    speed: "Medium",
    load: "Heavy",
    material: "Case-Hardened Steel",
    tempRange: "−30 to 180 °C",
    corrosionResistant: false,
    desc: "Optimised for combined radial and axial loads — the workhorse of automotive driveline and heavy machinery.",
    applications: ["Automotive wheels", "Industrial drives", "Construction"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhZmgJqJ0gO-GN76x-ywhzLv0ys8cQt6EPNAHyqrOOG6diZEZexMEk1cw1aWQ05M3PGfqqB9UMDMWMNzMMxpjB3BwbxTAYRdWWYfXskpQjuJpL2GJgJ3a1vedYrFg2BEcc-KFwNdffJXTdROC5g5ZsdWyw7Hoj9zfWl6CB2qWvlH37YOjFGRsoS8eYZIua3P2ZebxPbQqWpnxiI5sn6rU7X6sJJo-X1MdQD-k6Mtmkh2hX7lRcbFo7wosyxuirMlmb6A9PzPcg",
    availability: "In Stock",
  },
  {
    slug: "needle-roller",
    name: "Needle Roller Bearing",
    type: "Roller",
    speed: "Medium",
    load: "Medium",
    material: "Chrome Steel",
    tempRange: "−30 to 150 °C",
    corrosionResistant: false,
    desc: "Slim cross-section with high radial capacity — chosen where shaft envelope is constrained without compromise on load.",
    applications: ["Transmissions", "Connecting rods", "Compact drives"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUqSSUjZ3z1imOpmCMsdsWu2ChLseUUKYobkgrC_wcC15JcR5_lhsEl7UyfRzkUweHiOUOLtywkKOVJ8J9tKqgRB2FQ3W4qNm8yA6Wzvq15PWOdjiAj8i8Wn0TGLfYpUWU-lJM8PIqqaOjh9lVNhMNnl590gb1fJK59ty85l4xmz8r6zuJgEqEFS_Gv1sslwaUfA0BeEQjA6gywwbn72lILgmnKadbIcxoxA8AC7baGjpig4zVkjXnd5mV0eJn8XZWmfC-BVMiA",
    availability: "Made to Order",
  },
  {
    slug: "thrust-bearing",
    name: "Thrust Bearing",
    type: "Specialty",
    speed: "Medium",
    load: "Heavy",
    material: "Through-Hardened Steel",
    tempRange: "−30 to 180 °C",
    corrosionResistant: false,
    desc: "Engineered for pure axial loads. Available in ball, cylindrical and spherical roller configurations on request.",
    applications: ["Vertical pumps", "Gear drives", "Crane hooks"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoPsW7IoqZqvfqBwmJh0p1zP1V1pwJx1bx7cl1toSlh6NVeqbqtobvGzJgpdy0I_CFBfzx8TeAIsQt16BpNb6CCnfHZ3QFjNte6AGU62zYQGzRosMRp41XiNWZCMCsPSe_QBztp9HCu2PlCwaBWXVihBhYJ16McxizPuqNvFxrzpHrPJ7P4tZJPqZUHr46UXg30Crrb3DowvEkKYoF0dyREOodqY3qK_J8_-kvOTquLURU2WxUVVEElT8fMm6dEQGa8y87ZBpyJg",
    availability: "In Stock",
  },
  {
    slug: "ceramic-hybrid",
    name: "Ceramic Hybrid Bearing",
    type: "Specialty",
    speed: "High",
    load: "Light",
    material: "Silicon Nitride / Steel",
    tempRange: "−50 to 200 °C",
    corrosionResistant: true,
    desc: "Steel rings with silicon nitride rolling elements — lower friction, higher speed, immunity to electrical erosion.",
    applications: ["High-speed spindles", "Vacuum", "Specialty motors"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhZmgJqJ0gO-GN76x-ywhzLv0ys8cQt6EPNAHyqrOOG6diZEZexMEk1cw1aWQ05M3PGfqqB9UMDMWMNzMMxpjB3BwbxTAYRdWWYfXskpQjuJpL2GJgJ3a1vedYrFg2BEcc-KFwNdffJXTdROC5g5ZsdWyw7Hoj9zfWl6CB2qWvlH37YOjFGRsoS8eYZIua3P2ZebxPbQqWpnxiI5sn6rU7X6sJJo-X1MdQD-k6Mtmkh2hX7lRcbFo7wosyxuirMlmb6A9PzPcg",
    availability: "Made to Order",
  },
];

export const CATALOGUE_FILENAME = "glz-bearings-catalogue.pdf";
export const CATALOGUE_PUBLIC_PATH = `/${CATALOGUE_FILENAME}`;
