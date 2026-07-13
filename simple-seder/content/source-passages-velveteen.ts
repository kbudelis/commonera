/**
 * Exact, whitespace-normalized excerpts from the local v9 PDF.
 * Internal provenance is intentionally richer than reader-facing credits.
 * Beginner directions must be assembled separately from `reading` passages.
 */
export const VELVETEEN_V9_WORK = {
  id: "velveteen-rabbi-v9",
  title: "The Velveteen Rabbi’s Haggadah for Pesach",
  compiler: "Rabbi Rachel Barenblat",
  localFile: "research/source-materials/Velveteen Rabbi Haggadah v9.pdf",
  readerCredit: "The Velveteen Rabbi’s Haggadah for Pesach — Rabbi Rachel Barenblat (used with permission).",
} as const;

export type VelveteenSectionId =
  | "kadesh" | "urchatz" | "karpas" | "yachatz" | "maggid" | "rachtzah"
  | "motzi-matzah" | "maror" | "korech" | "shulchan-orech" | "tzafun"
  | "barech" | "hallel" | "nirtzah";
export type PassageTier = 20 | 45 | 90;
export type VelveteenPassageRole = "reading" | "ritual-direction" | "orientation";

export interface VelveteenPassage {
  id: string;
  sectionId: VelveteenSectionId;
  role: VelveteenPassageRole;
  text: string;
  pdfPages: number[];
  printedHeading: string;
  /** Exact adjacent/byline/footnote attribution printed in v9; null means none is printed. */
  printedAttribution: string | null;
  attributionStatus: "haggadah-editorial-voice" | "third-party-attributed" | "traditional-liturgy";
  containingHaggadah: typeof VELVETEEN_V9_WORK.id;
  provenanceHash: string;
  hashBasis: "sha256:utf8-normalized-whitespace";
}

const PROVENANCE_HASHES: Record<string, string> = {
  "vr9-kadesh-first-cup": "1b5a961a791f270f5e74bce49e7c243f5142b02585dd83ad94ed9781f9672fc7",
  "vr9-kadesh-candles": "39741695493e289240e20d2732d60fda5384811a7f686d2dd654f963113b86bf",
  "vr9-urchatz-miriams-well": "06767f816a4d54625ec6b6b2caa798f9a83a5f5a194a56f3da8fafe2e13a4aa2",
  "vr9-karpas-renewal": "b5ddbc15d8ced157e2bf54eda2d27d48b4f87dcf4b79f3b8e857dcae417dd307",
  "vr9-karpas-action": "38cc5f8af3a3e681b8bd51147b69007b5d35085f81feaa89e82382a9deaa59ce",
  "vr9-yachatz-broken": "acd25a9ca5ef6b4c8fb5b6631642f9fdbce4d0a22cdc0678f3d7938fe4419563",
  "vr9-yachatz-action": "a3a66aba8462f66820eca342cab43cd863e8c95f0bf96bbdb31521eb423e1e7e",
  "vr9-maggid-opening": "31127afb9826373e974d038d3b94258b9cce7763d9e884b06ed73a37843fb268",
  "vr9-maggid-journeys": "f3f7e3117b2ce78cc1f2431b56308b8d661ba711b4e3889edfc9b8c06f90afd2",
  "vr9-maggid-once-slaves": "e754ce9c81917b640e6276b45d2bb1a2d373bcf755a25847630dc70fe8747268",
  "vr9-maggid-plague-grief": "13a98f88983249af107227a451c8f2c1237991b35eb12f2395827a5942464347",
  "vr9-maggid-dayenu-next-step": "6acd494aa4858fb46833e47bbb856e4a51c23631d9dc447d496478009dbd9600",
  "vr9-maggid-second-cup": "72d52d8fe73d005031f4f25f5de788dd7b4e5c8e663b7a4f37370bc30028233f",
  "vr9-rachtzah-holy-hands": "3d55632d9c7d07e2fb3e19a5a8f5a2d4f9ff4ef7c107faaf11b68aaee680f14f",
  "vr9-motzi-seize-liberation": "11a0c9be26a3cf64ca45b6bf5301decf946d25a81a62ae34158e2a3ed39e9871",
  "vr9-maror-bitterness": "d2b5fe1d5e2e3151f7e86863255d193c6e849b2cd531833c0d80cd54ec7df01d",
  "vr9-korech-sweetening": "20be32a6de74f23a5c7c15dea73562e94851cf8326a6c7e9cf671644bfa4118e",
  "vr9-meal-stew-pot": "a9c4ab41fb1d7e2347e2fbc9d525ec43c531ac3a631e86a3b7e7a2caf19226ef",
  "vr9-tzafun-hidden": "79ff3e4790e5d40f461f97ffe53eb7be91920cdf15e9a33c83862974de0a3c68",
  "vr9-tzafun-action": "604971272bcd67173305f7b40f61755bb5c902e0b5ff341690119a5427a224b5",
  "vr9-barech-listen": "e2397276d0efa78e6f2316445a45a1dc4232a7e1509a24d7c27c270200f5a42a",
  "vr9-hallel-rain": "5f5204419f323712660479b30424e1c79403a59bcf4ee6a1c26e2a4222137ca9",
  "vr9-hallel-praise-wet-snow": "6b1aeba87c06a771cba2be0c1f995e9989ce4f8123e8a8fdbf48c84a876ac9aa",
  "vr9-hallel-psalm117": "208828c414971d12b542a685398a6de3d2ca0b6a786d3386b7c9425b98286ec2",
  "vr9-nirtzah-legacy": "bbb556c7da7a8ea92ab2527afa70a44a0e711c82329332654c35f7ec3f188a88",
  "vr9-nirtzah-shores": "802da3da41dda58ac76d4ced4db3124542518e63cce74ff8a83f62dd668d40e4",
};

type VelveteenPassageSeed = Omit<VelveteenPassage, "provenanceHash">;
const p = (passage: VelveteenPassageSeed): VelveteenPassage => ({ ...passage, provenanceHash: PROVENANCE_HASHES[passage.id] ?? "" });

export const velveteenPassages: VelveteenPassage[] = [
  p({ id: "vr9-kadesh-first-cup", sectionId: "kadesh", role: "reading", pdfPages: [11], printedHeading: "Why Four Cups?", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "This first cup of wine reminds us of God’s first declaration: I will bring you out from the oppression…”" }),
  p({ id: "vr9-kadesh-candles", sectionId: "kadesh", role: "reading", pdfPages: [10], printedHeading: "Sanctifying the Day", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "May the candles we kindle tonight bring radiance to all who live in darkness. May their light rouse us to work toward liberation everywhere." }),
  p({ id: "vr9-urchatz-miriams-well", sectionId: "urchatz", role: "reading", pdfPages: [14], printedHeading: "Urchatz: Washing the Hands", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "This symbolic hand-washing recalls Miriam's Well. This well followed Miriam, sister of Moses, through the desert. Filled with waters of life, the well was a source of strength and renewal to all. One drink from its waters was said to alert the heart, mind and soul, and make the meaning of Torah more clear. When we wash hands again later, we will say blessings to sanctify that act. This hand-washing is purely symbolic, and therefore the blessing is unspoken." }),
  p({ id: "vr9-karpas-renewal", sectionId: "karpas", role: "reading", pdfPages: [15], printedHeading: "Karpas: Eat a Green Vegetable", printedAttribution: "R. David Markus, drawing on Song of Songs & Midrash", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Rise up, my love, my fair one. Let’s go! Let’s go! At last winter is past: the storms are over. Flowers appear: the time for song has come. The song of love birds is heard in our midst. See produce growing ripe, dewdrops of blessing Bringing food for the hungry, healing for the sick. Let grape vines blossom as heaven yields us dew. Let us journey toward this bounty of renewal. We dip for the tears of our ancestors, held captive without rights or dignity. We dip for the tears of our forebears, exiled from home with nowhere to go. We dip for health and healing, for tears of loss, hope, and resilience." }),
  p({ id: "vr9-karpas-action", sectionId: "karpas", role: "ritual-direction", pdfPages: [15], printedHeading: "Karpas: Eat a Green Vegetable", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "As we distribute a green vegetable dipped in salt water, we read together:" }),
  p({ id: "vr9-yachatz-broken", sectionId: "yachatz", role: "reading", pdfPages: [16], printedHeading: "Yachatz: Break the Middle Matzah", printedAttribution: "Adapted from R' Jill Hammer", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Broken bread waits on our table. The whole is already broken. Everything whole in the world has an edge where it broke off something or was cut away. The bread we are about to break is already broken. This Passover night, time is cracking open. Wholeness is not the egg: it’s the tap tap tap of the wet-winged baby bird trying to get out. Break the bread at the feast of liberation. Go ahead. Do it. The whole is already broken, and so are you. Freedom has to have its jagged edges. But keep half for later – because this story isn’t whole, and it isn’t over." }),
  p({ id: "vr9-yachatz-action", sectionId: "yachatz", role: "ritual-direction", pdfPages: [17], printedHeading: "The Bread of Affliction", printedAttribution: "Found in A Quest for Our Times: the Louis Jacobs Haggadah.", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Close the door. Break a middle matzah and wrap the larger half in a cloth; it is the afikoman." }),
  p({ id: "vr9-maggid-opening", sectionId: "maggid", role: "reading", pdfPages: [18], printedHeading: "Maggid: Tell the Story", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Maggid, the Hebrew word for “story,” is at the root of the word haggadah. In re-telling the story of the Exodus, we speak ourselves into our communal past." }),
  p({ id: "vr9-maggid-journeys", sectionId: "maggid", role: "reading", pdfPages: [19], printedHeading: "Maggid", printedAttribution: "Lisa S. Greene", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "With maggid we tell the story, The exodus from degradation to dignity, M'g'nut l'shevach, From slavery to freedom. Each of us is to tell this story and we who do so at length are surely to be praised. But this collective story of the journey from slavery to freedom is not the entirety of the tale. Each of us bears our own stories which relate our journeys, our paths to freedom. If each of us must relate our people's story all the more so should we be praised for continuing the story adding the individual strands which make our identity, which explain our journeys. To journey is to prepare, to leave, to travel, to wander and wonder. To journey is to arrive, to accustom, to question, to change, to remain as we were, yet touched by the journey. What are our journeys from slavery to liberation from alienation to community from afar to within from foreign to familiar from anxiety to comfort from narrow spaces to expanse? As we answer, we continue maggid. We tell our stories." }),
  p({ id: "vr9-maggid-once-slaves", sectionId: "maggid", role: "reading", pdfPages: [20], printedHeading: "Once Were Slaves", printedAttribution: null, attributionStatus: "traditional-liturgy", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "We were slaves to a Pharaoh in Egypt, and the Eternal led us out from there with a mighty hand and an outstretched arm. Had not the Holy One led our ancestors out of Egypt, we and our children and our children’s children would still be enslaved. Therefore, even if all of us were wise, all-discerning, scholars, sages and learned in Torah, it would still be our duty to tell the story of the Exodus." }),
  p({ id: "vr9-maggid-plague-grief", sectionId: "maggid", role: "reading", pdfPages: [37], printedHeading: "The Ten Plagues", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Midrash teaches that, while watching the Egyptians succumb to the ten plagues, the angels broke into songs of jubilation. God rebuked them, saying “My creatures are perishing, and you sing praises?” As we recite each plague, we spill a drop of wine—symbol of joy—from our cups. Our joy in our liberation will always be tarnished by the pain visited upon the Egyptians." }),
  p({ id: "vr9-maggid-dayenu-next-step", sectionId: "maggid", role: "reading", pdfPages: [39], printedHeading: "Dayenu: It Would Have Been Enough", printedAttribution: "The Shalom Seders, compiled by New Jewish Agenda (Adamah Books, 1984), p. 25.", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Dayenu means we celebrate each step toward freedom as if it were enough, then seek the next step. It means sing each verse as if it were the whole song—and then sing the next verse." }),
  p({ id: "vr9-maggid-second-cup", sectionId: "maggid", role: "reading", pdfPages: [43], printedHeading: "Second Cup of Wine", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "The second cup of wine represents God’s second declaration of redemption: “I will free you from slavery.”" }),
  p({ id: "vr9-rachtzah-holy-hands", sectionId: "rachtzah", role: "reading", pdfPages: [47], printedHeading: "Rachtza: Wash the Hands", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "What does washing our hands tell us? That bodies are sacred and deserving of care. It is our hands that plant and write, that caress and create—and also our hands that strike and poison and smash. We wash our hands not to absolve ourselves of responsibility, but to affirm the need to make our hands holy. At this season of freedom and rebirth, we consecrate our hands to the task of building freedom for all who suffer." }),
  p({ id: "vr9-motzi-seize-liberation", sectionId: "motzi-matzah", role: "reading", pdfPages: [48], printedHeading: "Motzi/Matzah: Bless and Eat", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "We eat matzah because our ancestors had no time to wait for dough to rise. Matzah reminds us that when the chance for liberation comes, we must seize it even if we do not feel ready. Indeed, if we wait until we feel fully ready, we may never act at all." }),
  p({ id: "vr9-maror-bitterness", sectionId: "maror", role: "reading", pdfPages: [49], printedHeading: "Maror: Bitter Herb", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Why do we eat maror? Maror represents the bitterness of bondage. We don't pretend away life's bitterness. Instead, we let ourselves taste the bitterness, as our ancestors have done before us. Only when we let ourselves feel the bitterness can we experience sweetness fully." }),
  p({ id: "vr9-korech-sweetening", sectionId: "korech", role: "reading", pdfPages: [49], printedHeading: "Korech: The Hillel Sandwich", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "The sage Hillel originated the tradition of eating a sandwich of all the food symbols balanced together. “I dedicate myself to sweetening every bitterness.”" }),
  p({ id: "vr9-meal-stew-pot", sectionId: "shulchan-orech", role: "reading", pdfPages: [55], printedHeading: "Blessing of the Stew Pot", printedAttribution: "Alla Renee Bozarth, from This Is My Body: Praying for Earth, Prayers from the Heart (iUniverse, 2004).", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Blessed be the Creator and all creative hands which plant and harvest, pack and haul and hand over sustenance— Blessed be carrot and cow, potato and mushroom, tomato and bean, parsley and peas onion and thyme, garlic and bay leaf, pepper and water, marjoram and oil, and blessed be fire— and blessed be the enjoyment of nose and eye, and blessed be color— and blessed be the Creator for the miracle of red potato, for the miracle of green bean, for the miracle of fawn mushrooms and blessed be God for the miracle of earth: ancestors, grass, bird, deer and all gone, wild creatures whose bodies became carrots, peas, and wild flowers, who give sustenance to human hands, whose agile dance of music nourishes the ear and soul of the dog resting under the stove and the woman working over the stove and the geese out the open window strolling in the backyard. And blessed be God for all, all, all." }),
  p({ id: "vr9-tzafun-hidden", sectionId: "tzafun", role: "reading", pdfPages: [50], printedHeading: "Tzafun: Afikoman", printedAttribution: "Adapted from R. Arthur Waskow", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Tzafun means “hidden,” and the afikoman is hidden for children to find. Why end the meal thus? Because we want the dinner to end with the taste of slavery and freedom in our mouths. But this explains eating matzah late, not the charade of hiding it. We hide the larger half of the broken matzah because we are affirming that there is more that is hidden and mysterious in the world than any information we can gather." }),
  p({ id: "vr9-tzafun-action", sectionId: "tzafun", role: "ritual-direction", pdfPages: [50], printedHeading: "Tzafun: Afikoman", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Find the afikoman and distribute it to all who are seated at the table." }),
  p({ id: "vr9-barech-listen", sectionId: "barech", role: "reading", pdfPages: [50], printedHeading: "Barech: Bless the Meal", printedAttribution: "W. S. Merwin, from Earth Prayers (San Francisco: Harper, 1991), p. 244.", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Listen with the night falling we are saying thank you we are stopping on the bridges to bow from the railings we are running out of the glass rooms with our mouths full of food to look at the sky and say thank you…" }),
  p({ id: "vr9-hallel-rain", sectionId: "hallel", role: "reading", pdfPages: [57], printedHeading: "Rain falls", printedAttribution: "Kris Lindbeck", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Rain falls through sunlight and we drop everything to stand on the porch to see how tears become jewels in God's eyes" }),
  p({ id: "vr9-hallel-praise-wet-snow", sectionId: "hallel", role: "reading", pdfPages: [57], printedHeading: "from Praise wet snow falling early", printedAttribution: "Denise Levertov, from Earth Prayers, p. 222.", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Praise the invisible sun burning beyond the white cold sky, giving us light and the chimney’s shadow. Praise god or the gods, the unknown, that which imagined us, which stays our hand, our murderous hand, and gives us still, in the shadow of death, our daily life, and the dream still of goodwill, of peace on earth. Praise flow and change, night and the pulse of day." }),
  p({ id: "vr9-hallel-psalm117", sectionId: "hallel", role: "reading", pdfPages: [60], printedHeading: "from Psalm 117", printedAttribution: "Psalm 117 ‘translation’ (version) from zen abbot Norman Fischer's Opening to You, p. 148", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Nations, give praise People, give praise For strong is your steadfast love in us And your truth is a durable truth Without end— Praise that" }),
  p({ id: "vr9-nirtzah-legacy", sectionId: "nirtzah", role: "reading", pdfPages: [69], printedHeading: "Nirtzah: Conclusion", printedAttribution: null, attributionStatus: "haggadah-editorial-voice", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Tonight we have acknowledged our ancestors. We vow that we will not allow their stories, their experiences, their wisdom to fade. These are our legacy, which we will study and teach to our friends and children. The task of liberation is long, and it is work we ourselves must do." }),
  p({ id: "vr9-nirtzah-shores", sectionId: "nirtzah", role: "reading", pdfPages: [72], printedHeading: "Standing on the shores", printedAttribution: "adapted from Michael Walzer; found in Mishkan T’filah", attributionStatus: "third-party-attributed", containingHaggadah: "velveteen-rabbi-v9", hashBasis: "sha256:utf8-normalized-whitespace", text: "Standing on the parted shores of history we still believe what we were taught before ever we stood at Sinai’s foot; that wherever we go, it is eternally Egypt that there is a better place, a promised land; that the winding way to that promise passes through the wilderness that there is no way to get from here to there except by joining hands, marching together." }),
];

export interface VelveteenSectionPack {
  sectionId: VelveteenSectionId;
  readingPassageIdsByTier: Record<PassageTier, string[]>;
  actionPassageIds: string[];
  coverageNote: string;
}

const tiers = (short: string[], medium = short, long = medium): Record<PassageTier, string[]> => ({ 20: short, 45: medium, 90: long });

export const velveteenSectionPacks: VelveteenSectionPack[] = [
  { sectionId: "kadesh", readingPassageIdsByTier: tiers(["vr9-kadesh-first-cup"], ["vr9-kadesh-first-cup", "vr9-kadesh-candles"]), actionPassageIds: [], coverageNote: "Two coherent v9 readings; no beginner cup-pouring direction is treated as reading." },
  { sectionId: "urchatz", readingPassageIdsByTier: tiers(["vr9-urchatz-miriams-well"]), actionPassageIds: [], coverageNote: "One substantial source reading supports every tier." },
  { sectionId: "karpas", readingPassageIdsByTier: tiers(["vr9-karpas-renewal"]), actionPassageIds: ["vr9-karpas-action"], coverageNote: "Reading and ritual direction are stored separately." },
  { sectionId: "yachatz", readingPassageIdsByTier: tiers(["vr9-yachatz-broken"]), actionPassageIds: ["vr9-yachatz-action"], coverageNote: "One long coherent reading; action remains separate." },
  { sectionId: "maggid", readingPassageIdsByTier: tiers(
    ["vr9-maggid-opening"],
    ["vr9-maggid-opening", "vr9-maggid-journeys", "vr9-maggid-once-slaves"],
    ["vr9-maggid-opening", "vr9-maggid-journeys", "vr9-maggid-once-slaves", "vr9-maggid-plague-grief", "vr9-maggid-dayenu-next-step", "vr9-maggid-second-cup"],
  ), actionPassageIds: [], coverageNote: "Longer tiers add exact source ritual and narrative passages for slavery, plague grief, Dayenu, and the second cup." },
  { sectionId: "rachtzah", readingPassageIdsByTier: tiers(["vr9-rachtzah-holy-hands"]), actionPassageIds: [], coverageNote: "One substantial source reading supports every tier." },
  { sectionId: "motzi-matzah", readingPassageIdsByTier: tiers(["vr9-motzi-seize-liberation"]), actionPassageIds: [], coverageNote: "One coherent source reading supports every tier." },
  { sectionId: "maror", readingPassageIdsByTier: tiers(["vr9-maror-bitterness"]), actionPassageIds: [], coverageNote: "One coherent source reading supports every tier." },
  { sectionId: "korech", readingPassageIdsByTier: tiers(["vr9-korech-sweetening"]), actionPassageIds: [], coverageNote: "Only one short coherent reading is supported in v9; longer tiers intentionally reuse it." },
  { sectionId: "shulchan-orech", readingPassageIdsByTier: tiers(["vr9-meal-stew-pot"]), actionPassageIds: [], coverageNote: "One long, fully attributed meal blessing supports every tier." },
  { sectionId: "tzafun", readingPassageIdsByTier: tiers(["vr9-tzafun-hidden"]), actionPassageIds: ["vr9-tzafun-action"], coverageNote: "Reading and find/distribute direction are stored separately." },
  { sectionId: "barech", readingPassageIdsByTier: tiers(["vr9-barech-listen"]), actionPassageIds: [], coverageNote: "Only one short attributed reading is encoded; longer liturgical options remain a future review." },
  { sectionId: "hallel", readingPassageIdsByTier: tiers(["vr9-hallel-rain"], ["vr9-hallel-rain", "vr9-hallel-praise-wet-snow"], ["vr9-hallel-rain", "vr9-hallel-praise-wet-snow", "vr9-hallel-psalm117"]), actionPassageIds: [], coverageNote: "Distinct additive readings support all three tiers." },
  { sectionId: "nirtzah", readingPassageIdsByTier: tiers(["vr9-nirtzah-legacy"], ["vr9-nirtzah-legacy", "vr9-nirtzah-shores"]), actionPassageIds: [], coverageNote: "The 45/90 tier adds a complete attributed closing reflection." },
];

export const VELVETEEN_SECTION_ORDER: VelveteenSectionId[] = ["kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah", "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun", "barech", "hallel", "nirtzah"];

export function validateVelveteenPassagePack(): string[] {
  const errors: string[] = [];
  const ids = new Set(velveteenPassages.map((passage) => passage.id));
  if (ids.size !== velveteenPassages.length) errors.push("Velveteen passage IDs must be unique.");
  VELVETEEN_SECTION_ORDER.forEach((sectionId, index) => {
    const pack = velveteenSectionPacks[index];
    if (!pack || pack.sectionId !== sectionId) errors.push(`Section pack ${index + 1} must be ${sectionId}.`);
    for (const tier of [20, 45, 90] as const) {
      const readingIds = pack?.readingPassageIdsByTier[tier] ?? [];
      if (readingIds.length === 0) errors.push(`${sectionId} requires at least one exact reading at ${tier} minutes.`);
      for (const id of readingIds) {
        const passage = velveteenPassages.find((candidate) => candidate.id === id);
        if (!passage) errors.push(`${sectionId} ${tier}-minute tier references unknown passage ${id}.`);
        else if (passage.sectionId !== sectionId || passage.role !== "reading") errors.push(`${id} is not a reading for ${sectionId}.`);
      }
    }
    for (const id of pack?.actionPassageIds ?? []) {
      const passage = velveteenPassages.find((candidate) => candidate.id === id);
      if (!passage || passage.sectionId !== sectionId || passage.role === "reading") errors.push(`${id} is not a separate action/orientation passage for ${sectionId}.`);
    }
  });
  for (const passage of velveteenPassages) {
    if (!passage.text.trim()) errors.push(`${passage.id} has empty text.`);
    if (passage.pdfPages.length === 0) errors.push(`${passage.id} lacks a PDF page locator.`);
    if (passage.attributionStatus === "third-party-attributed" && !passage.printedAttribution) errors.push(`${passage.id} must preserve its printed third-party attribution.`);
    if (!/^[a-f0-9]{64}$/.test(passage.provenanceHash)) errors.push(`${passage.id} lacks a valid SHA-256 provenance hash.`);
  }
  return [...new Set(errors)];
}
