import type { CoverOption, QuoteEntry, SederLength, ThemeId, Tone } from "@/lib/types";
import type { SederSectionId } from "./source-spines";
import { expandedQuoteCatalog } from "./quotes-expanded";

export const themeLabels: Record<ThemeId, string> = {
  feminist: "Feminist & women’s voices",
  lgbtq: "LGBTQ+ & gender-expansive",
  "social-justice": "Social justice & racial equity",
  environment: "Environment & climate",
  interfaith: "Interfaith & welcoming",
  secular: "Secular & humanist",
  mindfulness: "Mindfulness & spiritual depth",
  traditional: "Traditional",
  "family-storytelling": "Family storytelling",
};

export const themeDescriptions: Record<ThemeId, string> = {
  feminist: "Centers Miriam, the midwives, and women’s leadership.",
  lgbtq: "Uses inclusive language and honors every kind of family.",
  "social-justice": "Connects Exodus with unfinished struggles for freedom.",
  environment: "Brings earth, seasons, and responsibility into the ritual.",
  interfaith: "Explains symbols clearly and welcomes guests of every background.",
  secular: "Centers human agency, memory, and collective action.",
  mindfulness: "Adds intention, spaciousness, and moments to breathe.",
  traditional: "Keeps close to familiar ritual language and order.",
  "family-storytelling": "Makes room for migration stories, memories, and chosen family.",
};

export interface SectionBlueprint {
  id: string;
  transliteration: string;
  title: string;
  ritual: string;
  short: string[];
  medium: string[];
  full: string[];
  prompt: string;
  blessing?: string;
  /** Direct sources for compiled words only; research influences do not belong here. */
  sourceIds: string[];
}

export interface SectionCopyProvenance {
  sectionId: string;
  foundationalPassageId: string;
  directLicensedSourceId: "shir-geulah" | "velveteen-rabbi";
  runtimePlacement: Record<"short" | "medium" | "full", number | "prepended">;
  blueprintFields: {
    title: "original";
    ritual: "original";
    prompt: "original";
    blessing: "traditional-liturgical" | "none";
    remainingBodyParagraphs: "original";
  };
}

export interface FoundationalPassage {
  id: string;
  sectionId: string;
  text: string;
  sourceId: "shir-geulah" | "velveteen-rabbi";
  treatment: "verbatim" | "lightly-adapted";
  locator: string;
  sourceExcerpt: string;
  modificationNote: string;
  provenanceHash: string;
  /** Omitted on current author-written anchors; required when adding an embedded work. */
  materialKind?: "containing-author" | "embedded-third-party";
  /** Preserve this exactly as printed when materialKind is embedded-third-party. */
  sourcePresentedAttribution?: string;
  attribution: string;
}

/**
 * Reviewed ritual anchors borrowed from explicitly reusable Haggadot. These are
 * kept separate from original beginner explanations so provenance is auditable.
 */
export const foundationalPassages: FoundationalPassage[] = [
  { id: "fp-kadesh-shir", sectionId: "kadesh", text: "During the seder, we drink four cups of wine.", sourceId: "shir-geulah", treatment: "verbatim", locator: "PDF p. 12, Kadeish", sourceExcerpt: "During the seder, we drink four cups of wine.", modificationNote: "No wording changes.", provenanceHash: "bc138f713c3d58b4eb133e9a7883de7cdd5efd8a6ee6ccf0978860aaea96c94a", attribution: "From Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-urchatz-shir", sectionId: "urchatz", text: "Wash the hands without a blessing.", sourceId: "shir-geulah", treatment: "verbatim", locator: "PDF p. 15, U-r’hatz", sourceExcerpt: "Wash the hands without a blessing.", modificationNote: "No wording changes.", provenanceHash: "8cdb4f3e5c8db8161ad44bf5d5651565162ec0d657be07e56260c265a3db5de9", attribution: "From Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-karpas-shir", sectionId: "karpas", text: "Take a vegetable other than the maror and dip it.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 15, Karpas", sourceExcerpt: "Take a vegetable (other than the maror) and dip it.", modificationNote: "Removed parentheses; wording is otherwise unchanged.", provenanceHash: "060471a15e7cc535358013198e5e61932d97d3fe1ed1cfdf0a0a05718370f90f", attribution: "Adapted from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0; parentheses removed." },
  { id: "fp-yachatz-shir", sectionId: "yachatz", text: "The middle matzah is broken in half. The smaller half is returned to the seder plate, and the larger half is wrapped up to become the afikoman.", sourceId: "shir-geulah", treatment: "verbatim", locator: "PDF p. 16, Yahatz", sourceExcerpt: "The middle matzah is broken in half. The smaller half is returned to the seder plate, and the larger half is wrapped up to become the afikoman.", modificationNote: "No wording changes.", provenanceHash: "025adae270ecedfae64154ba20c8586c383e70f334ce989a061d67f176227d90", attribution: "From Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-maggid-vr", sectionId: "maggid", text: "Maggid, the Hebrew word for “story,” is at the root of the word haggadah.", sourceId: "velveteen-rabbi", treatment: "verbatim", locator: "PDF p. 18, Maggid", sourceExcerpt: "Maggid, the Hebrew word for “story,” is at the root of the word haggadah.", modificationNote: "No wording changes.", provenanceHash: "47ed6672bb8a62a6be23de128b11d9924646a96e7143482f9214b074e4207a0b", attribution: "From The Velveteen Rabbi’s Haggadah for Pesach by Rabbi Rachel Barenblat; reused with credit under the author’s explicit permission." },
  { id: "fp-rachtzah-shir", sectionId: "rachtzah", text: "Wash the hands ceremonially, and afterwards recite the handwashing blessing.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 33, Roh’tzah", sourceExcerpt: "Wash the hands ceremonially, and afterwards recite the following blessing:", modificationNote: "Replaced “the following blessing” with “the handwashing blessing” and changed the colon to a period.", provenanceHash: "ad35a5ee830bfff5bb0dd65ab48c29b6b30578810c74d31b54fec78969ee685b", attribution: "Adapted for clarity from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-motzi-shir", sectionId: "motzi-matzah", text: "Take a piece of matzah, and recite the following two blessings.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 34, Motzi and Matzah", sourceExcerpt: "Take a piece of matzah, and recite the following two blessings:", modificationNote: "Changed the source colon to a period because the blessings are rendered separately.", provenanceHash: "652d9e392af404e72de3945d0914f1148a3d498d0321b3177f86a6fa3853efff", attribution: "Adapted for punctuation from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-maror-shir", sectionId: "maror", text: "Take a piece of maror and dip it in charoset. Then recite the blessing.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 34, Maror", sourceExcerpt: "Take a piece of maror and dip it in ḥaroset. Then recite the following blessing:", modificationNote: "Changed ḥaroset to charoset, shortened “the following blessing” to “the blessing,” and changed the colon to a period.", provenanceHash: "a902b9a8a1c7ff128047f406cce4a8b08b678933c83b033e9df351488e67e427", attribution: "Adapted for spelling and brevity from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-korech-shir", sectionId: "korech", text: "Take two pieces of matzah, and sandwich some maror and charoset between the pieces.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 35, Koreich", sourceExcerpt: "Take two pieces of matzah, and sandwich some maror and ḥaroset between the pieces.", modificationNote: "Changed ḥaroset to charoset; wording is otherwise unchanged.", provenanceHash: "1d75cdb0db3489113b006a277ef6aa34595fc57d3b214aa2ba1ffeae5213daf9", attribution: "Adapted for spelling from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-meal-shir", sectionId: "shulchan-orech", text: "One of the traditional things we do to celebrate is partake of a festive meal.", sourceId: "shir-geulah", treatment: "verbatim", locator: "PDF p. 36, Shul’han Oreich commentary", sourceExcerpt: "One of the traditional things we do to celebrate is partake of a festive meal.", modificationNote: "No wording changes; excerpted from the middle of an author-written paragraph.", provenanceHash: "8637ce00f78de40b67f8c7b6e91bb54476e0847318a476a3dc2ceb2671f190e6", attribution: "From Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-tzafun-shir", sectionId: "tzafun", text: "A piece of the afikoman is distributed to each participant.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 36, Tzafun", sourceExcerpt: "A piece of the afikoman is distributed to each participant, which is eaten while reclining.", modificationNote: "Omitted the dependent clause about reclining and changed the comma to a period.", provenanceHash: "e4514b4881f967f773be8ff35be5d4d854f5cc883c5b64a46837894d2a827ef0", attribution: "Adapted for brevity from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-barech-shir", sectionId: "barech", text: "Fill the third cup with wine or grape juice.", sourceId: "shir-geulah", treatment: "lightly-adapted", locator: "PDF p. 37, Bareich", sourceExcerpt: "Fill the third cup.", modificationNote: "Added “with wine or grape juice” as an accessibility clarification; the added words are original connective copy, not quoted source wording.", provenanceHash: "61ec0fac74fead4210605ce8fa1419e8f51b4fc3830939892aac7f9e48042a91", attribution: "Adapted with an accessibility clarification from Haggadah Shir Ge’ulah by Emily Aviva Kapor-Mater, CC BY 4.0." },
  { id: "fp-hallel-vr", sectionId: "hallel", text: "The traditional Hallel consists of the recitation of several psalms.", sourceId: "velveteen-rabbi", treatment: "lightly-adapted", locator: "PDF p. 56, Hallel part 2", sourceExcerpt: "The traditional Hallel consists of recitation of several psalms.", modificationNote: "Added “the” before “recitation”; wording is otherwise unchanged.", provenanceHash: "1f50644844e1f73688c14d5e9e57bd53a0512cc0cf48fba22e3396c71861fd66", attribution: "Adapted for grammar from The Velveteen Rabbi’s Haggadah for Pesach by Rabbi Rachel Barenblat; reused with credit under the author’s explicit permission." },
  { id: "fp-nirtzah-vr", sectionId: "nirtzah", text: "Tonight we have acknowledged our ancestors.", sourceId: "velveteen-rabbi", treatment: "verbatim", locator: "PDF p. 69, Nirtzah", sourceExcerpt: "Tonight we have acknowledged our ancestors.", modificationNote: "No wording changes.", provenanceHash: "2d5a2f6dc996b72b633fd6c66e7eb61ccaa67d7696d27c644669e46dfa4851db", attribution: "From The Velveteen Rabbi’s Haggadah for Pesach by Rabbi Rachel Barenblat; reused with credit under the author’s explicit permission." },
];

export const sectionBlueprints: SectionBlueprint[] = [
  {
    id: "kadesh", transliteration: "Kadesh", title: "Make this time special", ritual: "First cup of wine or grape juice & welcome",
    short: ["Pour a small first cup of wine or grape juice for each person. Lift the cup together, read the blessing aloud if you wish, and take a sip. Kadesh opens the seder by setting this evening apart for story, ritual, questions, and company.", "Welcome everyone at the table. No prior knowledge is needed; listening, asking, reading, and helping with the ritual are all ways to take part."],
    medium: ["Pour the first of four small cups of wine or grape juice for each person. Kadesh means making something special. Lift the cup, read the blessing aloud if you wish, and name what you hope this table can hold: curiosity, honesty, joy, and room for everyone.", "Passover begins with attention. We notice who is here, who is missing, and what freedom asks of us now, even when certainty eludes us."],
    full: ["Pour the first of four small cups of wine or grape juice. Lift it together and read the blessing aloud if you wish. This cup marks a threshold: an ordinary moment becomes sacred when we pause and give it our attention.", "Tonight we inherit an old story that has traveled through many kinds of Jewish families and communities. We enter it together, bringing belief, doubt, memory, and questions.", "May this table make room for safety, dignity, and peace for every people."],
    prompt: "Name one word you hope describes tonight’s seder.",
    blessing: "Barukh atah Adonai, Eloheinu melekh ha’olam, borei p’ri hagafen.", sourceIds: ["traditional-core"]
  },
  {
    id: "urchatz", transliteration: "Urchatz", title: "Wash without a blessing", ritual: "First handwashing",
    short: ["Choose how to wash: each person may pour water over their own hands above a basin or at a sink, or partners may take turns, with one person gently pouring water over the other’s hands above the basin before switching roles. Use the towel afterward. Do not say a blessing at this first washing.", "This first washing is a quiet preparation. It helps us leave the rush of arrival behind and become present for the seder."],
    medium: ["Choose self-washing or partner-washing over the basin, then dry your hands. This washing has no spoken blessing; its silence lets the physical action speak for itself.", "Let the water mark a shift from arriving to being present."],
    full: ["Choose self-washing or take turns with a partner, gently pouring water over one another’s hands above the basin. Water appears throughout the Exodus story: dangerous, life-giving, and capable of change.", "We wash without a blessing, leaving a little room for uncertainty. Freedom begins before we have the perfect words for it."],
    prompt: "As the water runs, notice one worry you are ready to let go of.", sourceIds: ["traditional-core"]
  },
  {
    id: "karpas", transliteration: "Karpas", title: "Taste spring—and tears", ritual: "Greens dipped in salt water",
    short: ["Take a vegetable other than the maror and dip it. Parsley or celery dipped in salt water works well; say the blessing if you wish, then eat it.", "The green recalls spring and new growth. The salt water recalls tears, so our first bite holds the seder’s two truths together: life renews, and suffering must be remembered."],
    medium: ["The green vegetable tastes like spring; the salt water tastes like tears. Passover refuses to separate hope from grief.", "We bless what grows, then taste the cost of a world where freedom is not yet shared."],
    full: ["Karpas places contradiction on the tongue: tenderness and bitterness, beginnings and loss.", "The seder does not ask us to rush past grief. It asks us to carry grief without surrendering the possibility of spring."],
    prompt: "What new growth have you noticed this spring?",
    blessing: "Barukh atah Adonai, Eloheinu melekh ha’olam, borei p’ri ha’adamah.", sourceIds: ["traditional-core"]
  },
  {
    id: "yachatz", transliteration: "Yachatz", title: "Break the middle matzah", ritual: "Brokenness & afikoman",
    short: ["The middle matzah is broken in half. The smaller half is returned to the seder plate, and the larger half is wrapped up to become the afikoman. Hide the afikoman for children to find after dinner. When they bring it back, the finder traditionally receives a small prize; decide on the prize before the seder begins.", "The broken matzah opens the story with hunger and incompleteness. The seder cannot end until the hidden piece returns, turning repair into part of the evening’s structure."],
    medium: ["We begin the telling with something broken. The larger piece becomes the afikoman, hidden now and sought later.", "Wholeness at a seder includes the break and the pieces that remain. What has fractured still belongs at the table."],
    full: ["The crack of matzah is the seder’s first plot twist. What was whole becomes divided, and the evening cannot end until what is hidden returns.", "This is a ritual of honest incompleteness. We name what is fractured without deciding that fracture is the end of the story."],
    prompt: "What is one broken thing that people could help make better?", sourceIds: ["traditional-core"]
  },
  {
    id: "maggid", transliteration: "Maggid", title: "Tell the story", ritual: "Questions, Exodus & Dayenu",
    short: ["Uncover the matzah and invite the youngest willing guest to ask the Four Questions. Questions begin Maggid, the telling, because the seder is built for newcomers and for people who keep finding new meanings in an old story.", "Pharaoh enslaved the Israelites in Egypt and ordered Hebrew baby boys killed. The midwives Shifra and Puah resisted him; Moses survived, grew up, fled Egypt, and returned to demand freedom. After Pharaoh repeatedly refused, ten plagues struck Egypt. The Israelites left in haste, reached the sea with Pharaoh’s army behind them, crossed through the parted water, and began the difficult journey from slavery toward freedom.", "Spill a drop of wine or juice for each plague to temper celebration with grief for lives harmed. Then sing or read Dayenu, giving thanks for each step toward freedom while remembering that freedom remains unfinished wherever people live without safety or dignity."],
    medium: ["Uncover the matzah and begin with the Four Questions. Their details lead to the evening’s larger question: why do we tell this story every year? The Hebrew name for Egypt, Mitzrayim, is often associated with a narrow place, a fitting image for a society organized around forced labor and fear.", "Pharaoh enslaved the Israelites and ordered Hebrew baby boys killed. Resistance began before Moses confronted the king: the midwives Shifra and Puah defied Pharaoh, and Yocheved, Miriam, and Pharaoh’s daughter saved Moses. As an adult, Moses fled after striking an Egyptian overseer. He later returned to demand that Pharaoh release the enslaved people.", "Pharaoh refused again and again. Ten plagues devastated Egypt; as we name them, we remove drops from our cups because another person’s suffering diminishes our joy. The Israelites left in haste, crossed the sea while Pharaoh’s forces pursued them, and set out through the wilderness. Escape opened the way to freedom, but did not complete the journey.", "Dayenu means ‘it would have been enough.’ The song pauses over each gift along the way. Gratitude helps us recognize how freedom is built, step by step, through courage, help, sustenance, and shared responsibility."],
    full: ["Uncover the matzah and let the Four Questions draw everyone into Maggid. At a seder, a sincere question is a form of participation. We tell the Exodus so that inherited memory can meet the moral choices of the present.", "The Israelites lived in Egypt under a Pharaoh who feared their growing community. He enslaved them, exploited their labor, and ordered Hebrew baby boys killed. Shifra and Puah, two midwives, refused his command. Yocheved hid her infant son Moses; Miriam watched over him; and Pharaoh’s daughter rescued and raised him.", "As an adult, Moses saw an Egyptian overseer beating an enslaved Hebrew and struck the overseer dead. Moses fled. At the burning bush, he received the charge to return, join his brother Aaron, and demand that Pharaoh let the people go. Liberation began through many acts of courage before it became a public confrontation with power.", "Pharaoh repeatedly refused, and ten plagues struck Egypt. The story does not let us treat suffering as spectacle. We remove wine or juice from our cups for every plague, acknowledging Egyptian lives caught in the catastrophe of Pharaoh’s hardened rule.", "The Israelites baked unleavened bread and left quickly. Pharaoh’s forces pursued them to the sea; the waters opened, the Israelites crossed, and the pursuing army drowned. Reaching the far shore ended immediate pursuit, though years of wilderness, uncertainty, conflict, and learning still lay ahead. A people shaped by slavery had begun the long work of living in freedom.", "Dayenu names stages in that journey and answers each with gratitude. We can value every rescue, provision, and moment of courage while continuing to seek freedom grounded in equal dignity, safety, and peace for all peoples."],
    prompt: "Where do you see a ‘narrow place’ today, and what helps people move through it?", sourceIds: ["traditional-core"]
  },
  {
    id: "rachtzah", transliteration: "Rachtzah", title: "Wash with intention", ritual: "Second handwashing",
    short: ["Wash again, either by pouring water over your own hands or by taking turns with a partner over the basin. Say the handwashing blessing if you wish, dry your hands, and return to the table so everyone can eat matzah together.", "The first washing prepared us to begin; this one prepares us to eat. Repeating the gesture shows how intention and place in the ritual can give a familiar action new meaning."],
    medium: ["Wash your own hands or take turns pouring water for a partner over the basin. The same action can change when intention changes: this time washing carries a blessing and prepares us to eat."],
    full: ["We return to water, now with words. Wash your own hands or take turns gently pouring for one another over the basin. Ritual lets us meet the same act again and discover how our attention has changed."],
    prompt: "What ordinary action becomes meaningful when you do it with care?",
    blessing: "Barukh atah Adonai, Eloheinu melekh ha’olam, asher kid’shanu b’mitzvotav v’tzivanu al n’tilat yadayim.", sourceIds: ["traditional-core"]
  },
  {
    id: "motzi-matzah", transliteration: "Motzi–Matzah", title: "Eat the bread of urgency", ritual: "Blessing over matzah",
    short: ["Take a piece of matzah, and recite the following two blessings. You may read the blessings in English, use the transliteration, or continue without them; then give everyone a piece to eat.", "Matzah recalls both the plain food of people under oppression and the unleavened bread the Israelites carried when they left Egypt in haste. Its dry, simple taste brings hardship and departure into the body of the ritual."],
    medium: ["Matzah carries two memories: the bread of affliction and the bread of a hurried departure. The same food can hold suffering and liberation.", "We eat it before the future is settled—a reminder that people often begin moving toward freedom with incomplete plans."],
    full: ["Matzah is bread made before dough has time to rise. At the seder it carries memories of poverty, haste, and the first food of a dangerous journey.", "For people fleeing danger, urgency brings risk and loss. Tonight this food asks us to honor the courage of those who move because staying has become impossible."],
    prompt: "What do you need enough of before you can begin—not before you can be certain?",
    blessing: "Barukh atah Adonai, Eloheinu melekh ha’olam, hamotzi lechem min ha’aretz. … al achilat matzah.", sourceIds: ["traditional-core"]
  },
  {
    id: "maror", transliteration: "Maror", title: "Taste bitterness", ritual: "Bitter herbs",
    short: ["Take a piece of maror and dip it in charoset. Then recite the blessing. Prepared horseradish or romaine lettuce can be maror; take only a small taste, and anyone may pass.", "The sharp taste recalls the bitterness of enslavement. We taste it briefly and by choice, knowing that many people cannot choose when their suffering ends."],
    medium: ["Maror keeps the seder honest. Some experiences should not be made palatable for the comfort of people who did not endure them.", "We taste bitterness briefly and by choice; many people cannot set theirs down so easily."],
    full: ["The blessing does not call bitterness good. It makes remembering bitterness a responsibility.", "Memory without action can become performance. Let this taste sharpen our attention to suffering we might otherwise overlook."],
    prompt: "What truth becomes easier to ignore when it is made too comfortable?",
    blessing: "Barukh atah Adonai, Eloheinu melekh ha’olam, asher kid’shanu b’mitzvotav v’tzivanu al achilat maror.", sourceIds: ["traditional-core"]
  },
  {
    id: "korech", transliteration: "Korech", title: "Make the Hillel sandwich", ritual: "Matzah, maror & charoset",
    short: ["Take two pieces of matzah, and sandwich some maror and charoset between the pieces. Eat the sandwich; this is called korech, following the practice associated with the ancient sage Hillel.", "The bitter herb, sweet charoset, and plain matzah meet in one bite. Together they recall oppression, mortar and labor, and the sustaining sweetness people find even in hard times."],
    medium: ["Hillel combined matzah and maror; many tables add charoset’s sweetness. The sandwich refuses a simple story.", "Freedom does not erase what hurt, and grief does not cancel delight."],
    full: ["Korech makes memory edible: bitter herbs, sweet charoset, and matzah arrive together in one bite.", "Freedom leaves room for grief and delight. Each can be honestly present without silencing the other."],
    prompt: "What bittersweet experience has taught you something worth carrying?", sourceIds: ["traditional-core"]
  },
  {
    id: "shulchan-orech", transliteration: "Shulchan Orech", title: "Share the meal", ritual: "Festive dinner",
    short: ["Serve the festive meal and invite everyone to eat, talk, and ask for what they need. Check that guests with dietary or access needs have food they can enjoy.", "Dinner is one of the seder’s ritual steps. Feeding people and sharing conversation let freedom take a practical form: welcome, nourishment, rest, and enough to go around."],
    medium: ["The set table is a Jewish answer to scarcity: we practice a world in which people are fed, welcomed, and invited to linger.", "Let conversation wander. The story also lives in recipes, interruptions, and second helpings."],
    full: ["A festive meal turns ideas into hospitality. Liberation has to reach the body: enough food, enough rest, enough time to be together.", "Notice who cooked, who serves, and who clears. Freedom at the table includes sharing the invisible work."],
    prompt: "Ask someone for the story behind a dish on the table.", sourceIds: ["traditional-core"]
  },
  {
    id: "tzafun", transliteration: "Tzafun", title: "Find what was hidden", ritual: "Afikoman",
    short: ["Invite guests to search for the hidden afikoman. When it is found, negotiate its return playfully if that is your custom, divide it among everyone, and eat it as the final food of the evening.", "The piece broken near the beginning now comes back. Its return ties the seder together and reminds us that what is hidden or fractured still asks for attention and repair."],
    medium: ["The broken piece returns, but it does not pretend never to have been broken. We make it the final taste of the meal.", "Children often lead this search—a playful reversal in which adults must negotiate with the youngest people present."],
    full: ["Tzafun means hidden. What societies hide—labor, grief, history, responsibility—still shapes the whole.", "The afikoman returns through searching, cooperation, and sometimes joyful bargaining. Repair can be serious without being joyless."],
    prompt: "What overlooked voice or story deserves to be brought back into view?", sourceIds: ["traditional-core"]
  },
  {
    id: "barech", transliteration: "Barech", title: "Give thanks", ritual: "Grace & third cup of wine or grape juice",
    short: ["Fill the third cup with wine or grape juice. Clear enough space to gather again, say or read a brief grace after the meal, then lift the cup, say the wine blessing if you wish, and drink.", "Barech turns a full stomach into gratitude. We remember the land, labor, skill, and care behind the meal and renew the hope that everyone may have enough."],
    medium: ["We thank the labor, land, rain, knowledge, and care that brought food here. Gratitude widens when it includes the full chain of hands behind the meal.", "Lift the third cup to sustenance—and to a future where everyone has enough."],
    full: ["Jewish practice places gratitude after eating as well as before. Satisfaction can make us forgetful; this blessing asks us to remember the sources of our abundance.", "Honest gratitude can become the ground from which generosity, responsibility, and a response to injustice grow."],
    prompt: "Thank someone whose work is easy to overlook.", sourceIds: ["traditional-core"]
  },
  {
    id: "hallel", transliteration: "Hallel", title: "Make room for praise", ritual: "Songs & fourth cup of wine or grape juice",
    short: ["Choose one or more songs or poems of praise and let the table join in however they can: singing, reading, humming, or listening. Then pour the fourth small cup of wine or grape juice, say the blessing if you wish, and drink.", "Hallel gives joy a deliberate place after the story’s fear and grief. We celebrate spring, survival, friendship, and every freedom that increases the safety and dignity of others."],
    medium: ["Hallel gathers songs of gratitude and wonder. You do not need certainty to praise what is beautiful, brave, or alive.", "Lift the fourth cup to a shared freedom that protects every people from fear and dispossession."],
    full: ["Praise can feel complicated in a wounded world. Hallel makes room to honor beauty and courage while suffering remains visible.", "We sing for resilience, friendship, spring, and every act that enlarges another person’s freedom."],
    prompt: "What is worth celebrating even before the work is finished?", sourceIds: ["traditional-core"]
  },
  {
    id: "nirtzah", transliteration: "Nirtzah", title: "Carry it forward", ritual: "Closing",
    short: ["Close with the traditional words: Next year in Jerusalem. This old expression carries longing for home, wholeness, and a repaired world. We offer it as a hope that all who call Jerusalem home, and all peoples, may live with safety, dignity, equality, and peace.", "The ritual order is complete. Before leaving the table, name one question, memory, or action you want to carry into the year ahead."],
    medium: ["Nirtzah means completion or acceptance. The ritual order is ending, while the responsibilities awakened by the story continue beyond this table.", "Next year in Jerusalem.", "This old expression carries hope for wholeness, justice, and home. We offer it as a prayer for a shared future in which all who call Jerusalem home, and all peoples, live with safety, dignity, equality, and peace."],
    full: ["We have moved from sanctification to story, bitterness to feast, brokenness to return. The order ends, but liberation is never a one-night assignment.", "May Palestinians and Israelis, Jews and Muslims and Christians, and all who call the land home live with safety, dignity, equality, and peace.", "Next year in Jerusalem. Next year may every people move closer to freedom."],
    prompt: "Name one small action you want to carry beyond this table.", sourceIds: ["traditional-core"]
  },
];

/**
 * Auditable authorship map for compiled section copy. Every runtime section gets
 * exactly one licensed foundational passage. All other body paragraphs, titles,
 * ritual labels, and prompts in the current pack are original project copy;
 * blessings are traditional liturgy. A passage is prepended by the assembler
 * unless that exact compiled wording already appears in the selected length.
 */
export const sectionCopyProvenance: SectionCopyProvenance[] = sectionBlueprints.map((section) => {
  const passage = foundationalPassages.find((candidate) => candidate.sectionId === section.id);
  if (!passage) throw new Error(`Missing foundational passage for ${section.id}`);
  const placement = (paragraphs: string[]): number | "prepended" => {
    const index = paragraphs.findIndex((paragraph) => paragraph.includes(passage.text));
    return index === -1 ? "prepended" : index;
  };
  return {
    sectionId: section.id,
    foundationalPassageId: passage.id,
    directLicensedSourceId: passage.sourceId,
    runtimePlacement: {
      short: placement(section.short),
      medium: placement(section.medium),
      full: placement(section.full),
    },
    blueprintFields: {
      title: "original",
      ritual: "original",
      prompt: "original",
      blessing: section.blessing ? "traditional-liturgical" : "none",
      remainingBodyParagraphs: "original",
    },
  };
});

const themeSeeds: Record<ThemeId, string[]> = {
  feminist: [
    "Remember Shifra and Puah, the midwives whose refusal made liberation possible.", "Lift Miriam’s cup for water, leadership, and the people whose work is remembered too late.", "Notice how often courage in Exodus begins with women protecting life.", "Ask whose voice is missing from the version of history you inherited.", "Honor care work as leadership, not background scenery.", "Let every role at this seder be open to every gender.", "Pharaoh’s daughter crossed the boundary of loyalty to save a child.", "Serach bat Asher represents the keepers of memory across generations.", "Freedom includes bodily autonomy and safety from gendered violence.", "Use language for the sacred that does not shrink divinity into one gender.", "Invite a story about a woman who changed your family or community.", "Share the labor of cooking, serving, explaining, and cleaning tonight."
  ],
  lgbtq: [
    "Exodus is also a story about leaving identities imposed by power.", "Welcome chosen family as fully family.", "No guest should have to edit themselves to belong at this table.", "Honor the courage required to name oneself truthfully.", "Make room for bodies, genders, and loves that inherited language overlooked.", "The narrow place can be the demand to live as someone else’s idea of you.", "Bless the creativity with which queer people have built home and kinship.", "Ask what freedom feels like in the body.", "Use language that lets every guest recognize themselves.", "Remember those who made queer Jewish life possible under risk.", "Let joy be more than survival; let it be a birthright.", "A liberated table makes no one explain why their family counts."
  ],
  "social-justice": [
    "Exodus asks us to notice systems, not only individual cruelty.", "Freedom that stops with us is not yet freedom.", "Connect memory to the choices our institutions make now.", "Ask who benefits when exploitation is described as inevitable.", "Honor organizers whose names history may never record.", "A just society measures freedom at its most vulnerable edge.", "Notice whose labor made this meal possible and how that labor is valued.", "Refuse collective blame; seek accountability without dehumanization.", "The plagues warn what happens when a ruler hardens himself against suffering.", "Racial justice requires truth, repair, and durable change.", "Move from sympathy to solidarity: shared risk, shared work, shared future.", "Let the seder’s memory sharpen our response to modern slavery and trafficking."
  ],
  environment: [
    "Passover arrives in spring, when renewal is visible and fragile.", "The plagues reveal what happens when power treats land and life as disposable.", "Freedom depends on clean water, breathable air, and a livable climate.", "Bless the soil and the people who tend it.", "Ask what we owe generations who will inherit our choices.", "Matzah’s simplicity can teach enoughness in a culture of excess.", "The seder plate is a small map of relationships among land, labor, season, and story.", "Notice the distance each ingredient traveled to reach the table.", "Care for the earth is care for neighbors we may never meet.", "Let gratitude become stewardship rather than possession.", "The sea in the Exodus story can remind us that every community depends on clean, life-giving water.", "Choose one practice that makes celebration gentler on the planet."
  ],
  interfaith: [
    "No prior knowledge is required; questions are a traditional part of the evening.", "Guests of every background are participants, not observers.", "Explain the ritual before performing it so no one has to guess.", "Different beliefs can share a table without being flattened into sameness.", "Invite guests to connect Exodus with stories from their own traditions.", "Translate insider language and welcome honest uncertainty.", "Belonging tonight comes from presence, not credentials.", "A mixed table can hold devotion, doubt, curiosity, and love.", "Avoid asking any one guest to represent an entire religion or culture.", "Share what a ritual means to you without claiming it must mean the same to everyone.", "Hospitality includes making dietary, access, and sensory needs ordinary to discuss.", "Let difference deepen conversation rather than ending it."
  ],
  secular: [
    "Read the story as inherited wisdom without requiring a supernatural claim.", "Center the human choices that made resistance possible.", "Ritual can carry meaning even when theology does not.", "Wonder, gratitude, and responsibility need no test of belief.", "The burning bush can be the moment suffering becomes impossible to ignore.", "Freedom grows through collective action, courage, and care.", "Use blessing language as poetry if prayer is not your language.", "Treat Exodus as a lens, not a history exam.", "Human beings harden hearts—and human beings can choose differently.", "The seder survives because generations keep remaking it.", "A secular table can be deeply Jewish through memory, practice, humor, and ethical commitment.", "Ask what values you want ritual to rehearse."
  ],
  mindfulness: [
    "Pause before speaking and notice what is present.", "Let one full breath separate the ordinary day from sacred time.", "Taste before interpreting.", "Notice where the body holds narrowness and where it senses room.", "Silence can be a form of participation.", "Bring attention back gently when it wanders.", "Gratitude begins with noticing what is already here.", "Hold grief without rushing to solve it.", "Let the cup’s weight, the herb’s scent, and the candle’s light become teachers.", "Freedom includes the ability to respond rather than react.", "Ask what becomes audible when the table grows quiet.", "Close with an intention small enough to practice tomorrow."
  ],
  traditional: [
    "Follow the inherited order: each step carries centuries of memory.", "Keep the blessing intact, then add explanation in everyday language.", "Tradition is a conversation across generations, not a museum display.", "Use the familiar melody if someone at the table knows it.", "Let ritual actions carry meaning alongside discussion.", "The Four Questions teach that learning begins in difference.", "Dayenu gives gratitude a rhythm the whole table can join.", "The four cups pace the evening through stages of liberation.", "The seder plate turns abstract memory into physical symbols.", "Tell the Exodus as though each generation personally left the narrow place.", "Preserve the order even when each section is brief.", "End with an old hope carried in a peace-focused spirit."
  ],
  "family-storytelling": [
    "Invite a migration story from your family—chosen, biological, or both.", "Invite someone to tell the story of a recipe that has been passed through their family or community.", "Name someone whose place at the table is felt even in absence.", "Let an elder tell a story without rushing its winding path.", "Ask a child what freedom would look like at school or at home.", "Share a tradition your family invented rather than inherited.", "Bring an object that holds a journey.", "Ask how a family name, language, or custom changed over time.", "Chosen family belongs in the story of how we survive and flourish.", "Remember that not every family story is safe or available; passing is always allowed.", "Trade one piece of advice you received for one you hope to pass on.", "Let tonight become a memory worth retelling."
  ],
};

export const themeInserts = Object.fromEntries(
  Object.entries(themeSeeds).map(([theme, entries]) => [theme, entries.map((text, index) => ({
    id: `${theme}-${String(index + 1).padStart(2, "0")}`,
    text,
    theme: theme as ThemeId,
    approved: true as const,
    rights: "original" as const,
  }))])
) as Record<ThemeId, Array<{ id: string; text: string; theme: ThemeId; approved: true; rights: "original" }>>;

export interface ThemeMoment {
  id: string;
  theme: ThemeId;
  sectionId: SederSectionId;
  transition: string;
  adultPrompt: string;
  kidPrompt: string;
  approved: true;
  rights: "original";
}

const moment = (
  theme: ThemeId,
  sectionId: SederSectionId,
  suffix: string,
  transition: string,
  adultPrompt: string,
  kidPrompt: string,
): ThemeMoment => ({
  id: `${theme}-${sectionId}-${suffix}`,
  theme,
  sectionId,
  transition,
  adultPrompt,
  kidPrompt,
  approved: true,
  rights: "original",
});

/**
 * Fully written thematic seams. Runtime chooses whole records rather than
 * asking a model to improvise a theme connection beside a ritual.
 */
export const themeMoments: Record<ThemeId, ThemeMoment[]> = {
  feminist: [
    moment("feminist", "urchatz", "miriam", "Miriam’s water recalls leadership that sustains people through danger and is often remembered too late.", "Whose necessary work has been treated as background, and how could we name it as leadership?", "Who helps people every day even when they do not get much attention?"),
    moment("feminist", "maggid", "midwives", "The Exodus turns because Shifra and Puah refuse Pharaoh before Moses ever confronts him.", "How does the story change when we begin liberation with the midwives’ refusal?", "What brave choice did Shifra and Puah make when Pharaoh gave a cruel order?"),
    moment("feminist", "nirtzah", "voices", "Carry forward the names and voices of women whose courage kept families and communities alive.", "Whose leadership do you want to recognize more clearly after tonight?", "Whose brave or caring work do you want to remember tomorrow?"),
  ],
  lgbtq: [
    moment("lgbtq", "yachatz", "belonging", "The broken matzah stays essential to the seder; belonging does not require hiding the parts of a life others overlook.", "Where could your community make belonging more ordinary and less conditional?", "What helps you feel that you can be fully yourself with other people?"),
    moment("lgbtq", "maggid", "names", "Leaving a narrow place can include refusing identities that power has imposed and speaking one’s own name.", "What conditions help people live openly without putting their safety at risk?", "What helps someone feel safe enough to tell the truth about who they are?"),
    moment("lgbtq", "nirtzah", "chosen-family", "A free table honors chosen family, inherited family, and every household built through care.", "What practice would help more kinds of families feel expected rather than merely accommodated?", "How can we show that every caring family belongs?"),
  ],
  "social-justice": [
    moment("social-justice", "karpas", "labor", "The parsley reaches us through soil, water, transport, and human labor; freedom concerns every link in that chain.", "What would fair treatment look like for the people whose labor brought this food to us?", "How can the people who grow and carry our food be treated fairly?"),
    moment("social-justice", "maggid", "systems", "Pharaoh’s cruelty becomes a system of forced labor, fear, and laws designed to make resistance harder.", "Where do rules or institutions still turn another group’s hardship into someone else’s comfort?", "What should people do when a rule keeps hurting the same group?"),
    moment("social-justice", "nirtzah", "commitment", "Memory becomes responsibility when it changes what we are willing to notice, share, and repair.", "What specific act of solidarity can you place on your calendar this month?", "What is one fair or helpful thing you can actually do this week?"),
  ],
  environment: [
    moment("environment", "urchatz", "water", "The water in our hands connects this table with every community that depends on clean, reliable water.", "What responsibility follows from treating water as a shared necessity rather than an unlimited possession?", "What is one way people can keep water clean and available for others?"),
    moment("environment", "karpas", "spring", "Karpas brings the local season to the table: new growth, fragile weather, and the work of tending life.", "What change in your local environment have you noticed since last spring?", "What plant, animal, or weather change tells you that spring is here?"),
    moment("environment", "nirtzah", "stewardship", "The closing hope includes a livable future for people, animals, soil, water, and air.", "Which household practice could you change without shifting the burden onto someone with fewer choices?", "What is one earth-caring habit your household could try together?"),
  ],
  interfaith: [
    moment("interfaith", "kadesh", "welcome", "This table can hold devotion, doubt, another faith, and no faith; nobody is asked to represent a whole tradition.", "What helps people explain a cherished practice without demanding that everyone experience it the same way?", "How can we ask about someone’s tradition without making them speak for everyone?"),
    moment("interfaith", "maggid", "stories", "Guests may hear echoes of other liberation stories while allowing the Exodus to remain a particular Jewish inheritance.", "How can two traditions illuminate each other without being treated as interchangeable?", "What story from your family or tradition helps people practice courage?"),
    moment("interfaith", "nirtzah", "hospitality", "Hospitality deepens when curiosity and difference can remain at the table together.", "What did you understand differently after hearing someone else’s question tonight?", "What is one new thing you learned from someone at this table?"),
  ],
  secular: [
    moment("secular", "maggid", "human-courage", "The story’s human choices are concrete: midwives disobey, families protect children, and people decide to leave.", "Which human decision in the Exodus carries the most ethical weight for you?", "Which person in the story made a choice you think was brave?"),
    moment("secular", "barech", "gratitude", "Gratitude can name rain, soil, skill, labor, and care without requiring everyone to share a theology.", "Which part of the meal’s human and ecological chain usually escapes your attention?", "Who or what helped this meal reach our table?"),
    moment("secular", "nirtzah", "practice", "Ritual can rehearse attention, memory, courage, and responsibility across many kinds of belief.", "Which value did tonight’s physical rituals make easier to remember?", "Which part of tonight helped an important idea stick in your mind?"),
  ],
  mindfulness: [
    moment("mindfulness", "urchatz", "arrival", "Feel the water’s temperature and the movement of your hands; let one unhurried breath mark your arrival.", "What changed when you gave this ordinary action your full attention?", "Was the water warm or cool, and what did you notice when you slowed down?"),
    moment("mindfulness", "maror", "bitterness", "Notice the scent and first sharp sensation of maror, then notice the body’s impulse to pull away.", "Can you stay present to a difficult feeling long enough to choose a response rather than react automatically?", "What did your face or body do when you tasted or smelled the bitter herb?"),
    moment("mindfulness", "nirtzah", "intention", "Before the final words, take one quiet breath and choose an intention small enough to practice tomorrow.", "What brief daily cue could bring you back to that intention?", "What small action tomorrow could help you remember what mattered tonight?"),
  ],
  traditional: [
    moment("traditional", "kadesh", "generations", "The first cup begins an inherited order that Jewish households have carried through many places and generations.", "Which familiar ritual makes you feel connected to people who practiced it before you?", "Which part of a holiday helps you remember people from earlier generations?"),
    moment("traditional", "maggid", "telling", "The Haggadah asks every generation to tell the Exodus as a living memory rather than a distant summary.", "Which ritual detail helps you enter the story rather than merely hear about it?", "Which food, question, or action makes the Exodus story feel close to you?"),
    moment("traditional", "nirtzah", "continuity", "The seder closes in an old cadence, joining tonight’s new questions to a long chain of practice.", "What part of the inherited order do you hope this table will carry forward?", "Which part of tonight would you want to do again next year?"),
  ],
  "family-storytelling": [
    moment("family-storytelling", "yachatz", "objects", "The hidden matzah can call to mind the objects families carried, saved, lost, or found again.", "What object in your family holds a journey, and who has told you its story?", "Is there an object in your family that has a story about where it came from?"),
    moment("family-storytelling", "maggid", "journeys", "The communal Exodus can make room for family journeys without forcing anyone to disclose a story that is painful or private.", "Which journey changed your family’s language, food, work, or sense of home? Passing is welcome.", "What trip or move changed something in your family? You can always pass."),
    moment("family-storytelling", "shulchan-orech", "recipes", "Recipes carry memory through measurements, substitutions, handwriting, and the people who taught us by feel.", "Who taught someone at this table to make a dish, and what changed as the recipe traveled?", "Who taught your family to make one of the foods here?"),
  ],
};

export interface MaggidNarrative {
  length: SederLength;
  paragraphs: string[];
  approved: true;
  rights: "original";
  provenanceNote: string;
}

export const maggidNarratives: Record<SederLength, MaggidNarrative> = {
  20: {
    length: 20,
    paragraphs: [
      "Pharaoh enslaved the Israelites in Egypt and ordered Hebrew baby boys killed. Shifra and Puah disobeyed him. Yocheved, Miriam, and Pharaoh’s daughter saved Moses. As an adult, he killed an Egyptian who was beating an enslaved Hebrew and fled. Called at a burning bush, Moses returned with Aaron to demand freedom. Pharaoh refused; ten plagues devastated Egypt. The Israelites left in haste with unleavened dough. Pharaoh’s army chased them to the sea; the Israelites crossed through parted water, and the pursuers drowned. The wilderness brought hunger, fear, conflict, and the long work of learning to live together as free people.",
    ],
    approved: true,
    rights: "original",
    provenanceNote: "Original beginner narration based on the Exodus narrative; paired with exact primary-spine readings and traditional liturgy.",
  },
  45: {
    length: 45,
    paragraphs: [
      "Generations after Joseph’s family settled in Egypt, a new Pharaoh treated the growing Israelite community as a threat. He forced them into labor, ordered their newborn sons killed, and tried to make fear govern every part of their lives. Resistance began quietly. The midwives Shifra and Puah refused Pharaoh’s command. Yocheved hid her baby Moses; Miriam watched over him; Pharaoh’s daughter drew him from the Nile and raised him in the royal household.",
      "Moses grew up between the palace and an enslaved people. After seeing an Egyptian beat a Hebrew laborer, he killed the attacker and fled. Years later, at a bush that burned without being consumed, Moses was called to return. He doubted his ability to speak and feared the task, so Aaron joined him. Together they told Pharaoh to let the people go. Pharaoh answered by increasing the labor. Moses and Aaron returned again and again, while Pharaoh repeatedly chose control over human life.",
      "Ten plagues struck Egypt, harming ordinary people as well as the ruler who refused to yield. The Israelites prepared to leave quickly and baked unleavened bread for the road. Pharaoh released them, then sent his army in pursuit. Trapped at the sea, the Israelites crossed through divided waters; the pursuing army drowned. Miriam and the women sang on the far shore. Escape ended the immediate danger. The wilderness still brought hunger, thirst, argument, uncertainty, and new obligations. The Exodus leads from forced labor into the unfinished practice of freedom.",
    ],
    approved: true,
    rights: "original",
    provenanceNote: "Original expanded beginner narration based on Exodus 1–16; paired with exact primary-spine readings and traditional liturgy.",
  },
  90: {
    length: 90,
    paragraphs: [
      "The Exodus story begins generations after Joseph’s family came to Egypt during a famine. A new Pharaoh no longer remembered the relationship that had once protected them. He saw the growing Israelite community as a danger and turned that fear into policy: forced labor, harsh construction work, and control over family life. When oppression failed to reduce their numbers, Pharaoh ordered the Hebrew midwives Shifra and Puah to kill newborn boys. They refused and kept the children alive.",
      "A mother named Yocheved hid her infant son as long as she could, then placed him in a basket among the reeds of the Nile. His sister Miriam watched. Pharaoh’s daughter found the child, recognized that he was Hebrew, and chose to save him. Through Miriam’s quick thinking, Yocheved was able to nurse her own son before he entered the royal household. The child was named Moses, a name linked in the story with being drawn from the water.",
      "As an adult, Moses saw an Egyptian overseer beating an enslaved Hebrew. He killed the overseer and fled to Midian. There he built another life as a shepherd. At a bush that burned without being consumed, Moses encountered a call to return to the place he feared. He argued that he lacked authority and words. The call remained, and his brother Aaron became his partner and speaker.",
      "Moses and Aaron demanded that Pharaoh let the people go. Pharaoh tightened his grip and increased their work, requiring the same quota of bricks while withholding straw. The people blamed Moses for making their suffering worse. Liberation did not begin with steady progress or universal confidence. The confrontation continued through repeated demands, refusals, warnings, and plagues that devastated Egypt’s water, crops, animals, health, light, and families.",
      "Before the final plague, the Israelites prepared food for a hurried departure. They left carrying unleavened dough because there was no time for it to rise. Pharaoh soon reversed his decision and sent an army after them. With water ahead and soldiers behind, the people panicked. The sea opened, the Israelites crossed, and the pursuing army drowned. The Haggadah tempers celebration by removing wine from our cups for every plague and by remembering the Egyptian lives lost in the story. On the far shore, Moses, Miriam, and the people sang.",
      "The sea crossing ended pursuit, while freedom remained difficult. In the wilderness the people faced thirst, hunger, fear, nostalgia for the predictability of Egypt, disputes over leadership, and the challenge of sharing limited resources. They received manna, gathered water, rested, argued, learned, and entered a covenant of responsibilities. The Exodus therefore reaches beyond departure. It asks how people shaped by domination can build a community where power serves life, memory protects the vulnerable, and freedom is practiced together.",
    ],
    approved: true,
    rights: "original",
    provenanceNote: "Original full beginner narration based on Exodus 1–20; paired with exact primary-spine readings and traditional liturgy.",
  },
};

export const toneOpeners: Record<Tone, string[]> = {
  playful: ["Settle in, pour something good, and keep your questions close.", "A seder asks us to tell a sweeping story with ordinary things: parsley, crackers, strong flavors, and a crowded table.", "Some parts we inherit, some we improvise, and all of us get to ask why."],
  balanced: ["We gather around a story of oppression, courage, departure, and the long work of becoming free.", "Tonight’s rituals turn memory into things we can hold, taste, ask about, and share.", "Everyone at this table has a place in the telling."],
  reverent: ["We enter this evening with attention and care.", "Across generations, the seder has given a ritual order to questions, grief, gratitude, and hope.", "May our telling deepen the work of freedom and open paths toward dignity and peace."],
};

export const quoteCatalog: QuoteEntry[] = [
  { id: "q-hillel-self", text: "If I am not for myself, who is for me? And when I am for myself alone, what am I? And if not now, when?", author: "Hillel", work: "Pirkei Avot 1:14", year: "c. 1st century", themes: ["traditional", "social-justice", "mindfulness", "secular", "family-storytelling", "lgbtq"], sectionIds: ["kadesh", "nirtzah"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Pirkei_Avot.1.14", approved: true },
  { id: "q-avot-free", text: "You are not required to finish the work, but neither are you free to abandon it.", author: "Rabbi Tarfon", work: "Pirkei Avot 2:16", year: "c. 2nd century", themes: ["social-justice", "traditional"], sectionIds: ["maggid", "nirtzah"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Pirkei_Avot.2.16", approved: true },
  { id: "q-avot-place", text: "Do not judge another until you have reached their place.", author: "Hillel", work: "Pirkei Avot 2:4", year: "c. 1st century", themes: ["interfaith", "mindfulness"], sectionIds: ["kadesh", "maggid"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Pirkei_Avot.2.4", approved: true },
  { id: "q-exodus-stranger", text: "You shall not oppress a stranger, for you know the heart of a stranger, seeing you were strangers in the land of Egypt.", author: "Exodus 23:9", work: "Hebrew Bible", year: "Public-domain translation adapted", themes: ["interfaith", "social-justice", "family-storytelling"], sectionIds: ["maggid"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Exodus.23.9", approved: true },
  { id: "q-isaiah-peace", text: "They shall beat their swords into plowshares, and their spears into pruning hooks.", author: "Isaiah 2:4", work: "Hebrew Bible", year: "Public domain", themes: ["traditional", "social-justice", "environment", "interfaith"], sectionIds: ["nirtzah"], rights: "public-domain", sourceUrl: "https://www.sefaria.org/Isaiah.2.4", approved: true },
  { id: "q-micah", text: "What does the Eternal require of you, but to do justice, to love mercy, and to walk humbly?", author: "Micah 6:8", work: "Hebrew Bible", year: "Public-domain translation adapted", themes: ["social-justice", "mindfulness", "traditional"], sectionIds: ["kadesh", "nirtzah"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Micah.6.8", approved: true },
  { id: "q-wollstonecraft", text: "I do not wish them to have power over men; but over themselves.", author: "Mary Wollstonecraft", work: "A Vindication of the Rights of Woman", year: "1792", themes: ["feminist"], sectionIds: ["maggid", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/3420", approved: true },
  { id: "q-douglass-power", text: "Power concedes nothing without a demand. It never did and it never will.", author: "Frederick Douglass", work: "West India Emancipation speech", year: "1857", themes: ["social-justice"], sectionIds: ["maggid"], rights: "public-domain", sourceUrl: "https://www.loc.gov/resource/mfd.23018/", approved: true },
  { id: "q-douglass-struggle", text: "If there is no struggle, there is no progress.", author: "Frederick Douglass", work: "West India Emancipation speech", year: "1857", themes: ["social-justice"], sectionIds: ["maggid"], rights: "public-domain", sourceUrl: "https://www.loc.gov/resource/mfd.23018/", approved: true },
  { id: "q-truth", text: "Truth is powerful and it prevails.", author: "Sojourner Truth", work: "Attributed in contemporary accounts", year: "19th century", themes: ["feminist", "social-justice"], sectionIds: ["maggid", "tzafun", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.loc.gov/item/2004679121/", approved: true },
  { id: "q-wells", text: "The way to right wrongs is to turn the light of truth upon them.", author: "Ida B. Wells", work: "The Light of Truth", year: "1892", themes: ["feminist", "social-justice"], sectionIds: ["maggid"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/14975", approved: true },
  { id: "q-whitman", text: "I am large, I contain multitudes.", author: "Walt Whitman", work: "Song of Myself", year: "1855", themes: ["lgbtq", "mindfulness", "secular"], sectionIds: ["kadesh", "tzafun", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/1322", approved: true },
  { id: "q-thoreau", text: "It is not enough to be busy. So are the ants. The question is: What are we busy about?", author: "Henry David Thoreau", work: "Letter to H. G. O. Blake", year: "1857", themes: ["mindfulness", "environment"], sectionIds: ["kadesh"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/author/102", approved: true },
  { id: "q-muir", text: "When we try to pick out anything by itself, we find it hitched to everything else in the Universe.", author: "John Muir", work: "My First Summer in the Sierra", year: "1911", themes: ["environment", "mindfulness"], sectionIds: ["maggid", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/32540", approved: true },
  { id: "q-eliot", text: "What do we live for, if it is not to make life less difficult to each other?", author: "George Eliot", work: "Middlemarch", year: "1871", themes: ["interfaith", "family-storytelling"], sectionIds: ["kadesh", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/145", approved: true },
  { id: "q-austen", text: "There is no charm equal to tenderness of heart.", author: "Jane Austen", work: "Emma", year: "1815", themes: ["family-storytelling", "feminist"], sectionIds: ["kadesh", "tzafun"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/158", approved: true },
  { id: "q-dickinson", text: "Hope is the thing with feathers that perches in the soul.", author: "Emily Dickinson", work: "Poem 254", year: "c. 1861", themes: ["mindfulness", "environment"], sectionIds: ["tzafun", "nirtzah"], rights: "public-domain", sourceUrl: "https://www.poetryfoundation.org/poems/42889/hope-is-the-thing-with-feathers-314", approved: true },
  { id: "q-psalm-tears", text: "Those who sow in tears shall reap in joy.", author: "Psalm 126:5", work: "Hebrew Bible", year: "Public-domain translation adapted", themes: ["family-storytelling", "interfaith", "traditional", "mindfulness"], sectionIds: ["tzafun", "nirtzah"], rights: "original-translation", sourceUrl: "https://www.sefaria.org/Psalms.126.5", approved: true },
  { id: "q-wilde-disobedience", text: "Disobedience, in the eyes of anyone who has read history, is man's original virtue.", author: "Oscar Wilde", work: "The Soul of Man Under Socialism", year: "1891", themes: ["lgbtq", "social-justice", "secular"], sectionIds: ["maggid"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/ebooks/1017", approved: true },
  { id: "q-dhammapada-hatred", text: "For hatred does not cease by hatred at any time: hatred ceases by love, this is an old rule.", author: "Dhammapada 1.5, translated by F. Max Müller", work: "The Dhammapada", year: "1881 translation", themes: ["mindfulness", "interfaith", "social-justice"], sectionIds: ["nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/cache/epub/2017/pg2017-images.html", approved: true, externalContemplative: true, traditionLabel: "Buddhist", placementNote: "Nirtzah only, alongside universal peace language; never use in Maggid or to prescribe affection from oppressed people toward oppressors." },
  { id: "q-gita-right-action", text: "Find full reward Of doing right in right! Let right deeds be Thy motive, not the fruit which comes from them.", author: "Bhagavad Gita, translated by Sir Edwin Arnold", work: "The Song Celestial, Book II", year: "1885 translation", themes: ["mindfulness", "interfaith", "social-justice"], sectionIds: ["nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/files/2388/2388-h/2388-h.htm", approved: true, externalContemplative: true, traditionLabel: "Hindu", placementNote: "Nirtzah only, after a concrete closing action; preserve the historical translation exactly and explain its archaic syntax separately." },
  { id: "q-isha-self", text: "He who sees all beings in the Self and the Self in all beings, he never turns away from It (the Self).", author: "Isha Upanishad VI, translated by Swami Paramananda", work: "The Upanishads", year: "1919 translation", themes: ["mindfulness", "interfaith", "environment"], sectionIds: ["nirtzah"], rights: "public-domain", sourceUrl: "https://www.gutenberg.org/cache/epub/3283/pg3283.html", approved: true, externalContemplative: true, traditionLabel: "Vedantic", placementNote: "Nirtzah only, beside shared-humanity language; label the tradition and never present it as Jewish liturgy." },
  ...expandedQuoteCatalog,
];

const coverMasters = [
  { key: "illuminated", name: "Illuminated Garden · Botanical manuscript", image: "/covers/illuminated.webp", themes: ["traditional", "family-storytelling", "feminist"] as ThemeId[], ink: "dark" as const, position: "center" },
  { key: "papercut", name: "Path to Freedom · Layered papercut", image: "/covers/papercut.webp", themes: ["social-justice", "environment", "interfaith"] as ThemeId[], ink: "dark" as const, position: "center" },
  { key: "modernist", name: "Modern Exodus · Geometric modernism", image: "/covers/modernist.webp", themes: ["secular", "lgbtq", "social-justice"] as ThemeId[], ink: "dark" as const, position: "center" },
  { key: "moonlit", name: "Moonlit Seder · Nocturne", image: "/covers/moonlit.webp", themes: ["mindfulness", "traditional", "environment"] as ThemeId[], ink: "light" as const, position: "center" },
  { key: "celebration", name: "Shared Table · Joyful gouache", image: "/covers/celebration-table.webp", themes: ["family-storytelling", "interfaith", "lgbtq"] as ThemeId[], ink: "dark" as const, position: "center" },
  { key: "sea-linocut", name: "Through the Sea · Graphic linocut", image: "/covers/sea-linocut.webp", themes: ["social-justice", "traditional", "secular"] as ThemeId[], ink: "light" as const, position: "center" },
  { key: "open-door", name: "Open Door · Mid-century collage", image: "/covers/open-door-collage.webp", themes: ["interfaith", "family-storytelling", "secular"] as ThemeId[], ink: "dark" as const, position: "center" },
  { key: "cyanotype", name: "Living Water · Botanical cyanotype", image: "/covers/cyanotype-spring.webp", themes: ["environment", "mindfulness", "feminist"] as ThemeId[], ink: "light" as const, position: "center" },
];

export const coverOptions: CoverOption[] = coverMasters.map((master) =>
  ({
    id: `${master.key}-1`,
    name: master.name,
    image: master.image,
    filter: "none",
    position: master.position,
    ink: master.ink,
    themes: master.themes,
  })
);

export const sourceCatalog = [
  // These are context and inspiration references for the app's original commentary, not
  // claims that the section prose was copied. Reuse is allowed when the source grants it;
  // an embedded work is eligible only with its exact printed credit, containing-Haggadah
  // credit, locator, treatment record, and source-excerpt hash.
  { id: "traditional-core", title: "Seder Haggadah Shel Pesaḥ", creator: "Paltiel Birnbaum", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/seder-haggadah-shel-pesah-translated-and-annotated-by-paltiel-birnbaum-1953/", rights: "CC0 / public-domain scan; jurisdiction review required outside the U.S." },
  { id: "wandering-is-over", title: "The Wandering Is Over Haggadah", creator: "JewishBoston & Jewish Women’s Archive", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-wandering-is-over-haggadah-including-womens-voices-by-jewish-boston-and-jewish-womens-archive-2011/", rights: "CC BY-SA 3.0 except where noted; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash" },
  { id: "inner-seder", title: "Haggadah of the Inner Seder", creator: "David Seidenberg", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-of-the-inner-seder-by-david-seidenberg-neohasid-org/", rights: "CC BY-SA 4.0" },
  { id: "other-side-of-sea", title: "The Other Side of the Sea", creator: "T’ruah", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-other-side-of-the-sea-a-haggadah-for-fighting-modern-day-slavery-by-truah-the-rabbinic-call-for-human-rights/", rights: "CC BY-SA 4.0; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash" },
  { id: "freedom-seder-earth", title: "The Freedom Seder for the Earth", creator: "Arthur Waskow & The Shalom Center", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-freedom-seder-haggadah-for-passover-by-the-shalom-center-and-rabbi-arthur-waskow/", rights: "CC BY-SA 4.0; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash" },
  { id: "shir-geulah", title: "Haggadah Shir Ge’ulah / Song of Liberation", creator: "Emily Aviva Kapor-Mater", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-shir-geulah-song-of-liberation-by-emily-aviva-kapor/", rights: "CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/); reuse and adaptation permitted with attribution and modification notice" },
  { id: "velveteen-rabbi", title: "The Velveteen Rabbi’s Haggadah for Pesach", creator: "Rachel Barenblat", url: "https://velveteenrabbi.blogs.com/files/vrhaggadah-3.pdf", rights: "Explicit permission to use, modify, and borrow with appropriate credit; noncommercial demo only under the author’s ‘please don’t sell this’ condition; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash" },
  { id: "nusach-eretz-yisrael", title: "Pesaḥ Haggadah (Nusaḥ Erets Yisrael)", creator: "Isaac Gantwerk Mayer", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/pesah-haggadah-nusah-erets-yisrael-based-on-multiple-cairo-geniza-manuscripts-compiled-and-translated-by-isaac-gantwerk-mayer/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required" },
  { id: "seder-in-the-streets", title: "Seder in the Streets Passover Haggadah", creator: "Danielle Gershkoff, Rachel Lerman, Rachel Beck & Margot Seigle", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/seder-in-the-streets-haggadah-compiled-by-danielle-gershkoff-rachel-lerman-rachel-beck-and-margot-seigle/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required" },
  { id: "tropified-haggadah", title: "The Passover Seder Haggadah, Tropified", creator: "Isaac Gantwerk Mayer", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-passover-seder-haggadah-tropified-by-isaac-gantwerk-mayer/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required" },
  { id: "feinstein-haggadah", title: "Haggadah for the Passover Seder", creator: "Eve Levavi Feinstein & Efraim Feinstein", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-an-english-translation/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required" },
  { id: "socialist-hagode", title: "Hagode shel Peysekh: in a Socialist Mode", creator: "Benjamin Feigenbaum, Leon Zolotkof & Shlomo Enkin Lewis", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/hagode-shel-peysekh-in-a-socialist-mode-1887-1919-trans-shlomo-enkin-lewis-2025/", rights: "CC BY-SA 4.0 for the 2025 bilingual edition; attribution, license link, change notice, and ShareAlike required" },
  { id: "mlk-freedom-seder", title: "MLK +50 Labor-Justice Interfaith Freedom Seder", creator: "Arthur Waskow & The Shalom Center", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/mlk-plus-50-labor-justice-interfaith-freedom-seder-by-arthur-waskow-and-the-shalom-center/", rights: "Unattributed passages are CC BY 4.0; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash; the publisher asks users to notify and support The Shalom Center" },
  { id: "second-seder-plate", title: "A Second Passover Seder Plate with Seven Additions", creator: "Isaac Gantwerk Mayer", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/second-passover-seder-plate-with-seven-additions-by-isaac-gantwerk-mayer/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required" },
  { id: "mayer-ashkenaz", title: "Haggadah for Pesaḥ — Nusaḥ Ashkenaz with Additions", creator: "Isaac Gantwerk Mayer", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-nusah-ashkenaz-with-unique-additions-from-across-the-jewish-world-by-isaac-gantwerk-mayer-2025/", rights: "CC BY-SA 4.0; attribution, license link, change notice, and ShareAlike required; separately sourced additions require item-level review" },
  { id: "english-jews-seder", title: "The Ritual of the Seder and the Agada of the English Jews Before the Expulsion", creator: "Dávid Kaufmann; transcription by Aharon N. Varady", url: "https://opensiddur.org/miscellanea/traditions/ritual-of-the-seder-and-the-agada-of-the-english-jews-before-the-expulsion/", rights: "Public-domain 1892 study and medieval source; Open Siddur transcription/page shared under CC BY-SA 4.0" },
  { id: "rittangel-latin", title: "Liber Rituum Paschalium", creator: "Johann Stephan Rittangel; transcription by Aharon N. Varady", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/liber-rituum-paschalium-by-johann-stephan-rittangel-1644/", rights: "Public-domain 1644 work; attribute the Open Siddur transcription and follow its CC BY-SA 4.0 terms" },
  { id: "levy-home-service", title: "Haggadah or Home Service for the Festival of Passover", creator: "J. Leonard Levy", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-or-home-service-for-the-festival-of-passover-by-j-leonard-levy/", rights: "Public-domain editions (1896–1922); Open Siddur page shared under CC BY-SA 4.0" },
  { id: "barros-basto", title: "Hagadah shel Pessah", creator: "Artur Carlos de Barros Basto", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/hagadah-shel-pessah-compiled-by-artur-carlos-de-barros-basto-1928/", rights: "CC0 / public domain; published in 1928; credit the creator and digitization where practical" },
  { id: "battlestar-seder", title: "The First Battlestar Galactica Seder Haggadah", creator: "David Lieberman, Alison Ogden, Mary Bruch & Aharon N. Varady", url: "https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-first-battlestar-galactica-passover-seder-haggadah-2008/", rights: "CC BY-SA 4.0 Open Siddur edition derived from a GNU Free Documentation License work; embedded material is eligible with exact source-presented attribution, containing-Haggadah credit, locator, and hash" },
];
