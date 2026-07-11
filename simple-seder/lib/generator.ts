import {
  coverOptions,
  foundationalPassages,
  quoteCatalog,
  sectionBlueprints,
  themeInserts,
  themeLabels,
  toneOpeners,
} from "../content/pack";
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
  if (length === 20) return ["maggid", "nirtzah"];
  return ["maggid", "tzafun", "nirtzah"];
}

const quoteContexts: Record<string, string> = {
  kadesh: "A line to help us enter the evening with intention:",
  maggid: "A voice on liberation and the work it asks of us:",
  tzafun: "A thought about what can be hidden, remembered, and recovered:",
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
  const focusSections = new Set(["karpas", "maggid", "shulchan-orech", "nirtzah"]);
  if (profile.themes.length === 0 || !focusSections.has(sectionId)) return neutral;

  const themes = selectedThemes(profile);
  const theme = themes[sectionIndex % themes.length];
  const insertIndex = contextualThemeInsertIndex[theme][sectionId];
  const insert = themeInserts[theme][insertIndex];
  return `${neutral} ${insert.text}`;
}

const kidParticipation: Record<string, string> = {
  kadesh: "Invite a child to help pour a little grape juice into each cup, then lift the cups together.",
  urchatz: "At the table, an adult can carry the bowl and pitcher while each child holds out their hands to be washed.",
  karpas: "Let children dip their own parsley or celery in the salt water and describe how it tastes.",
  yachatz: "Show children which piece of matzah becomes the afikoman. They will search for it after dinner, and the finder often receives a small prize.",
  maggid: "Invite children to ask the Four Questions, remove one drop of grape juice for each plague, and help sing Dayenu.",
  rachtzah: "Each child washes their own hands before the matzah; an adult can help with the pitcher and towel.",
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
  urchatz: "Move around the table slowly so each person knows when it is their turn to wash.",
  karpas: "Pass the greens and salt water together before anyone begins eating.",
  yachatz: "Show both pieces of matzah clearly before wrapping and hiding the larger one.",
  maggid: "Share the reading among willing voices; anyone may ask a question or pass.",
  rachtzah: "Make the bowl, pitcher, towel, and route back to the table easy to find.",
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

function bodyForLength(
  blueprint: (typeof sectionBlueprints)[number],
  profile: GenerationProfile,
): string[] {
  const body =
    profile.length === 20
      ? blueprint.short
      : profile.length === 45
        ? blueprint.medium
        : blueprint.full;
  const paragraphs = [...body];
  const foundation = foundationalPassages.find(
    (passage) => passage.sectionId === blueprint.id,
  );
  if (foundation && !paragraphs.some((paragraph) => paragraph.includes(foundation.text))) {
    paragraphs.unshift(foundation.text);
  }

  if (blueprint.id === "kadesh") {
    paragraphs.unshift(
      deterministicItem(
        toneOpeners[profile.tone],
        `tone:${stableProfile(profile)}`,
      ),
      "A seder is Passover’s home ritual meal. Haggadah means ‘telling’: this booklet leads us through an ordered journey of welcome, symbolic foods, the Exodus story, a festive meal, gratitude, songs, and a closing hope. The leader can read every direction aloud, and anyone may ask a question or pass.",
    );
  }

  if (blueprint.id === "maggid") {
    paragraphs.unshift(
      "Here is the story we are telling. The Israelites were enslaved in Egypt under Pharaoh. After courageous women saved lives, Moses confronted Pharaoh and demanded freedom. Ten plagues followed; we name them while mourning the suffering they caused. The Israelites left in haste, crossed the sea, and began the difficult work of becoming a free people. The seder asks every generation to enter that journey and consider what freedom requires now.",
    );
  }

  if (profile.language === "transliteration" && blueprint.blessing) {
    paragraphs.push(blueprint.blessing);
  }

  if (blueprint.id === "nirtzah") {
    return frameClosing(paragraphs, profile.antiZionist);
  }
  return paragraphs;
}

function frameClosing(paragraphs: string[], antiZionist: boolean): string[] {
  if (antiZionist) {
    return paragraphs.map((paragraph) =>
      paragraph
        .replace(
          /Next year in Jerusalem\.?(?:—not as a claim of exclusivity, but as an old expression of hope for wholeness, justice, and home\.)?/gi,
          "Next year in peace. May every people live with freedom, safety, dignity, and equality.",
        )
        .replace(
          /Next year may every people move closer to freedom\./gi,
          "May every people move closer to freedom, safety, dignity, and equality.",
        ),
    );
  }

  return paragraphs.map((paragraph) =>
    /Next year in Jerusalem\.?$/i.test(paragraph)
      ? `${paragraph} We hold this as an old hope for shared freedom, not as a claim of exclusivity.`
      : paragraph,
  );
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
  return `${host} invites you to a ${profile.length}-minute seder on ${date}, shaped around ${values}. Come ready to ask, listen, eat, and help tell the story.`;
}

function hostGuide(profile: GenerationProfile): string[] {
  const guide = [
    `Timing: the generated ritual is paced for about ${profile.length} minutes, including a simple meal pause. Read through it once, then add 15 minutes of arrival time and allow extra time if your meal is elaborate or your table enjoys discussion.`,
    "Set each place with a Haggadah, napkin, water glass, and a small wine glass or juice cup. Put the seder plate, three covered matzah pieces, salt water, extra matzah, wine or grape juice, and a washing bowl with pitcher and towel within easy reach.",
    "The four cups pace the seder from beginning to end. Pour small amounts, and offer grape juice or another celebratory drink without explanation or pressure. Guests may sip rather than finish each cup.",
    "Matzah is unleavened bread that recalls the Israelites leaving Egypt before dough could rise. Place three pieces together under a cloth or in a matzah cover, plus enough extra for everyone to taste during the meal.",
    "There are two handwashings. Urchatz comes before karpas and has no blessing; pass a bowl and towel or invite guests to a sink. Rachtzah comes before eating matzah and includes a blessing. Explain the difference before each one.",
    "At Yachatz, break the middle matzah and hide or set aside the larger half, called the afikoman. Near the end, children or adults find it; everyone eats a small piece as the final taste of the meal. Decide beforehand whether the finder receives a small prize, chooses a song, or earns a shared treat.",
    "The festive meal occurs at Shulchan Orech. Serve food that works for your guests and your own Passover practice. Tell guests when the meal begins, keep the afikoman separate, and resume the Haggadah after plates are cleared.",
    "Invite readers before the seder when possible and make passing an ordinary option. Read every stage direction aloud; no prior knowledge, Hebrew, singing ability, or religious belief is assumed.",
    "Share cooking, pouring, serving, explaining, and cleanup. Assign one person to refill drinks, one to manage ritual objects, and one to help everyone find the current page.",
    "Ten minutes before guests arrive, fill the salt-water bowl, arrange the seder plate, cover the matzah, chill or open drinks, place the washing supplies, and choose the afikoman hiding place.",
  ];
  if (profile.audience !== "adults") {
    guide.push("Give younger guests movement, snack, and afikoman roles early.");
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

function sederPlateGuide(): SederPlateGuideEntry[] {
  return [
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
  return list;
}

export function generateHaggadah(profile: GenerationProfile): HaggadahDocument {
  const profileKey = stableProfile(profile);
  const minutes = allocateMinutes(profile.length);
  const quoteSectionIds = quoteSectionsForLength(profile.length);
  const quotesBySection = selectQuotes(profile, quoteSectionIds);
  const sections: HaggadahSection[] = sectionBlueprints.map(
    (blueprint, index) => {
      const quote = quotesBySection.get(blueprint.id);
      const passageRecords = foundationalPassages.filter(
        (passage) => passage.sectionId === blueprint.id,
      );
      const section: HaggadahSection = {
        id: blueprint.id,
        order: index + 1,
        transliteration:
          profile.language === "transliteration" ? blueprint.transliteration : "",
        title: blueprint.title,
        ritual: blueprint.ritual,
        body: bodyForLength(blueprint, profile),
        prompt: promptForAudience(blueprint.id, blueprint.prompt, profile),
        bridge: audienceBridge(profile, index),
        minutes: minutes[index],
        sourceIds: [...new Set([
          ...blueprint.sourceIds,
          ...passageRecords.map((passage) => passage.sourceId),
        ])],
        passageIds: passageRecords.map((passage) => passage.id),
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
    sederPlateGuide: sederPlateGuide(),
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
