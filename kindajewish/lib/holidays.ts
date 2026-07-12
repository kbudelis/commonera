export type Holiday = {
  slug: string;
  name: string;
  dates: string;
  /** Approximate month (1-12) used only to order "what's coming up" — the Jewish calendar is lunar, so exact dates shift every year. */
  approxMonth: number;
  image: string;
  whatItIs: string;
  whyItMatters: string;
  tonight: string;
  recipeName: string;
  recipeSource: string;
  recipeUrl: string;
  utilityLink?: { label: string; desc: string; url: string };
};

export const holidays: Holiday[] = [
  {
    slug: "rosh-hashanah",
    name: "Rosh Hashanah",
    dates: "Sept 11–13, 2026",
    approxMonth: 9,
    image: "/images/holidays/rosh-hashanah.jpg",
    whatItIs:
      "The Jewish new year — two days marking the start of a new calendar cycle. It's less \"party\" and more \"quiet reset\": a chance to think about the year behind you and the one ahead.",
    whyItMatters:
      "You don't need to believe in divine judgment to like the idea of a built-in checkpoint. It's a culturally sanctioned excuse to actually reflect instead of just letting January 1st do it for you.",
    tonight:
      "Dip apple slices in honey and say out loud one thing you want the new year to be sweeter about. That's it. That's the ritual.",
    recipeName: "Apple & Honey Cake",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
  },
  {
    slug: "yom-kippur",
    name: "Yom Kippur",
    dates: "Sept 20–21, 2026",
    approxMonth: 9,
    image: "/images/holidays/yom-kippur.jpg",
    whatItIs:
      "The Day of Atonement — traditionally a 25-hour fast focused on repair: with yourself, with other people, with whatever you consider bigger than you.",
    whyItMatters:
      "Even secularized, it's a rare cultural permission slip to sit with what you got wrong this year without immediately moving on. Most calendars don't build that in.",
    tonight:
      "Skip the fast if it's not for you — instead, write down one relationship you want to repair, and send one text.",
    recipeName: "Break-the-Fast Bagel Spread",
    recipeSource: "Kveller",
    recipeUrl: "https://www.kveller.com/",
  },
  {
    slug: "hanukkah",
    name: "Hanukkah",
    dates: "Dec 4–12, 2026",
    approxMonth: 12,
    image: "/images/holidays/hanukkah.jpg",
    whatItIs:
      "Eight nights commemorating a small group holding out against long odds, and a bit of oil lasting way longer than it should have. It's a minor holiday that got major by proximity to December.",
    whyItMatters:
      "No theology required to like lighting candles in the dark in the middle of winter, or to enjoy that everything traditional is fried.",
    tonight:
      "Light one candle, even just one night, even without the rest of the set. Order latkes if you don't want to fry your apartment out.",
    recipeName: "Crispy Latkes, No Special Equipment",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
  },
  {
    slug: "passover",
    name: "Passover",
    dates: "Apr 1–9, 2027",
    approxMonth: 3,
    image: "/images/holidays/passover.jpg",
    whatItIs:
      "An eight-day retelling of the exodus from slavery in Egypt, centered on one long dinner (the seder) that's part story, part ritual, part just a big meal with symbolic snacks.",
    whyItMatters:
      "It's fundamentally a story about freedom, told at a table, with your specific weird family. You don't need to buy the history as literal to get something out of retelling it together.",
    tonight:
      "Can't do a full seder? Just eat matzo with someone and ask out loud: what does freedom look like for you this year?",
    recipeName: "Matzo Ball Soup, Actually Good",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
  },
  {
    slug: "shabbat",
    name: "Shabbat",
    dates: "Every Friday sundown – Saturday night",
    approxMonth: 0,
    image: "/images/holidays/shabbat.jpg",
    whatItIs:
      "A weekly day of rest, running sundown Friday to nightfall Saturday. Traditionally: no work, no phone, candles and a meal. In practice, it scales to whatever you want it to mean.",
    whyItMatters:
      "It's the original scheduled unplug — built centuries before \"digital detox\" was a wellness trend. You don't need synagogue for that part.",
    tonight:
      "Light two candles Friday night, put your phone in another room for an hour, and eat something with someone you like.",
    recipeName: "No-Knead Challah",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
    utilityLink: {
      label: "This week's candle-lighting time for your city",
      desc: "Times · via Hebcal",
      url: "https://www.hebcal.com/shabbat",
    },
  },
  {
    slug: "sukkot",
    name: "Sukkot",
    dates: "Sept 25–Oct 2, 2026",
    approxMonth: 10,
    image: "/images/holidays/sukkot.jpg",
    whatItIs:
      "A week-long harvest festival where the tradition is to eat (and sometimes sleep) in a temporary outdoor hut. It's the most literally \"outdoor dinner party\" holiday on the calendar.",
    whyItMatters:
      "Fall, string lights, eating outside while you still can — it's a built-in reason to gather people before it gets cold.",
    tonight: "Eat dinner outside, even on a balcony or fire escape. That's basically the whole idea.",
    recipeName: "Roasted Harvest Vegetables",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
  },
  {
    slug: "purim",
    name: "Purim",
    dates: "Mar 3, 2027",
    approxMonth: 3,
    image: "/images/holidays/purim.jpg",
    whatItIs:
      "A raucous holiday celebrating a story where a Jewish woman (Esther) foils a plot against her people — marked with costumes, noisemakers, and being loud on purpose.",
    whyItMatters:
      "It's basically Jewish Halloween-meets-costume-happy-hour. Low barrier, high fun, no fasting involved.",
    tonight: "Make hamantaschen (or just buy them) and put on a costume for absolutely no reason.",
    recipeName: "Hamantaschen, Any Filling",
    recipeSource: "The Nosher",
    recipeUrl: "https://www.myjewishlearning.com/the-nosher/",
  },
];

export function getHoliday(slug: string) {
  return holidays.find((h) => h.slug === slug);
}

/** Naive "what's next" based on today's month — approximate, since the Jewish calendar is lunar and shifts every year. Shabbat (weekly) is excluded from this rotation. */
export function getUpcomingHoliday(today: Date = new Date()) {
  const month = today.getMonth() + 1;
  const dated = holidays.filter((h) => h.approxMonth > 0);
  const next = dated.find((h) => h.approxMonth >= month);
  return next ?? dated[0];
}
