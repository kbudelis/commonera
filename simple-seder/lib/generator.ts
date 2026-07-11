import {
  coverOptions,
  quoteCatalog,
  sectionBlueprints,
  themeInserts,
  themeLabels,
  toneOpeners,
} from "../content/pack";
import {
  passagesForSpine,
  sourceSpines,
  sourceShareMetrics,
  validateAssembly,
  type AssemblyBlock,
  type HaggadahAssembly,
  type HouseCopyRole,
  type PrimarySourceId,
  type SederSectionId,
} from "../content/source-spines";
import {
  assertEditorial,
  EDITORIAL_SECTION_ORDER,
  validateEditorial,
} from "./editorial";
import type {
  GenerationProfile,
  HaggadahDocument,
  HaggadahSection,
  QuoteEntry,
  SederPlateGuideEntry,
  ThemeId,
} from "./types";

export const SECTION_ORDER = [...EDITORIAL_SECTION_ORDER];

export interface ModelEnhancement {
  quoteIds?: string[];
  coverId?: string;
  bridges?: Record<string, string>;
}

function quoteSectionsForLength(length: GenerationProfile["length"]): string[] {
  void length;
  return ["maggid", "nirtzah"];
}

const quoteContexts: Record<string, string> = {
  kadesh: "A line to help us enter the evening with intention:",
  maggid: "A voice on liberation and the work it asks of us:",
  nirtzah: "A closing line to carry beyond the table:",
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableProfile(profile: GenerationProfile): string {
  return JSON.stringify({
    ...profile,
    themes: [...profile.themes],
  });
}

function deterministicItem<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) {
    throw new Error("Cannot select from an empty editorial catalog.");
  }
  return items[stableHash(seed) % items.length];
}

function selectedThemes(profile: GenerationProfile): ThemeId[] {
  const unique = [...new Set(profile.themes)];
  return unique.length > 0 ? unique : ["traditional"];
}

type RuntimeSpineId = "shir-geulah-primary" | "velveteen-rabbi-primary";

/**
 * Choose a complete source voice before assembling any section. The selection
 * is profile-based, not paragraph-based, so one Haggadah never oscillates
 * between source styles.
 */
function selectSourceSpine(profile: GenerationProfile): RuntimeSpineId {
  if (profile.audience !== "adults") return "shir-geulah-primary";

  const reflectiveThemes = new Set<ThemeId>([
    "environment",
    "mindfulness",
    "family-storytelling",
  ]);
  const reflectiveScore = selectedThemes(profile).filter((theme) => reflectiveThemes.has(theme)).length;
  if (profile.tone === "reverent" && reflectiveScore > 0) {
    return "velveteen-rabbi-primary";
  }
  if (reflectiveScore >= 2 && !profile.themes.includes("social-justice")) {
    return "velveteen-rabbi-primary";
  }
  return "shir-geulah-primary";
}

function sourceIdForSpine(spineId: RuntimeSpineId): PrimarySourceId {
  return spineId === "shir-geulah-primary" ? "shir-geulah" : "velveteen-rabbi";
}

function selectCover(profile: GenerationProfile): string {
  const themes = selectedThemes(profile);
  const candidates = coverOptions.filter((cover) =>
    cover.themes.some((theme) => themes.includes(theme)),
  );
  return deterministicItem(
    candidates.length > 0 ? candidates : coverOptions,
    `cover:${stableProfile(profile)}`,
  ).id;
}

function selectQuotes(
  profile: GenerationProfile,
  sectionIds: string[],
): Map<string, QuoteEntry> {
  const themes = selectedThemes(profile);
  const profileKey = stableProfile(profile);
  const candidates = new Map(
    sectionIds.map((sectionId, slot) => [
      sectionId,
      quoteCatalog
        .filter(
          (quote) =>
            quote.approved &&
            quote.sectionIds.includes(sectionId) &&
            quote.themes.some((theme) => themes.includes(theme)),
        )
        .sort(
          (left, right) =>
            stableHash(`quote:${slot}:${sectionId}:${left.id}:${profileKey}`) -
            stableHash(`quote:${slot}:${sectionId}:${right.id}:${profileKey}`),
        ),
    ]),
  );
  const selected = new Map<string, QuoteEntry>();
  const used = new Set<string>();

  function place(index: number): boolean {
    if (index === sectionIds.length) return true;
    const sectionId = sectionIds[index];
    for (const quote of candidates.get(sectionId) ?? []) {
      if (used.has(quote.id)) continue;
      used.add(quote.id);
      selected.set(sectionId, quote);
      if (place(index + 1)) return true;
      used.delete(quote.id);
      selected.delete(sectionId);
    }
    return false;
  }

  if (!place(0)) {
    throw new Error(`The approved quote catalog cannot supply unique quotations for ${themes.join(", ")} across ${sectionIds.join(", ")}.`);
  }
  return selected;
}

function audienceBridge(profile: GenerationProfile, sectionIndex: number): string {
  const sectionId = sectionBlueprints[sectionIndex].id;
  if (profile.audience === "kids") {
    return kidParticipation[sectionId];
  }

  const neutral = tableParticipation[sectionId];
  const focusSections = new Set(["maggid", "nirtzah"]);
  if (profile.themes.length === 0 || !focusSections.has(sectionId)) return neutral;

  const themes = selectedThemes(profile);
  const theme = sectionId === "maggid" ? themes[0] : themes[1] ?? themes[0];
  const insertIndex = contextualThemeInsertIndex[theme][sectionId];
  const insert = themeInserts[theme][insertIndex];
  return `${neutral} ${insert.text}`;
}

const kidParticipation: Record<string, string> = {
  kadesh: "Invite a child to help pour a little grape juice into each cup, then lift the cups together.",
  urchatz: "Children may wash their own hands, or take turns with a partner: one person holds their hands over the basin while the other gently pours water from the pitcher, then they switch roles.",
  karpas: "Let children dip their own parsley or celery in the salt water and describe how it tastes.",
  yachatz: "Show children which piece of matzah becomes the afikoman. They will search for it after dinner, and the finder often receives a small prize.",
  maggid: "Invite children to ask the Four Questions, remove one drop of grape juice for each plague, and sing Dayenu. For a hands-on option, make ten plague picture cards with paper and crayons; children can hold up each card as its plague is named.",
  rachtzah: "Children may wash their own hands before the matzah, or work in pairs over the basin: one pours gently from the pitcher while the other washes, then they switch.",
  "motzi-matzah": "Pass a small piece of matzah to each child and taste it together after the blessing.",
  maror: "Offer each child a tiny taste of romaine lettuce or mild horseradish; they may taste, smell, or pass.",
  korech: "Let children build a small matzah sandwich with a little charoset and, if they want, a mild bitter green.",
  "shulchan-orech": "Give children a dinner job, such as passing napkins, serving water, or asking an adult about a family recipe.",
  tzafun: "Children search for the hidden afikoman. When they return it, give the agreed small prize and share the matzah with everyone.",
  barech: "Invite children to name one person or thing they want to thank after the meal.",
  hallel: "Choose a song with an easy chorus so children can sing, clap, hum, or listen.",
  nirtzah: "Ask each child to name one kind action they want to try after the seder.",
};

const tableParticipation: Record<string, string> = {
  kadesh: "Invite each person to say their name and one hope for the evening.",
  urchatz: "Guests may wash their own hands, or take turns pouring water for one another over the basin; explain both options before passing the pitcher.",
  karpas: "Pass the greens and salt water together before anyone begins eating.",
  yachatz: "Show both pieces of matzah clearly before wrapping and hiding the larger one.",
  maggid: "Share the reading among willing voices; anyone may ask a question or pass.",
  rachtzah: "Make the bowl, pitcher, and towel easy to find. Guests may wash their own hands or pour water for a partner over the basin.",
  "motzi-matzah": "Wait until everyone has a piece of matzah before eating together.",
  maror: "Offer a mild option and make clear that tasting, smelling, or passing are all welcome.",
  korech: "Set out the ingredients so each person can make a small sandwich or pass.",
  "shulchan-orech": "Name the dishes and any allergens, then invite everyone to begin the meal.",
  tzafun: "Bring everyone back to the table before dividing and eating the afikoman.",
  barech: "Give people a moment to settle after the meal before beginning grace.",
  hallel: "Choose a melody or responsive reading that newcomers can join after hearing one line.",
  nirtzah: "End by letting each person name one thought or action they want to carry forward.",
};

const contextualThemeInsertIndex: Record<ThemeId, Record<string, number>> = {
  feminist: { karpas: 1, maggid: 0, "shulchan-orech": 11, nirtzah: 8 },
  lgbtq: { karpas: 7, maggid: 0, "shulchan-orech": 1, nirtzah: 10 },
  "social-justice": { karpas: 6, maggid: 0, "shulchan-orech": 6, nirtzah: 1 },
  environment: { karpas: 0, maggid: 1, "shulchan-orech": 7, nirtzah: 11 },
  interfaith: { karpas: 2, maggid: 4, "shulchan-orech": 10, nirtzah: 7 },
  secular: { karpas: 2, maggid: 1, "shulchan-orech": 9, nirtzah: 11 },
  mindfulness: { karpas: 2, maggid: 7, "shulchan-orech": 6, nirtzah: 11 },
  traditional: { karpas: 4, maggid: 5, "shulchan-orech": 2, nirtzah: 11 },
  "family-storytelling": { karpas: 6, maggid: 0, "shulchan-orech": 1, nirtzah: 11 },
};

const kidQuestions: Record<string, string> = {
  kadesh: "What are you excited about tonight?",
  urchatz: "What is one worry you would like to let go of?",
  karpas: "What is something new you have seen growing this spring?",
  yachatz: "When something breaks, who can help put it back together?",
  maggid: "If you were leaving Egypt in a hurry, what would you bring?",
  rachtzah: "What helps you feel ready to begin something?",
  "motzi-matzah": "What does the matzah taste and feel like?",
  maror: "What is something difficult that a friend might need help with?",
  korech: "What two different feelings can you have at the same time?",
  "shulchan-orech": "Which food on the table has a family story?",
  tzafun: "Why do you think the seder ends the meal with the matzah we hid?",
  barech: "Who helped make tonight possible?",
  hallel: "What is one thing you want to celebrate?",
  nirtzah: "What kind action do you want to try tomorrow?",
};

function promptForAudience(sectionId: string, prompt: string, profile: GenerationProfile): string {
  if (profile.audience === "kids") {
    return kidQuestions[sectionId];
  }
  if (profile.audience === "mixed") {
    return `Everyone can answer or pass: ${kidQuestions[sectionId]}`;
  }
  return prompt;
}

interface HouseParagraph {
  role: HouseCopyRole;
  text: string;
}

const beginnerSectionCopy: Record<SederSectionId, HouseParagraph[]> = {
  kadesh: [{
    role: "ritual-direction",
    text: "Pour a small first cup of wine or grape juice for each person. Lift the cups together, read the blessing aloud if you wish, and take a sip. Kadesh marks the formal beginning of the seder.",
  }],
  urchatz: [{
    role: "ritual-direction",
    text: "Wash without a blessing. Each person may pour water over their own hands at a sink or above a basin, or partners may take turns pouring for one another over the basin. Dry your hands afterward. Optional: fill a separate cup with water for Miriam’s cup; the reading below explains this modern custom.",
  }],
  karpas: [{
    role: "ritual-direction",
    text: "Pass parsley, celery, or another green vegetable. Each person dips a piece in salt water, says the blessing if desired, and eats it. The green marks spring and new growth; the salt water recalls tears.",
  }],
  yachatz: [{
    role: "ritual-direction",
    text: "Take the middle of the three matzot and break it in two. Return the smaller piece to the table. Wrap and hide the larger piece, called the afikoman, for children or other guests to find after dinner. Decide beforehand whether the finder receives a small prize, chooses a song, or earns a shared treat.",
  }],
  maggid: [
    {
      role: "ritual-direction",
      text: "Uncover the matzah. Invite the youngest willing guest—or anyone who wishes—to ask the Four Questions. When the ten plagues are named, remove one drop of wine or grape juice for each: blood, frogs, lice, wild beasts, livestock disease, boils, hail, locusts, darkness, and death of the firstborn. Read or sing Dayenu after the story.",
    },
    {
      role: "beginner-orientation",
      text: "Here is the story’s outline. Pharaoh enslaved the Israelites in Egypt and ordered Hebrew baby boys killed. The midwives Shifra and Puah resisted him. Moses survived, grew up, fled Egypt, and returned to demand freedom. Pharaoh refused repeatedly, and ten plagues struck Egypt. The Israelites left in haste, reached the sea with Pharaoh’s army behind them, crossed through the parted water, and began the difficult journey from slavery toward freedom.",
    },
  ],
  rachtzah: [{
    role: "ritual-direction",
    text: "Wash a second time, now before eating matzah. Guests may wash their own hands or take turns pouring for a partner over the basin. Say the handwashing blessing if you wish, dry your hands, and return to the table.",
  }],
  "motzi-matzah": [{
    role: "ritual-direction",
    text: "Hold up the matzah. Read the two blessings below in English, use the transliteration if it is printed, or listen. Give everyone a piece and eat together.",
  }],
  maror: [{
    role: "ritual-direction",
    text: "Give each person a small amount of prepared horseradish or romaine lettuce. Dip it in charoset, say the blessing if desired, and taste it. Offer a mild portion, and make clear that anyone may smell it or pass instead.",
  }],
  korech: [{
    role: "ritual-direction",
    text: "Place a little maror and charoset between two small pieces of matzah to make the Hillel sandwich. Eat it together; anyone may make a mild version or pass.",
  }],
  "shulchan-orech": [{
    role: "ritual-direction",
    text: "Pause the reading for the festive meal. Name the dishes and allergens before people serve themselves. Keep the hidden afikoman separate, and return to the Haggadah when the meal is finished.",
  }],
  tzafun: [{
    role: "ritual-direction",
    text: "Invite the children or other guests to find the afikoman. Give the finder the agreed prize or honor. Bring everyone back to the table, divide the afikoman, and let each person eat a small piece as the final taste of the meal.",
  }],
  barech: [{
    role: "ritual-direction",
    text: "Settle back at the table. Fill the third cup with wine or grape juice. Read the brief words of gratitude below, add personal thanks if you wish, then lift and drink the cup together.",
  }],
  hallel: [{
    role: "ritual-direction",
    text: "Fill the fourth cup with wine or grape juice. Hallel is a time for praise and song. Choose a familiar melody or read the words responsively; guests may sing, hum, clap, listen, or pass. Drink the fourth cup at the end.",
  }],
  nirtzah: [{
    role: "ritual-direction",
    text: "The ordered part of the seder is ending. Invite each person to name one thought or action they want to carry beyond the table, or simply listen. Then read the closing hope together.",
  }],
};

function closingHouseCopy(profile: GenerationProfile): HouseParagraph {
  const useJerusalem =
    profile.themes.includes("traditional") &&
    !profile.themes.includes("social-justice");
  if (useJerusalem) {
    return {
      role: "bridge",
      text: "Together, say: “Next year in Jerusalem.” We hold this as an old hope for shared freedom and peace, with equal dignity and belonging for every people. May Palestinians and Israelis, Jews, Muslims, Christians, and all who call the land home live with safety, dignity, equality, and peace.",
    };
  }
  return {
    role: "bridge",
    text: "Together, say: “Next year in peace.” May Palestinians and Israelis, Jews, Muslims, Christians, and all who call the land home live with freedom, safety, dignity, equality, and peace.",
  };
}

interface ComposedSectionBody {
  body: string[];
  blocks: AssemblyBlock[];
  passageIds: string[];
}

function bodyForLength(
  blueprint: (typeof sectionBlueprints)[number],
  profile: GenerationProfile,
  spineId: RuntimeSpineId,
): ComposedSectionBody {
  const sectionId = blueprint.id as SederSectionId;
  const houseParagraphs = [...beginnerSectionCopy[sectionId]];
  if (sectionId === "kadesh") {
    houseParagraphs.unshift(
      {
        role: "beginner-orientation",
        text: "Welcome. A seder is Passover’s participatory home ritual and meal. Haggadah means ‘telling’: this booklet guides us through fourteen steps of welcome, symbolic foods, questions, the Exodus story, a festive meal, gratitude, songs, and a closing hope. No prior knowledge, Hebrew, singing ability, or religious belief is expected. Each section explains what is happening and what to do.",
      },
      {
        role: "beginner-orientation",
        text: "We can take turns reading a paragraph or a whole section, and nobody has to lead everything. The host may invite the next reader or pass the reading around the table. Anyone may ask a question, add a memory, help with a ritual, listen, or pass. We will pause for the festive meal and return to the Haggadah afterward.",
      },
      {
        role: "bridge",
        text: deterministicItem(toneOpeners[profile.tone], `tone:${stableProfile(profile)}`),
      },
    );
  }

  const sourcePassages = passagesForSpine(spineId, sectionId, profile.length);
  if (sourcePassages.length === 0) {
    throw new Error(`${spineId} has no reviewed source passage for ${sectionId} at ${profile.length} minutes.`);
  }

  const blocks: AssemblyBlock[] = [
    ...houseParagraphs.map((paragraph) => ({
      kind: "house-copy" as const,
      role: paragraph.role,
      text: paragraph.text,
    })),
    ...sourcePassages.map((passage) => ({
      kind: "primary-source" as const,
      passageId: passage.id,
      seam: sourceSpines
        .find((spine) => spine.id === spineId)!
        .coverage.find((ref) => ref.passageId === passage.id)!.seam,
      text: passage.text,
    })),
  ];

  if (profile.language === "transliteration" && blueprint.blessing) {
    blocks.push({ kind: "traditional-liturgy", text: blueprint.blessing });
  }
  if (sectionId === "nirtzah") {
    const closing = closingHouseCopy(profile);
    blocks.push({ kind: "house-copy", role: closing.role, text: closing.text });
  }

  return {
    body: blocks.map((block) => block.text),
    blocks,
    passageIds: sourcePassages.map((passage) => passage.id),
  };
}

function allocateMinutes(length: GenerationProfile["length"]): number[] {
  const weights = [2, 1, 2, 2, 7, 1, 2, 2, 2, 8, 3, 3, 4, 3];
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const raw = weights.map((weight) => (weight / totalWeight) * length);
  const minutes = raw.map((value) => Math.max(1, Math.floor(value)));
  let remaining = length - minutes.reduce((sum, value) => sum + value, 0);

  const ranked = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  let cursor = 0;
  while (remaining > 0) {
    minutes[ranked[cursor % ranked.length].index] += 1;
    cursor += 1;
    remaining -= 1;
  }
  while (remaining < 0) {
    const candidate = ranked
      .slice()
      .reverse()
      .find(({ index }) => minutes[index] > 1);
    if (!candidate) break;
    minutes[candidate.index] -= 1;
    remaining += 1;
  }
  return minutes;
}

function invitation(profile: GenerationProfile): string {
  const host = profile.hostName.trim() || "your host";
  const date = profile.sederDate.trim() || "Passover night";
  const themes = selectedThemes(profile).map((theme) => themeLabels[theme]);
  const custom = profile.customTheme.trim();
  const values = custom ? `${themes.join(", ")}, and ${custom}` : themes.join(", ");
  return `${host} invites you to a ${profile.length}-minute seder on ${date}, shaped around ${values}. A seder is a participatory Passover meal: we will take turns reading, ask questions, taste symbolic foods, tell the Exodus story, share dinner, and sing or listen together. No Passover or Hebrew experience is needed. You are welcome to read, share a thought or memory, help with a ritual, listen, or pass at any time.`;
}

function hostGuide(profile: GenerationProfile): string[] {
  const guide = [
    `Timing: the generated ritual is paced for about ${profile.length} minutes, including a simple meal pause. Read through it once, then add 15 minutes of arrival time and allow extra time if your meal is elaborate or your table enjoys discussion.`,
    "Set each place with a Haggadah, napkin, water glass, and a small wine glass or juice cup. Put the seder plate, three covered matzah pieces, salt water, extra matzah, wine or grape juice, and a washing bowl with pitcher and towel within easy reach.",
    "The four cups pace the seder from beginning to end. Pour small amounts, and offer grape juice or another celebratory drink without explanation or pressure. Guests may sip rather than finish each cup.",
    "Matzah is unleavened bread that recalls the Israelites leaving Egypt before dough could rise. Place three pieces together under a cloth or in a matzah cover, plus enough extra for everyone to taste during the meal.",
    "There are two handwashings. Urchatz comes before karpas and has no blessing; Rachtzah comes before eating matzah and includes a blessing. At either washing, guests may wash their own hands at a sink or over the basin, or work in pairs while one person gently pours water over the other’s hands above the basin and then they switch. Explain the choices and the difference between the two washings before each one.",
    "At Yachatz, break the middle matzah and hide or set aside the larger half, called the afikoman. Near the end, children or adults find it; everyone eats a small piece as the final taste of the meal. Decide beforehand whether the finder receives a small prize, chooses a song, or earns a shared treat.",
    "The festive meal occurs at Shulchan Orech. Serve food that works for your guests and your own Passover practice. Tell guests when the meal begins, keep the afikoman separate, and resume the Haggadah after plates are cleared.",
    "Invite readers before the seder when possible and make passing an ordinary option. Read every stage direction aloud; no prior knowledge, Hebrew, singing ability, or religious belief is assumed.",
    "Share cooking, pouring, serving, explaining, and cleanup. Assign one person to refill drinks, one to manage ritual objects, and one to help everyone find the current page.",
    "Ten minutes before guests arrive, fill the salt-water bowl, arrange the seder plate, cover the matzah, chill or open drinks, place the washing supplies, and choose the afikoman hiding place.",
  ];
  if (profile.audience !== "adults") {
    guide.push("Give younger guests concrete roles early: pour grape juice with an adult, dip the karpas, ask the Four Questions, hold up plague picture cards, lead a Dayenu chorus, hide or find the afikoman, and choose a closing song. For a simple plague craft, prepare ten paper cards and use crayons or stickers to draw one symbol per plague; avoid small loose pieces for young children, and keep the activity focused on recognizing the story rather than acting out anyone’s suffering.");
  }
  if (profile.interaction === "participatory") {
    guide.push("Pause for the prompt in every section and invite more than one voice.");
  } else if (profile.interaction === "reflective") {
    guide.push("Leave a quiet breath after each prompt before anyone answers.");
  } else {
    guide.push("Choose four prompts in advance; let the rest remain optional.");
  }
  return guide;
}

function sederPlateGuide(profile: GenerationProfile): SederPlateGuideEntry[] {
  const guide: SederPlateGuideEntry[] = [
    {
      element: "Karpas (green vegetable)",
      meaning: "Spring, renewal, and fragile new life; it is dipped in salt water, which evokes tears.",
      ingredients: "Parsley, celery, or a small piece of boiled potato; a separate bowl of water mixed with salt.",
      preparation: "Wash and cut into bite-size sprigs or pieces. Stir 1 teaspoon salt into 1 cup water and place the bowl beside the plate.",
    },
    {
      element: "Maror (bitter herb)",
      meaning: "The bitterness of slavery and every system that diminishes human life.",
      ingredients: "Prepared horseradish or romaine lettuce. Use a mild horseradish or extra romaine for sensitive eaters.",
      preparation: "Place about 1/4 cup prepared horseradish in a small dish, or wash and dry several romaine leaves. Check labels for allergens and Passover preferences.",
    },
    {
      element: "Charoset",
      meaning: "A sweet, textured mixture recalling the mortar used by enslaved Israelites; sweetness also carries resilience.",
      ingredients: "2 apples, 1/2 cup walnuts, 1/2 teaspoon cinnamon, and 2-3 tablespoons grape juice or wine. Substitute pear for apple and sunflower seeds for nuts.",
      preparation: "Core and finely chop the apples and nuts or seeds. Mix with cinnamon and enough grape juice or wine to bind. Refrigerate; make up to one day ahead.",
    },
    {
      element: "Zeroa (shank bone)",
      meaning: "A reminder of the ancient Passover offering; it is displayed, not eaten as part of the ritual.",
      ingredients: "A roasted lamb or poultry bone. A roasted beet is a common vegetarian substitute.",
      preparation: "Roast the bone until browned, or roast a scrubbed beet at 400°F until tender. Cool completely before placing on the plate.",
    },
    {
      element: "Beitzah (roasted egg)",
      meaning: "The ancient festival offering, the cycle of life, and mourning for what has been lost.",
      ingredients: "One hard-boiled egg. A small white bean or flower may be used at an egg-free table, with the substitution explained.",
      preparation: "Hard-boil for 10-12 minutes, cool in ice water, and leave in the shell. Optional: brown the shell briefly in a dry pan with careful supervision.",
    },
    {
      element: "Chazeret (second bitter herb, optional)",
      meaning: "A second portion of bitterness, traditionally used in the matzah-and-maror sandwich.",
      ingredients: "Romaine lettuce or another portion of prepared horseradish.",
      preparation: "Wash and dry romaine thoroughly. Set aside enough for each guest to make a small sandwich with matzah and charoset.",
    },
  ];
  const additions = profile.sederPlateAdditions ?? [];
  if (additions.includes("orange")) {
    guide.push({
      element: "Orange (optional modern addition)",
      meaning: "A modern symbol of the full inclusion of LGBTQ+ Jews and others who have been pushed to the margins of Jewish communal life.",
      ingredients: "One orange, whole or cut into segments; use a clearly separate dish if citrus is a concern for a guest.",
      preparation: "Wash the orange and place it on or beside the seder plate. During the meal, explain that this is a modern addition and invite guests to share the segments.",
    });
  }
  if (additions.includes("pomegranate")) {
    guide.push({
      element: "Pomegranate (optional modern addition)",
      meaning: "Many seeds held within one fruit can represent abundance, many lives within a community, and shared responsibility for freedom.",
      ingredients: "One whole pomegranate, or a small bowl of prepared pomegranate seeds.",
      preparation: "Place the whole fruit beside the seder plate, or prepare the seeds ahead to avoid stains. Explain that this is a chosen symbol rather than a required traditional item.",
    });
  }
  return guide;
}

function shoppingList(profile: GenerationProfile): string[] {
  const list = [
    "Matzah (three pieces plus extra for the meal)",
    "Wine and/or grape juice for four small cups per guest",
    "Karpas, salt water, maror, charoset, roasted egg, and shank bone or beet",
    "Handwashing bowl, pitcher, and towel",
    "Festive meal, water, place settings, and printed or digital Haggadahs",
  ];
  if (profile.audience !== "adults") {
    list.push("Afikoman bag and a small prize or shared treat");
  }
  if (profile.sederPlateAdditions?.includes("orange")) list.push("One orange for the optional inclusion symbol");
  if (profile.sederPlateAdditions?.includes("pomegranate")) list.push("One pomegranate or prepared seeds for the optional community symbol");
  return list;
}

export function generateHaggadah(profile: GenerationProfile): HaggadahDocument {
  const profileKey = stableProfile(profile);
  const sourceSpineId = selectSourceSpine(profile);
  const primarySourceId = sourceIdForSpine(sourceSpineId);
  const minutes = allocateMinutes(profile.length);
  const quoteSectionIds = quoteSectionsForLength(profile.length);
  const quotesBySection = selectQuotes(profile, quoteSectionIds);
  const composedSections = sectionBlueprints.map((blueprint, index) => {
    const composition = bodyForLength(blueprint, profile, sourceSpineId);
    return {
      blueprint,
      composition,
      prompt: promptForAudience(blueprint.id, blueprint.prompt, profile),
      bridge: audienceBridge(profile, index),
      quote: quotesBySection.get(blueprint.id),
    };
  });

  const sourceAssembly: HaggadahAssembly = {
    spineId: sourceSpineId,
    tier: profile.length,
    sections: composedSections.map(({ blueprint, composition, prompt, bridge }) => ({
      sectionId: blueprint.id as SederSectionId,
      blocks: [
        ...composition.blocks,
        { kind: "house-copy", role: "bridge", text: bridge },
        { kind: "house-copy", role: "table-prompt", text: prompt },
      ],
    })),
  };
  const sourceErrors = validateAssembly(sourceAssembly);
  if (sourceErrors.length > 0) {
    throw new Error(`Source-spine validation failed:\n- ${sourceErrors.join("\n- ")}`);
  }
  const measuredSources = sourceShareMetrics(sourceAssembly);
  if (measuredSources.borrowedWordShare < 0.5) {
    throw new Error(
      `Source-first assembly fell below the 50% reviewed-source floor (${Math.round(measuredSources.borrowedWordShare * 100)}%).`,
    );
  }

  const sections: HaggadahSection[] = composedSections.map(
    ({ blueprint, composition, prompt, bridge, quote }, index) => {
      const section: HaggadahSection = {
        id: blueprint.id,
        order: index + 1,
        transliteration:
          profile.language === "transliteration" ? blueprint.transliteration : "",
        title: blueprint.title,
        ritual: blueprint.ritual,
        body: composition.body,
        prompt,
        bridge,
        minutes: minutes[index],
        sourceIds: [primarySourceId],
        passageIds: composition.passageIds,
      };
      if (quote) {
        section.quote = quote;
        section.quoteContext = quoteContexts[blueprint.id];
      }
      return section;
    },
  );

  const document: HaggadahDocument = {
    id: `haggadah-${stableHash(profileKey).toString(36)}`,
    title: profile.hostName.trim()
      ? `${profile.hostName.trim()}’s Passover Haggadah`
      : "A Passover Haggadah for This Table",
    profile: {
      ...profile,
      themes: [...profile.themes],
    },
    sections,
    coverId: selectCover(profile),
    invitation: invitation(profile),
    hostGuide: hostGuide(profile),
    shoppingList: shoppingList(profile),
    sederPlateGuide: sederPlateGuide(profile),
    sourceSpineId,
    sourceMetrics: {
      primarySourceId,
      borrowedWords: measuredSources.borrowedWords,
      houseWords: measuredSources.houseWords,
      traditionalWords: measuredSources.traditionalWords,
      borrowedWordShare: measuredSources.borrowedWordShare,
    },
    createdAt: profile.sederDate
      ? `${profile.sederDate}T00:00:00.000Z`
      : "1970-01-01T00:00:00.000Z",
    editorialWarnings: [],
  };

  document.editorialWarnings = validateEditorial(document);
  assertEditorial(document);
  return document;
}

/** Applies constrained model suggestions without allowing freeform structural edits. */
export function mergeModelEnhancement(
  document: HaggadahDocument,
  enhancement: ModelEnhancement,
): HaggadahDocument {
  const next: HaggadahDocument = {
    ...document,
    profile: { ...document.profile, themes: [...document.profile.themes] },
    sections: document.sections.map((section) => ({
      ...section,
      body: [...section.body],
      sourceIds: [...section.sourceIds],
      passageIds: [...section.passageIds],
      quote: section.quote ? { ...section.quote, themes: [...section.quote.themes], sectionIds: [...section.quote.sectionIds] } : undefined,
    })),
    hostGuide: [...document.hostGuide],
    shoppingList: [...document.shoppingList],
    sederPlateGuide: document.sederPlateGuide.map((entry) => ({ ...entry })),
    sourceMetrics: { ...document.sourceMetrics },
    editorialWarnings: [],
  };

  if (enhancement.coverId !== undefined) {
    if (!coverOptions.some((cover) => cover.id === enhancement.coverId)) {
      throw new Error(`Model suggested unknown cover: ${enhancement.coverId}.`);
    }
    next.coverId = enhancement.coverId;
  }

  if (enhancement.bridges) {
    Object.entries(enhancement.bridges).forEach(([sectionId, bridge]) => {
      const section = next.sections.find((candidate) => candidate.id === sectionId);
      if (!section) {
        throw new Error(`Model suggested a bridge for unknown section: ${sectionId}.`);
      }
      const trimmedBridge = bridge.trim();
      const cannedContrast = [
        /\bnot\s+[^.!?]{1,90}[,;:]?\s+but\s+[^.!?]+/i,
        /\bisn['’]?t\s+[^.!?]{1,90}[,;:]\s*it['’]?s\s+[^.!?]+/i,
        /\b(?:is|are)\s+not\s+[^.!?]{1,90}[.!?;:]\s*(?:it|this|that|they|we)\s+(?:is|are)\s+[^.!?]+/i,
        /\bis\s+[^.!?]{1,90}[,;:]\s*not\s+[^.!?]+/i,
        /\brather\s+than\s+[^.!?]{1,90}[,;]\s*[^.!?]+/i,
      ];
      if (cannedContrast.some((pattern) => pattern.test(trimmedBridge))) {
        throw new Error(
          `Model bridge for ${sectionId} uses a canned contrast template.`,
        );
      }
      section.bridge = trimmedBridge;
    });
  }

  if (enhancement.quoteIds !== undefined) {
    const activeQuoteSections = quoteSectionsForLength(document.profile.length);
    if (enhancement.quoteIds.length > activeQuoteSections.length) {
      throw new Error(`At most ${activeQuoteSections.length} model-selected quotes are allowed.`);
    }
    const uniqueIds = new Set(enhancement.quoteIds);
    if (uniqueIds.size !== enhancement.quoteIds.length) {
      throw new Error("Model-selected quote IDs must be unique.");
    }
    activeQuoteSections.forEach((sectionId, index) => {
      const quoteId = enhancement.quoteIds?.[index];
      if (!quoteId) return;
      const quote = quoteCatalog.find(
        (candidate) => candidate.id === quoteId && candidate.approved,
      );
      if (!quote) {
        throw new Error(`Model suggested unknown or unapproved quote: ${quoteId}.`);
      }
      if (!quote.sectionIds.includes(sectionId)) {
        throw new Error(
          `Model suggested quote ${quoteId} outside its approved context (${sectionId}).`,
        );
      }
      if (!quote.themes.some((theme) => selectedThemes(document.profile).includes(theme))) {
        throw new Error(
          `Model suggested quote ${quoteId} outside the selected themes.`,
        );
      }
      const section = next.sections.find((candidate) => candidate.id === sectionId);
      if (section) {
        section.quote = quote;
        section.quoteContext = quoteContexts[sectionId];
      }
    });

    const usedQuoteIds = new Set<string>();
    activeQuoteSections.forEach((sectionId, index) => {
      const section = next.sections.find((candidate) => candidate.id === sectionId);
      if (!section?.quote) return;
      if (usedQuoteIds.has(section.quote.id) && index >= enhancement.quoteIds!.length) {
        const replacements = quoteCatalog.filter(
          (quote) =>
            quote.approved &&
            quote.sectionIds.includes(sectionId) &&
            quote.themes.some((theme) => selectedThemes(document.profile).includes(theme)) &&
            !usedQuoteIds.has(quote.id),
        );
        section.quote = deterministicItem(
          replacements,
          `replacement-quote:${index}:${sectionId}:${stableProfile(document.profile)}`,
        );
      }
      usedQuoteIds.add(section.quote.id);
    });
  }

  next.editorialWarnings = validateEditorial(next);
  assertEditorial(next);
  return next;
}
