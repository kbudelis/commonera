import {
  coverOptions,
  maggidNarratives,
  quoteCatalog,
  sectionBlueprints,
  themeLabels,
  themeMoments,
  toneOpeners,
  type ThemeMoment,
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
  runtimePassageById,
  runtimePassageCandidates,
  runtimeFeaturedSource,
  selectRuntimePassages,
  smokeRuntimeContext,
  type RuntimePassageCandidate,
  type RuntimePassageContext,
} from "../content/source-runtime";
import { loadRuntimeContextForProfile } from "../content/runtime-pack-adapter";
import {
  assertEditorial,
  CONTEXTUAL_QUOTE_IDS,
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
  passageIds?: string[];
}

function quoteSectionsForLength(length: GenerationProfile["length"]): string[] {
  void length;
  return ["maggid", "nirtzah"];
}

const quoteContexts: Record<string, string> = {
  kadesh: "A line to help us enter the evening with intention:",
  maggid: "A voice that deepens this telling of oppression, resistance, and freedom:",
  nirtzah: "A closing line about the life we want to build after tonight:",
};

const contemplativeQuoteContexts: Record<string, string> = {
  "q-dhammapada-hatred": "Alongside our closing hope for peace, the Dhammapada offers this Buddhist teaching:",
  "q-gita-right-action": "As we choose an action, this historical Hindu translation asks us to value doing right even when we cannot control the result:",
  "q-isha-self": "Alongside our shared-humanity closing, the Isha Upanishad offers this Vedantic vision:",
};

function quoteContextFor(quote: QuoteEntry, sectionId: string): string {
  return contemplativeQuoteContexts[quote.id] ?? quoteContexts[sectionId];
}

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
  // The concise Shir tier carries a complete beginner-facing ritual and story
  // spine. Velveteen's shortest tier is intentionally more poetic and needs
  // more connective explanation than a genuinely brief seder can support.
  if (profile.length === 20) return "shir-geulah-primary";
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
    sectionIds.map((sectionId, slot) => {
      const targetTheme = themes[slot % themes.length];
      return [
        sectionId,
        quoteCatalog
        .filter(
          (quote) =>
            quote.approved &&
            quote.sectionIds.includes(sectionId) &&
            CONTEXTUAL_QUOTE_IDS[sectionId]?.has(quote.id) &&
            quote.themes.some((theme) => themes.includes(theme)) &&
            (!quote.externalContemplative || profile.themes.includes("mindfulness")),
        )
        .sort(
          (left, right) => {
            const leftExternalPriority =
              sectionId === "nirtzah" && profile.themes.includes("mindfulness") && left.externalContemplative ? 1 : 0;
            const rightExternalPriority =
              sectionId === "nirtzah" && profile.themes.includes("mindfulness") && right.externalContemplative ? 1 : 0;
            if (leftExternalPriority !== rightExternalPriority) return rightExternalPriority - leftExternalPriority;
            const leftTarget = left.themes.includes(targetTheme) ? 1 : 0;
            const rightTarget = right.themes.includes(targetTheme) ? 1 : 0;
            if (leftTarget !== rightTarget) return rightTarget - leftTarget;
            return stableHash(`quote:${slot}:${sectionId}:${left.id}:${profileKey}`) -
              stableHash(`quote:${slot}:${sectionId}:${right.id}:${profileKey}`);
          },
        ),
      ];
    }),
  );
  const selected = new Map<string, QuoteEntry>();
  const used = new Set<string>();
  let externalContemplativeCount = 0;

  function place(index: number): boolean {
    if (index === sectionIds.length) return true;
    const sectionId = sectionIds[index];
    for (const quote of candidates.get(sectionId) ?? []) {
      if (used.has(quote.id)) continue;
      if (quote.externalContemplative && externalContemplativeCount >= 1) continue;
      used.add(quote.id);
      selected.set(sectionId, quote);
      if (quote.externalContemplative) externalContemplativeCount += 1;
      if (place(index + 1)) return true;
      if (quote.externalContemplative) externalContemplativeCount -= 1;
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

function assignedThemeMoments(profile: GenerationProfile): Map<string, ThemeMoment> {
  const assignments = new Map<string, ThemeMoment>();
  const themes = [...new Set(profile.themes)];
  if (themes.length === 0) return assignments;

  const usedMomentIds = new Set<string>();
  const chooseForTheme = (theme: ThemeId, round: number): boolean => {
    const candidates = [...themeMoments[theme]].sort(
      (left, right) =>
        stableHash(`theme-moment:${round}:${left.id}:${stableProfile(profile)}`) -
        stableHash(`theme-moment:${round}:${right.id}:${stableProfile(profile)}`),
    );
    const chosen = candidates.find(
      (candidate) =>
        !assignments.has(candidate.sectionId) && !usedMomentIds.has(candidate.id),
    );
    if (!chosen) return false;
    assignments.set(chosen.sectionId, chosen);
    usedMomentIds.add(chosen.id);
    return true;
  };

  themes.forEach((theme) => chooseForTheme(theme, 0));
  let round = 1;
  while (assignments.size < 3 && round < 4) {
    for (const theme of themes) {
      if (assignments.size >= 3) break;
      chooseForTheme(theme, round);
    }
    round += 1;
  }
  return assignments;
}

function audienceBridge(
  profile: GenerationProfile,
  sectionIndex: number,
  themedMoment?: ThemeMoment,
): string {
  const sectionId = sectionBlueprints[sectionIndex].id;
  if (themedMoment) {
    if (profile.length === 20) return themedMoment.transition;
    const participation = profile.audience === "kids"
      ? kidParticipation[sectionId]
      : tableParticipation[sectionId];
    const combined = `${participation} ${themedMoment.transition}`;
    return combined.trim().split(/\s+/u).length <= 45
      ? combined
      : themedMoment.transition;
  }
  // In the concise tier, the action copy already supplies an explicit role for
  // every guest. Repeating another participation paragraph in all 14 sections
  // made a nominally short seder much longer without making it clearer.
  if (profile.length === 20) return "";
  if (profile.audience === "kids") {
    return kidParticipation[sectionId];
  }
  return tableParticipation[sectionId];
}

const kidParticipation: Record<string, string> = {
  kadesh: "Invite a child to help pour a little grape juice into each cup, then lift the cups together.",
  urchatz: "Children may wash their own hands, or take turns with a partner: one person holds their hands over the basin while the other gently pours water from the pitcher, then they switch roles.",
  karpas: "Let children dip their own parsley or celery in the salt water and describe how it tastes.",
  yachatz: "Show children which piece of matzah becomes the afikoman. They will search for it after dinner, and the finder often receives a small prize.",
  maggid: "Children can ask the Four Questions, remove plague drops, sing Dayenu, and hold up ten plague picture cards drawn with crayons on paper.",
  rachtzah: "Children may wash their own hands before the matzah, or work in pairs over the basin: one pours gently from the pitcher while the other washes, then they switch. After washing, stay quiet until everyone has blessed and eaten the matzah.",
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
  rachtzah: "Make the bowl, pitcher, and towel easy to find. Guests may wash their own hands or pour water for a partner over the basin. After washing, remain quiet until everyone has blessed and eaten the matzah.",
  "motzi-matzah": "Wait until everyone has a piece of matzah before eating together.",
  maror: "Offer a mild option and make clear that tasting, smelling, or passing are all welcome.",
  korech: "Set out the ingredients so each person can make a small sandwich or pass.",
  "shulchan-orech": "Name the dishes and any allergens, then invite everyone to begin the meal.",
  tzafun: "Bring everyone back to the table before dividing and eating the afikoman.",
  barech: "Give people a moment to settle after the meal before beginning grace.",
  hallel: "Choose a melody or responsive reading that newcomers can join after hearing one line.",
  nirtzah: "End by letting each person name one thought or action they want to carry forward.",
};

const kidQuestions: Record<string, string> = {
  kadesh: "A seder begins by making time feel special. What could our table do to make tonight feel welcoming?",
  urchatz: "What helps your mind slow down when you first arrive somewhere?",
  karpas: "Why do you think the seder puts fresh spring greens and salty tears in the same bite?",
  yachatz: "Why might we save one broken piece of matzah and bring it back after dinner?",
  maggid: "Which person in the Exodus story made a brave choice, and who did that choice help?",
  rachtzah: "After you eat the matzah: How did washing a second time feel different from washing before karpas?",
  "motzi-matzah": "Matzah recalls leaving before bread could rise. How can one plain food help a whole group remember a hurried journey?",
  maror: "Why might tasting something bitter help us remember a hard part of the story?",
  korech: "The sandwich holds bitter maror and sweet charoset together. When have you felt two different feelings at once?",
  "shulchan-orech": "Which food here has a story about a person, place, or tradition?",
  tzafun: "Why does the seder bring back the broken matzah before the night can end?",
  barech: "Name one person and one part of nature that helped this meal reach us.",
  hallel: "After a story with fear and loss, what gives the people a reason to sing?",
  nirtzah: "What is one action tomorrow that could make someone else feel safer, freer, or more welcome?",
};

const adultQuestions: Record<string, string> = {
  kadesh: "What quality would help this table hold honest questions and genuine welcome tonight?",
  urchatz: "What do you notice when an ordinary act of washing is given your full attention?",
  karpas: "What changes when renewal and grief are tasted in the same bite?",
  yachatz: "Why might a ritual of freedom begin by breaking something and promising to return for it?",
  maggid: "Which choice in the Exodus story changes what freedom becomes possible for everyone else?",
  rachtzah: "After everyone has eaten the matzah: How did repeating the washing change your attention to it?",
  "motzi-matzah": "What does a hurried, unfinished bread reveal about the conditions under which people often begin leaving danger?",
  maror: "What kind of suffering becomes easier for a community to ignore when it is never allowed to interrupt the meal?",
  korech: "What truth becomes clearer when bitterness, sweetness, and urgency are held together?",
  "shulchan-orech": "Which dish carries a story about migration, adaptation, scarcity, celebration, or care?",
  tzafun: "Why does the seder require the hidden broken piece to return before the ritual can move toward its close?",
  barech: "Whose labor or knowledge made tonight possible while remaining easy to overlook?",
  hallel: "What deserves praise after we have made room for grief and moral complexity?",
  nirtzah: "What concrete practice could carry tonight’s concern for freedom into an ordinary week?",
};

function promptForAudience(
  sectionId: string,
  profile: GenerationProfile,
  themedMoment?: ThemeMoment,
): string {
  const kidPrompt = themedMoment?.kidPrompt ?? kidQuestions[sectionId];
  const adultPrompt = themedMoment?.adultPrompt ?? adultQuestions[sectionId];
  let prompt = profile.audience === "kids"
    ? kidPrompt
    : profile.audience === "mixed"
      ? `Everyone can answer or pass: ${kidPrompt}`
      : adultPrompt;
  if (sectionId === "rachtzah" && !/^After (?:you|everyone)/i.test(prompt)) {
    prompt = profile.audience === "adults"
      ? `After everyone has eaten the matzah: ${prompt}`
      : `After you eat the matzah: ${prompt}`;
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
    text: "Pour a small first cup of wine or grape juice for each person. Each person lifts their own cup. Read the English blessing printed on this page—and the transliteration too, if you selected it—then everyone takes a sip. Kadesh marks the formal beginning of the seder.",
  }],
  urchatz: [{
    role: "ritual-direction",
    text: "Wash without a blessing. At a sink, each person may run water over their own hands. At the table, use the pitcher to pour water over your own hands above the basin, or work with a partner: one person holds their hands over the basin while the other pours, and then they switch. Dry your hands with the towel. Optional: fill a separate cup with water for Miriam’s cup; the reading below explains this modern custom.",
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
      text: "Uncover the three matzot and pour the second cup of wine or grape juice for each person; do not drink yet. Invite the youngest willing guest—or anyone who wishes—to read the Four Questions. As the ten plagues are named, each person uses a spoon to move one drop from their own cup to a napkin or plate for each: blood, frogs, lice, wild beasts, livestock disease, boils, hail, locusts, darkness, and death of the firstborn.",
    },
  ],
  rachtzah: [{
    role: "ritual-direction",
    text: "Wash a second time, now before eating matzah. Guests may wash their own hands or take turns pouring for a partner over the basin. Read the English handwashing blessing printed on this page—and the transliteration too, if selected—dry your hands, and return to the table. After washing, remain quiet until everyone has blessed and eaten the matzah in the next section.",
  }],
  "motzi-matzah": [{
    role: "ritual-direction",
    text: "The host lifts the matzah so everyone can see it. Read the two English blessings printed on this page, add the transliteration if selected, or listen while someone else reads. Pass the matzah until every person has a piece, then eat together.",
  }],
  maror: [{
    role: "ritual-direction",
    text: "Give each person a small amount of prepared horseradish or romaine lettuce. Each person dips their own bitter herb in the sweet fruit-and-nut mixture called charoset. Read the English blessing printed on this page, add the transliteration if selected, and taste it. Offer a mild portion, and make clear that anyone may smell it or pass instead.",
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
    text: "Settle back at the table. Fill the third cup with wine or grape juice. Read the words of gratitude below and add personal thanks if you wish. Then each person lifts their own cup, reads or listens to the English wine blessing printed on this page, and drinks.",
  }],
  hallel: [{
    role: "ritual-direction",
    text: "Fill the fourth cup with wine or grape juice. Hallel is a time for praise and song. No one needs to know a tune: one person can read ‘Give thanks for the good in our lives,’ and everyone can answer, ‘May love and freedom grow.’ Repeat the response after each reading, or choose another song. Guests may sing, hum, clap, listen, or pass. At the end, each person lifts their own cup, reads or listens to the English wine blessing printed on this page, and drinks.",
  }],
  nirtzah: [{
    role: "ritual-direction",
    text: "The ordered part of the seder is ending. Invite each person to name one thought or action they want to carry beyond the table, or simply listen. Then read the closing hope together.",
  }],
};

/**
 * Essential host directions for the concise tier. These retain the actor,
 * object, action, pass option, and newcomer clarification for every ritual,
 * while leaving fuller explanations to the reviewed source passage that
 * follows. The 45- and 90-minute tiers keep the more expansive directions.
 */
const conciseBeginnerSectionCopy: Record<SederSectionId, HouseParagraph[]> = {
  kadesh: [{
    role: "ritual-direction",
    text: "Pour a small first cup of wine or grape juice for each person. Each person lifts their own cup, reads or listens to the English blessing below, and takes a sip. This formally begins the seder.",
  }],
  urchatz: [{
    role: "ritual-direction",
    text: "Wash without a blessing. Each person may use a sink or pour from the pitcher over their own hands. Or partners may pour for one another above the basin, switch roles, and dry with the towel.",
  }],
  karpas: [{
    role: "ritual-direction",
    text: "Pass parsley, celery, or another green vegetable. Each person dips a piece in salt water, says or listens to the blessing below, and eats it. Green marks spring; salt water recalls tears.",
  }],
  yachatz: [{
    role: "ritual-direction",
    text: "Break the middle of the three matzot in two. Return the smaller piece. Wrap and hide the larger piece, called the afikoman, for children or other guests to find after dinner. The finder receives a small prize or chooses a song.",
  }],
  maggid: [{
    role: "ritual-direction",
    text: "Pour the second cup of wine or grape juice; do not drink yet. Invite the youngest willing guest—or anyone who wishes—to read the Four Questions. Each person uses a spoon to move one drop from their cup to a napkin or plate for each plague: blood, frogs, lice, wild beasts, livestock disease, boils, hail, locusts, darkness, and death of the firstborn.",
  }],
  rachtzah: [{
    role: "ritual-direction",
    text: "Wash again before matzah. Guests may wash their own hands, or partners may take turns pouring over the basin. Say or listen to the handwashing blessing, dry, and return to the table. After washing, remain quiet until everyone has blessed and eaten the matzah.",
  }],
  "motzi-matzah": [{
    role: "ritual-direction",
    text: "The host lifts the matzah. Read or listen to the two blessings below, pass matzah until every person has a piece, and eat together.",
  }],
  maror: [{
    role: "ritual-direction",
    text: "Give each person a small bitter herb: prepared horseradish or romaine lettuce. Each person dips it in charoset and tastes it after the blessing. Anyone may take a mild portion, smell it, or pass.",
  }],
  korech: [{
    role: "ritual-direction",
    text: "Each person places maror and charoset between two small pieces of matzah to make the Hillel sandwich, then eats it. Anyone may make a mild version or pass.",
  }],
  "shulchan-orech": [{
    role: "ritual-direction",
    text: "Begin the festive meal. Name the dishes and allergens before guests serve themselves. Keep the hidden afikoman separate and return to the Haggadah after dinner.",
  }],
  tzafun: [{
    role: "ritual-direction",
    text: "Invite children or other guests to find the afikoman. Give the finder the agreed prize or honor. Return to the table, divide the afikoman, and let everyone eat a small piece.",
  }],
  barech: [{
    role: "ritual-direction",
    text: "Fill the third cup with wine or grape juice and say or read a brief gratitude. Then each person lifts their own cup, reads or listens to the wine blessing, and drinks.",
  }],
  hallel: [{
    role: "ritual-direction",
    text: "Fill the fourth cup with wine or grape juice. No one needs to know a tune. One person reads, ‘Give thanks for the good in our lives,’ and everyone answers, ‘May love and freedom grow.’ Repeat the response or choose a song. Guests may sing, hum, listen, or pass. Read the wine blessing and drink.",
  }],
  nirtzah: [{
    role: "ritual-direction",
    text: "The ordered part of the seder is ending. Each person may name one thought or action to carry beyond the table, or simply listen. Read the closing hope together.",
  }],
};

const englishBlessings: Partial<Record<SederSectionId, string[]>> = {
  kadesh: ["Blessed are You, Eternal our God, Guide of the universe, who creates the fruit of the vine."],
  karpas: ["Blessed are You, Eternal our God, Guide of the universe, who creates the fruit of the earth."],
  maggid: ["Blessed are You, Eternal our God, Guide of the universe, who creates the fruit of the vine."],
  rachtzah: ["Blessed are You, Eternal our God, Guide of the universe, who makes us holy through sacred practice and instructs us concerning the washing of hands."],
  "motzi-matzah": [
    "Blessed are You, Eternal our God, Guide of the universe, who brings bread from the earth.",
    "Blessed are You, Eternal our God, Guide of the universe, who makes us holy through sacred practice and instructs us to eat matzah.",
  ],
  maror: ["Blessed are You, Eternal our God, Guide of the universe, who makes us holy through sacred practice and instructs us to eat bitter herbs."],
  barech: ["Blessed are You, Eternal our God, Guide of the universe, who creates the fruit of the vine."],
  hallel: ["Blessed are You, Eternal our God, Guide of the universe, who creates the fruit of the vine."],
};

function sectionHasTraditionalLiturgy(
  sectionId: SederSectionId,
  profile: GenerationProfile,
  spineId: RuntimeSpineId,
): boolean {
  if (sectionId === "maggid") return true;
  const englishIsSeparate = Boolean(englishBlessings[sectionId]?.length) &&
    !(sectionId === "motzi-matzah" && spineId === "shir-geulah-primary");
  if (englishIsSeparate) return true;
  if (profile.language !== "transliteration") return false;
  const blueprint = sectionBlueprints.find((item) => item.id === sectionId);
  return Boolean(blueprint?.blessing) || ["barech", "hallel"].includes(sectionId);
}

const maggidFourQuestions = "Why is this night different from all other nights? On other nights we eat leavened bread or matzah; tonight we eat matzah. On other nights we eat any vegetables; tonight we eat bitter herbs. On other nights we do not have to dip our food even once; tonight we dip twice. On other nights we may sit upright or recline; tonight we make a point of reclining as a sign of freedom.";

const maggidDayenu = "Dayenu means ‘It would have been enough.’ One person reads each line and everyone answers, ‘Dayenu!’ For bringing us out of slavery—Dayenu! For leading us through the sea—Dayenu! For sustaining us in the wilderness—Dayenu! For bringing us together to remember and act—Dayenu!";

const concludingSectionCopy: Partial<Record<SederSectionId, HouseParagraph[]>> = {
  maggid: [{
    role: "ritual-direction",
    text: "After the Exodus story and Dayenu, each person lifts their own second cup. Read or listen to the English wine blessing printed below, add the transliteration if selected, and drink together.",
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
  runtimeSourceIds: string[];
}

function runtimeInsertionIndex(
  body: string[],
  sectionId: SederSectionId,
  profile: GenerationProfile,
  candidate: RuntimePassageCandidate,
): number {
  const firstBlessing = body.findIndex((paragraph) =>
    /^(?:Blessed|Praised) are You\b|^Barukh atah\b/i.test(paragraph.trim()),
  );
  const beforeBlessing = firstBlessing >= 0 ? firstBlessing : body.length;
  switch (candidate.passage.seam) {
    case "section-opening":
      // Preserve the universal newcomer orientation at the very start.
      return sectionId === "kadesh" ? Math.min(3, body.length) : Math.min(1, body.length);
    case "ritual-setup":
    case "ritual-explanation":
    case "plate-option":
      return Math.min(1, body.length);
    case "story-core": {
      if (sectionId === "maggid") {
        const narrative = maggidNarratives[profile.length].paragraphs;
        const lastNarrative = body.lastIndexOf(narrative[narrative.length - 1]);
        if (lastNarrative >= 0) return lastNarrative + 1;
      }
      return beforeBlessing;
    }
    case "story-reflection": {
      const concludingDirection = body.findIndex((paragraph) =>
        /After the Exodus story and Dayenu/i.test(paragraph),
      );
      return concludingDirection >= 0 ? concludingDirection : beforeBlessing;
    }
    case "before-blessing":
      return beforeBlessing;
    case "song-introduction":
      return Math.min(1, body.length);
    case "closing-reflection": {
      const closing = body.findIndex((paragraph) => /^Together, say:/i.test(paragraph));
      return closing >= 0 ? closing : body.length;
    }
    case "after-blessing":
    case "discussion-prompt":
    case "meal-transition":
    case "historical-sidebar":
    case "optional-insert":
      return body.length;
  }
}

function bodyWithRuntimePassages(
  body: string[],
  sectionId: SederSectionId,
  profile: GenerationProfile,
  candidates: RuntimePassageCandidate[],
): string[] {
  const result = [...body];
  for (const candidate of candidates) {
    const index = runtimeInsertionIndex(result, sectionId, profile, candidate);
    result.splice(
      index,
      0,
      ...(candidate.passage.beginnerContext ? [candidate.passage.beginnerContext] : []),
      candidate.passage.exactText,
    );
  }
  return result;
}

function bodyForLength(
  blueprint: (typeof sectionBlueprints)[number],
  profile: GenerationProfile,
  spineId: RuntimeSpineId,
  runtimeCandidates: RuntimePassageCandidate[] = [],
): ComposedSectionBody {
  const sectionId = blueprint.id as SederSectionId;
  const houseParagraphs = [...(
    profile.length === 20
      ? conciseBeginnerSectionCopy[sectionId]
      : beginnerSectionCopy[sectionId]
  )];
  if (sectionId === "maggid") {
    houseParagraphs.push(
      ...maggidNarratives[profile.length].paragraphs.map((text) => ({
        role: "beginner-orientation" as const,
        text,
      })),
    );
  }
  if (sectionId === "kadesh") {
    houseParagraphs.unshift(
      {
        role: "beginner-orientation",
        text: "Welcome. A seder is Passover’s participatory home ritual and meal. This Haggadah guides fourteen steps of welcome, symbolic foods, questions, the Exodus, dinner, gratitude, songs, and a closing hope. No prior knowledge, Hebrew, singing ability, or religious belief is expected.",
      },
      {
        role: "beginner-orientation",
        text: "Take turns reading paragraphs or whole sections. The host can invite a reader or pass the reading around. Anyone may ask a question, share a memory, help with a ritual, listen, or pass. We pause for dinner and return afterward.",
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

  if (sectionId === "maggid") {
    blocks.splice(1, 0, {
      kind: "traditional-liturgy",
      text: maggidFourQuestions,
    });
    blocks.push({ kind: "traditional-liturgy", text: maggidDayenu });
  }

  for (const paragraph of concludingSectionCopy[sectionId] ?? []) {
    blocks.push({ kind: "house-copy", role: paragraph.role, text: paragraph.text });
  }

  const sourceAlreadyPrintsEnglishMotzi =
    sectionId === "motzi-matzah" &&
    sourcePassages.some((passage) => passage.id === "shir-motzi-two-blessings");
  if (!sourceAlreadyPrintsEnglishMotzi) {
    for (const blessing of englishBlessings[sectionId] ?? []) {
      blocks.push({ kind: "traditional-liturgy", text: blessing });
    }
  }

  if (profile.language === "transliteration") {
    const transliteratedBlessing = blueprint.blessing ??
      (["maggid", "barech", "hallel"].includes(sectionId)
        ? "Barukh atah Adonai, Eloheinu melekh ha’olam, borei p’ri hagafen."
        : "");
    if (transliteratedBlessing) {
      blocks.push({ kind: "traditional-liturgy", text: transliteratedBlessing });
    }
  }
  if (sectionId === "nirtzah") {
    const closing = closingHouseCopy(profile);
    blocks.push({ kind: "house-copy", role: closing.role, text: closing.text });
  }

  return {
    body: bodyWithRuntimePassages(
      blocks.map((block) => block.text),
      sectionId,
      profile,
      runtimeCandidates,
    ),
    blocks,
    passageIds: [
      ...sourcePassages.map((passage) => passage.id),
      ...runtimeCandidates.map((candidate) => candidate.passage.id),
    ],
    runtimeSourceIds: runtimeCandidates.map((candidate) => candidate.source.sourceId),
  };
}

/**
 * Small-table planning budgets for the live ritual, not reading-time weights.
 * Dinner itself is additional; Shulchan Orech covers the transition into it.
 * The concise tier is intentionally brisk, while the longer tiers reserve real
 * time for conversation, plague activity, the afikoman, and communal song.
 */
export const LIVE_SECTION_MINUTES: Record<
  GenerationProfile["length"],
  Record<SederSectionId, number>
> = {
  20: {
    kadesh: 2,
    urchatz: 3,
    karpas: 2,
    yachatz: 2,
    maggid: 6,
    rachtzah: 3,
    "motzi-matzah": 2,
    maror: 2,
    korech: 2,
    "shulchan-orech": 2,
    tzafun: 2,
    barech: 2,
    hallel: 2,
    nirtzah: 2,
  },
  45: {
    kadesh: 3,
    urchatz: 4,
    karpas: 3,
    yachatz: 3,
    maggid: 12,
    rachtzah: 4,
    "motzi-matzah": 3,
    maror: 3,
    korech: 3,
    "shulchan-orech": 2,
    tzafun: 4,
    barech: 4,
    hallel: 7,
    nirtzah: 5,
  },
  90: {
    kadesh: 4,
    urchatz: 5,
    karpas: 4,
    yachatz: 4,
    maggid: 32,
    rachtzah: 5,
    "motzi-matzah": 4,
    maror: 4,
    korech: 4,
    "shulchan-orech": 2,
    tzafun: 6,
    barech: 7,
    hallel: 13,
    nirtzah: 6,
  },
};

export const LIVE_PLANNING_RANGES: Record<
  GenerationProfile["length"],
  { minimum: number; maximum: number; label: string }
> = {
  20: { minimum: 32, maximum: 36, label: "32–36 minutes" },
  45: { minimum: 55, maximum: 65, label: "55–65 minutes" },
  90: { minimum: 95, maximum: 110, label: "95–110 minutes" },
};

/** Hands-on time at a small table, before any optional prompt discussion. */
export const CONCISE_ACTION_MINUTES: Record<SederSectionId, number> = {
  kadesh: 0.75,
  urchatz: 2.75,
  karpas: 1,
  yachatz: 1.25,
  maggid: 2.5,
  rachtzah: 2.75,
  "motzi-matzah": 1,
  maror: 1,
  korech: 1,
  "shulchan-orech": 1,
  tzafun: 2,
  barech: 1,
  hallel: 1.5,
  nirtzah: 0.75,
};

const CONCISE_SPOKEN_WPM: Record<GenerationProfile["audience"], number> = {
  adults: 140,
  mixed: 130,
  kids: 120,
};

const CONCISE_AUDIENCE_ACTION_MINUTES: Record<GenerationProfile["audience"], number> = {
  adults: 0,
  mixed: 0.75,
  kids: 1.5,
};

export interface ConciseTimingAudit {
  bodyWords: number;
  bridgeWords: number;
  optionalPromptWords: number;
  quoteWords: number;
  requiredSpokenWords: number;
  totalRenderedWords: number;
  spokenWordsPerMinute: number;
  requiredReadingMinutes: number;
  realisticActionMinutes: number;
  estimatedCoreLiveMinutes: number;
  displayedLiveMinutes: number;
}

const countWords = (value: string | undefined): number =>
  (value ?? "").trim().split(/\s+/u).filter(Boolean).length;

/**
 * Audits the concise tier as it will be led: all body copy, transitions, and
 * quote callouts are counted as spoken; table questions are explicitly
 * optional. Dinner is outside the estimate.
 */
export function auditConciseTiming(document: HaggadahDocument): ConciseTimingAudit {
  if (document.profile.length !== 20) {
    throw new Error("Concise timing audit requires a 20-minute content-tier document.");
  }
  const bodyWords = document.sections.reduce(
    (sum, section) => sum + section.body.reduce((bodySum, paragraph) => bodySum + countWords(paragraph), 0),
    0,
  );
  const bridgeWords = document.sections.reduce((sum, section) => sum + countWords(section.bridge), 0);
  const optionalPromptWords = document.sections.reduce((sum, section) => sum + countWords(section.prompt), 0);
  const quoteWords = document.sections.reduce(
    (sum, section) => sum + (section.quote
      ? countWords(section.quoteContext) + countWords(section.quote.text)
      : 0),
    0,
  );
  const requiredSpokenWords = bodyWords + bridgeWords + quoteWords;
  const totalRenderedWords = requiredSpokenWords + optionalPromptWords;
  const spokenWordsPerMinute = CONCISE_SPOKEN_WPM[document.profile.audience];
  const requiredReadingMinutes = requiredSpokenWords / spokenWordsPerMinute;
  const realisticActionMinutes = Object.values(CONCISE_ACTION_MINUTES)
    .reduce((sum, minutes) => sum + minutes, 0) +
    CONCISE_AUDIENCE_ACTION_MINUTES[document.profile.audience];
  return {
    bodyWords,
    bridgeWords,
    optionalPromptWords,
    quoteWords,
    requiredSpokenWords,
    totalRenderedWords,
    spokenWordsPerMinute,
    requiredReadingMinutes,
    realisticActionMinutes,
    estimatedCoreLiveMinutes: requiredReadingMinutes + realisticActionMinutes,
    displayedLiveMinutes: document.sections.reduce((sum, section) => sum + section.minutes, 0),
  };
}

function allocateMinutes(length: GenerationProfile["length"]): number[] {
  return SECTION_ORDER.map((sectionId) => LIVE_SECTION_MINUTES[length][sectionId]);
}

function humanSederDate(value: string): string {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return trimmed;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function invitation(profile: GenerationProfile): string {
  const host = profile.hostName.trim();
  const date = humanSederDate(profile.sederDate);
  const themes = selectedThemes(profile).map((theme) => themeLabels[theme]);
  const custom = profile.customTheme.trim();
  const values = custom ? `${themes.join(", ")}, and ${custom}` : themes.join(", ");
  const liveRange = LIVE_PLANNING_RANGES[profile.length].label;
  const opening = host && date
    ? `${host} invites you to a Passover seder on ${date}, planned for about ${liveRange} before dinner`
    : host
      ? `${host} invites you to a Passover seder on Passover night, planned for about ${liveRange} before dinner`
      : date
        ? `You’re invited to a Passover seder on ${date}, planned for about ${liveRange} before dinner`
        : `You’re invited to a Passover seder on Passover night, planned for about ${liveRange} before dinner`;
  return `${opening}, shaped around ${values}. A seder is a participatory Passover meal: we will take turns reading, ask questions, taste symbolic foods, tell the Exodus story, share dinner, and sing or listen together. No Passover or Hebrew experience is needed. You are welcome to read, share a thought or memory, help with a ritual, listen, or pass at any time.`;
}

function hostGuide(profile: GenerationProfile): string[] {
  const liveMinutes = Object.values(LIVE_SECTION_MINUTES[profile.length])
    .reduce((sum, minutes) => sum + minutes, 0);
  const liveRange = LIVE_PLANNING_RANGES[profile.length].label;
  const guide = [
    `Timing: you chose the ${profile.length}-minute content tier. This controls the amount of reading; the table questions are optional. Live group rituals need additional time. The displayed small-table estimates total ${liveMinutes} minutes, so plan roughly ${liveRange} for the core readings, pouring, washing, dipping, plague activity, afikoman search, and songs. The festive dinner is additional, and each optional question you discuss may add 2–5 minutes. For 10–15 guests, multiple young children, ceremonial partner-pouring, or fuller conversation, add at least 10–20 minutes. Read through the Haggadah once, choose which optional prompts to keep, then allow separate time for arrival and the meal.`,
    "Set each place with a Haggadah, napkin, water glass, and a small wine glass or juice cup. Put the seder plate, three covered matzah pieces, salt water, extra matzah, wine or grape juice, and a washing bowl with pitcher and towel within easy reach.",
    "The four cups pace the seder from beginning to end: the first opens Kadesh, the second is poured before the Four Questions and drunk after Maggid, the third follows gratitude after dinner, and the fourth closes Hallel. Pour small amounts, and offer grape juice or another celebratory drink without explanation or pressure. Guests may sip rather than finish each cup; at two ounces per cup, allow about eight ounces per guest.",
    "Matzah is unleavened bread that recalls the Israelites leaving Egypt before dough could rise. Place three pieces together under a cloth or in a matzah cover, plus enough extra for everyone to taste during the meal.",
    "There are two handwashings. Urchatz comes before karpas and has no blessing; Rachtzah comes before eating matzah and includes a blessing. At either washing, guests may wash their own hands at a sink or over the basin, or work in pairs while one person gently pours water over the other’s hands above the basin and then they switch. Explain the choices and the difference between the two washings before each one. Each washing usually needs 2–4 minutes at a small table; plan at least 5 minutes for about 15 people or for ceremonial partner-pouring.",
    "Miriam’s cup is optional. If you use it, choose any cup, fill it with water before guests arrive, and place it near the seder plate. The Urchatz reading connects the water with Miriam and the well that sustained the Israelites in the wilderness.",
    "At Yachatz, break the middle matzah and hide or set aside the larger half, called the afikoman. Near the end, children or adults find it; everyone eats a small piece as the final taste of the meal. Decide beforehand whether the finder receives a small prize, chooses a song, or earns a shared treat.",
    "The festive meal occurs at Shulchan Orech. Serve food that works for your guests and your own Passover practice. Tell guests when the meal begins, keep the afikoman separate, and resume the Haggadah after plates are cleared.",
    "Invite readers before the seder when possible and make passing an ordinary option. Read every stage direction aloud; no prior knowledge, Hebrew, singing ability, or religious belief is assumed. The Four Questions, all ten plagues, a short Dayenu, and an easy Hallel response are printed in the Haggadah, so the host does not need to supply missing words or melodies.",
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

export function generateHaggadah(
  profile: GenerationProfile,
  runtimeContext: RuntimePassageContext = smokeRuntimeContext,
  preferredFeaturedSourceId?: string,
): HaggadahDocument {
  const profileKey = stableProfile(profile);
  const sourceSpineId = selectSourceSpine(profile);
  const proceduralBackboneSourceId = sourceIdForSpine(sourceSpineId);
  const preferredCandidates = preferredFeaturedSourceId
    ? runtimePassageCandidates(
      profile,
      proceduralBackboneSourceId,
      preferredFeaturedSourceId,
      12,
      runtimeContext,
    )
    : [];
  const preferredIsUsable = preferredCandidates.some(
    (candidate) => candidate.source.sourceId === preferredFeaturedSourceId,
  );
  const featuredSourceId = preferredIsUsable
    ? preferredFeaturedSourceId!
    : runtimeFeaturedSource(
      profile,
      proceduralBackboneSourceId,
      runtimeContext,
    )?.sourceId ?? proceduralBackboneSourceId;
  const runtimeCandidates = runtimePassageCandidates(
    profile,
    proceduralBackboneSourceId,
    featuredSourceId,
    12,
    runtimeContext,
  );
  const selectedRuntimePassages = selectRuntimePassages(
    profile,
    proceduralBackboneSourceId,
    featuredSourceId,
    undefined,
    runtimeContext,
  );
  const runtimePassagesBySection = new Map<SederSectionId, RuntimePassageCandidate[]>();
  for (const candidate of selectedRuntimePassages) {
    const existing = runtimePassagesBySection.get(candidate.sectionId) ?? [];
    runtimePassagesBySection.set(candidate.sectionId, [...existing, candidate]);
  }
  const minutes = allocateMinutes(profile.length);
  const quoteSectionIds = quoteSectionsForLength(profile.length);
  const quotesBySection = selectQuotes(profile, quoteSectionIds);
  const themedMoments = assignedThemeMoments(profile);
  const composedSections = sectionBlueprints.map((blueprint, index) => {
    const composition = bodyForLength(
      blueprint,
      profile,
      sourceSpineId,
      runtimePassagesBySection.get(blueprint.id as SederSectionId),
    );
    const themedMoment = themedMoments.get(blueprint.id);
    const includePrompt = profile.length !== 20 ||
      Boolean(themedMoment) ||
      blueprint.id === "maggid" ||
      blueprint.id === "nirtzah";
    return {
      blueprint,
      composition,
      prompt: includePrompt
        ? promptForAudience(blueprint.id, profile, themedMoment)
        : "",
      bridge: audienceBridge(profile, index, themedMoment),
      quote: quotesBySection.get(blueprint.id),
    };
  });

  const sourceAssembly: HaggadahAssembly = {
    spineId: sourceSpineId,
    tier: profile.length,
    // Source-share accounting covers the Haggadah reading itself. Optional
    // discussion questions and short personalized transitions are measured
    // separately; otherwise a concise, highly participatory edition appears
    // less source-led merely because it offers more ways to join in.
    sections: composedSections.map(({ blueprint, composition }) => ({
      sectionId: blueprint.id as SederSectionId,
      blocks: [...composition.blocks],
    })),
  };
  const sourceErrors = validateAssembly(sourceAssembly);
  if (sourceErrors.length > 0) {
    throw new Error(`Source-spine validation failed:\n- ${sourceErrors.join("\n- ")}`);
  }
  const measuredSources = sourceShareMetrics(sourceAssembly);
  const runtimeBorrowedWords = selectedRuntimePassages.reduce(
    (sum, candidate) => sum + candidate.passage.wordCount,
    0,
  );
  const borrowedWords = measuredSources.borrowedWords + runtimeBorrowedWords;
  const borrowedWordShare = borrowedWords / (measuredSources.totalWords + runtimeBorrowedWords);
  if (borrowedWordShare < 0.5) {
    throw new Error(
      `Source-first assembly fell below the 50% reviewed-source floor (${Math.round(borrowedWordShare * 100)}%; ${borrowedWords} reviewed-source, ${measuredSources.houseWords} house, ${measuredSources.traditionalWords} traditional words).`,
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
        sourceIds: [...new Set([
          proceduralBackboneSourceId as string,
          ...(composition.blocks.some((block) => block.kind === "traditional-liturgy")
            ? ["traditional-core"]
            : []),
          ...composition.runtimeSourceIds,
        ])],
        passageIds: composition.passageIds,
      };
      if (quote) {
        section.quote = quote;
        section.quoteContext = quoteContextFor(quote, blueprint.id);
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
    featuredSourceId,
    sourceMetrics: {
      proceduralBackboneSourceId,
      featuredSourceId,
      featuredSourceWords:
        (featuredSourceId === proceduralBackboneSourceId
          ? measuredSources.bySource[proceduralBackboneSourceId]?.words ?? 0
          : 0) +
        selectedRuntimePassages
          .filter((candidate) => candidate.source.sourceId === featuredSourceId)
          .reduce((sum, candidate) => sum + candidate.passage.wordCount, 0),
      supportingSourceIds: [...new Set(
        selectedRuntimePassages
          .filter((candidate) => candidate.source.sourceId !== featuredSourceId)
          .map((candidate) => candidate.source.sourceId),
      )],
      borrowedWords,
      houseWords: measuredSources.houseWords,
      traditionalWords: measuredSources.traditionalWords,
      borrowedWordShare,
    },
    runtimePassageCandidateIds: runtimeCandidates.map((candidate) => candidate.passage.id),
    runtimeContentMode: runtimeContext.mode,
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
  runtimeContext: RuntimePassageContext = smokeRuntimeContext,
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
    sourceMetrics: {
      ...document.sourceMetrics,
      supportingSourceIds: [...document.sourceMetrics.supportingSourceIds],
    },
    runtimePassageCandidateIds: [...document.runtimePassageCandidateIds],
    editorialWarnings: [],
  };

  if (enhancement.passageIds?.length) {
    const allowed = new Set(document.runtimePassageCandidateIds);
    for (const passageId of enhancement.passageIds) {
      if (!allowed.has(passageId)) {
        throw new Error(`Model suggested runtime passage outside its allowlisted shortlist: ${passageId}.`);
      }
    }
    const selected = selectRuntimePassages(
      document.profile,
      document.sourceMetrics.proceduralBackboneSourceId,
      document.featuredSourceId,
      enhancement.passageIds,
      runtimeContext,
    );
    let removedWords = 0;
    let removedFeaturedWords = 0;
    for (const section of next.sections) {
      const currentRuntimePassages = section.passageIds
        .map((passageId) => runtimePassageById(passageId, runtimeContext))
        .filter((passage): passage is NonNullable<typeof passage> => Boolean(passage));
      for (const passage of currentRuntimePassages) {
        const bodyIndex = section.body.indexOf(passage.exactText);
        if (bodyIndex < 0) {
          throw new Error(`Runtime passage ${passage.id} no longer matches its exact approved text.`);
        }
        section.body.splice(bodyIndex, 1);
        if (passage.beginnerContext) {
          const contextIndex = section.body.indexOf(passage.beginnerContext);
          if (contextIndex >= 0) section.body.splice(contextIndex, 1);
        }
        removedWords += passage.wordCount;
        if (passage.sourceId === document.featuredSourceId) {
          removedFeaturedWords += passage.wordCount;
        }
      }
      const removedIds = new Set(currentRuntimePassages.map((passage) => passage.id));
      section.passageIds = section.passageIds.filter((passageId) => !removedIds.has(passageId));
      const proceduralBackboneSourceId = document.sourceMetrics.proceduralBackboneSourceId;
      const keepsTraditionalLiturgy = sectionHasTraditionalLiturgy(
        section.id as SederSectionId,
        document.profile,
        document.sourceSpineId,
      );
      section.sourceIds = [
        proceduralBackboneSourceId,
        ...(keepsTraditionalLiturgy ? ["traditional-core"] : []),
      ];
    }
    for (const candidate of selected) {
      const section = next.sections.find((item) => item.id === candidate.sectionId);
      if (!section) throw new Error(`Runtime passage ${candidate.passage.id} has no valid section.`);
      section.body = bodyWithRuntimePassages(
        section.body,
        candidate.sectionId,
        document.profile,
        [candidate],
      );
      section.passageIds.push(candidate.passage.id);
      section.sourceIds = [...new Set([...section.sourceIds, candidate.source.sourceId])];
    }
    const insertedWords = selected.reduce((sum, candidate) => sum + candidate.passage.wordCount, 0);
    const insertedFeaturedWords = selected
      .filter((candidate) => candidate.source.sourceId === document.featuredSourceId)
      .reduce((sum, candidate) => sum + candidate.passage.wordCount, 0);
    next.sourceMetrics.borrowedWords = next.sourceMetrics.borrowedWords - removedWords + insertedWords;
    next.sourceMetrics.featuredSourceWords =
      next.sourceMetrics.featuredSourceWords - removedFeaturedWords + insertedFeaturedWords;
    next.sourceMetrics.supportingSourceIds = [...new Set(
      selected
        .filter((candidate) => candidate.source.sourceId !== document.featuredSourceId)
        .map((candidate) => candidate.source.sourceId),
    )];
    next.sourceMetrics.borrowedWordShare = next.sourceMetrics.borrowedWords /
      (next.sourceMetrics.borrowedWords + next.sourceMetrics.houseWords);
  }

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
      if (!CONTEXTUAL_QUOTE_IDS[sectionId]?.has(quoteId)) {
        throw new Error(
          `Model suggested quote ${quoteId} outside the seam-specific review for ${sectionId}.`,
        );
      }
      if (quote.externalContemplative && !document.profile.themes.includes("mindfulness")) {
        throw new Error(
          `Model suggested external contemplative quote ${quoteId} without the Mindfulness & spiritual depth theme.`,
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
        section.quoteContext = quoteContextFor(quote, sectionId);
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
            CONTEXTUAL_QUOTE_IDS[sectionId]?.has(quote.id) &&
            quote.themes.some((theme) => selectedThemes(document.profile).includes(theme)) &&
            (!quote.externalContemplative || document.profile.themes.includes("mindfulness")) &&
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

/**
 * Upgrade the immediate smoke-index draft only when the comprehensive approval
 * gate permits lazy source packs. A loader or validation failure returns the
 * ordinary deterministic draft rather than interrupting generation.
 */
export async function generateHaggadahWithRuntimePacks(
  profile: GenerationProfile,
): Promise<HaggadahDocument> {
  const sourceSpineId = selectSourceSpine(profile);
  const proceduralBackboneSourceId = sourceIdForSpine(sourceSpineId);
  const loaded = await loadRuntimeContextForProfile(profile, proceduralBackboneSourceId);
  return generateHaggadah(profile, loaded.context, loaded.featuredSourceId);
}

/** Rehydrate the same lazy context before applying model-selected passage IDs. */
export async function mergeModelEnhancementWithRuntimePacks(
  document: HaggadahDocument,
  enhancement: ModelEnhancement,
): Promise<HaggadahDocument> {
  if (document.runtimeContentMode !== "per-source-dynamic") {
    return mergeModelEnhancement(document, enhancement, smokeRuntimeContext);
  }
  const loaded = await loadRuntimeContextForProfile(
    document.profile,
    document.sourceMetrics.proceduralBackboneSourceId,
    {
      featuredSourceId: document.featuredSourceId,
      requestedPassageIds: document.runtimePassageCandidateIds,
    },
  );
  if (!loaded.usedComprehensivePack) {
    throw new Error("The approved comprehensive source context could not be reloaded safely.");
  }
  return mergeModelEnhancement(document, enhancement, loaded.context);
}
