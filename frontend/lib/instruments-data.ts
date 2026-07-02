export interface ScaleStep {
  exp: string;
  size: string;
  name: string;
  note: string;
}

export interface Quote {
  text: string;
  who: string;
  era: string;
}

export const SCALE_STEPS: ScaleStep[] = [
  {
    exp: "10⁻¹⁵",
    size: "1 femtometre",
    name: "A proton",
    note: "The basement of matter. Smaller than imagination has any right to go.",
  },
  {
    exp: "10⁻¹²",
    size: "1 picometre",
    name: "A gamma ray's wavelength",
    note: "Light, wound tighter than any atom can hold.",
  },
  {
    exp: "10⁻¹⁰",
    size: "1 ångström",
    name: "A hydrogen atom",
    note: "Mostly empty space, doing a convincing impression of a thing.",
  },
  {
    exp: "10⁻⁹",
    size: "1 nanometre",
    name: "A strand of DNA",
    note: "Two nanometres wide — and somehow it remembers how to build a you.",
  },
  {
    exp: "10⁻⁷",
    size: "100 nanometres",
    name: "A virus",
    note: "On the quiet border between chemistry and life.",
  },
  {
    exp: "10⁻⁵",
    size: "10 micrometres",
    name: "A red blood cell",
    note: "Eight of these laid in a row would span a single grain of salt.",
  },
  {
    exp: "10⁻⁴",
    size: "0.1 millimetre",
    name: "A grain of fine sand",
    note: "The smallest thing your fingertips can reliably find.",
  },
  {
    exp: "10⁻²",
    size: "1 centimetre",
    name: "A walnut",
    note: "Back in the comfortable world of things you can hold.",
  },
  {
    exp: "10⁰",
    size: "1 metre",
    name: "A human being",
    note: "Give or take. This is the scale you secretly measure all the others from.",
  },
  {
    exp: "10¹",
    size: "10 metres",
    name: "A blue whale",
    note: "The largest animal that has ever lived on this planet.",
  },
  {
    exp: "10²",
    size: "100 metres",
    name: "A redwood",
    note: "The tallest living things — quiet towers of slow water.",
  },
  {
    exp: "10³",
    size: "1 kilometre",
    name: "A small mountain",
    note: "A thousand metres of patient rock.",
  },
  {
    exp: "10⁴",
    size: "8.8 kilometres",
    name: "Mount Everest",
    note: "Earth's highest reach is still, cosmically, a rounding error.",
  },
  {
    exp: "10⁶",
    size: "3,474 km",
    name: "The Moon",
    note: "Close enough to touch, in the only terms the universe respects.",
  },
  {
    exp: "10⁷",
    size: "12,742 km",
    name: "The Earth",
    note: "Twelve thousand kilometres of every person you will ever know.",
  },
  {
    exp: "10⁹",
    size: "1.4 million km",
    name: "The Sun",
    note: "A million Earths would fit inside it, with room left over.",
  },
  {
    exp: "10¹¹",
    size: "1 AU",
    name: "Earth's orbit",
    note: "One astronomical unit — about eight minutes of sunlight, end to end.",
  },
  {
    exp: "10¹³",
    size: "≈ 9 billion km",
    name: "The Solar System",
    note: "Out past Neptune, where the Sun is merely the brightest star in the sky.",
  },
  {
    exp: "10¹⁶",
    size: "1 light-year",
    name: "One light-year",
    note: "The distance light walks in a year — and the nearest star is four of these away.",
  },
  {
    exp: "10²¹",
    size: "100,000 ly",
    name: "The Milky Way",
    note: "A hundred billion suns, ours among them, on a quiet outer arm.",
  },
  {
    exp: "10²²",
    size: "2.5 million ly",
    name: "Andromeda",
    note: "The nearest large galaxy, falling slowly and certainly toward us.",
  },
  {
    exp: "10²⁴",
    size: "≈ 100 million ly",
    name: "The local supercluster",
    note: "Galaxies in their thousands, strung like dew across an unseen web.",
  },
  {
    exp: "10²⁶",
    size: "93 billion ly",
    name: "The observable universe",
    note: "The edge of everything we could ever, even in principle, see.",
  },
];

export const QUOTES: Quote[] = [
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    who: "Marcus Aurelius",
    era: "Meditations, c. 170 CE",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    who: "Seneca",
    era: "Letters, c. 65 CE",
  },
  {
    text: "The cosmos is within us. We are made of star-stuff.",
    who: "Carl Sagan",
    era: "Cosmos, 1980",
  },
  {
    text: "Confine yourself to the present.",
    who: "Marcus Aurelius",
    era: "Meditations, c. 170 CE",
  },
  {
    text: "Look up at the stars and not down at your feet.",
    who: "Stephen Hawking",
    era: "2010",
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    who: "Seneca",
    era: "On the Shortness of Life, c. 49 CE",
  },
  {
    text: "We are a way for the universe to know itself.",
    who: "Carl Sagan",
    era: "Cosmos, 1980",
  },
  {
    text: "The soul becomes dyed with the colour of its thoughts.",
    who: "Marcus Aurelius",
    era: "Meditations, c. 170 CE",
  },
  {
    text: "Luck is what happens when preparation meets opportunity.",
    who: "Seneca",
    era: "attributed",
  },
];
