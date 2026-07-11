export type SourceLengthTier = "short" | "medium" | "full";
export type SourcePassageRole = "source-reading" | "ritual-source";

export interface ShirSourcePassage {
  id: string;
  sectionId: string;
  role: SourcePassageRole;
  tiers: SourceLengthTier[];
  text: string;
  treatment: "verbatim-normalized";
  locator: string;
  containingHaggadah: "Haggadah Shir Ge’ulah / Song of Liberation, v2.1";
  containingHaggadahCreator: "Emily Aviva Kapor-Mater";
  containingHaggadahLicense: "CC BY 4.0";
  sourcePresentedAttribution?: string;
  provenanceHash: string;
}

const source = {
  treatment: "verbatim-normalized" as const,
  containingHaggadah: "Haggadah Shir Ge’ulah / Song of Liberation, v2.1" as const,
  containingHaggadahCreator: "Emily Aviva Kapor-Mater" as const,
  containingHaggadahLicense: "CC BY 4.0" as const,
};

/**
 * Source-first reading corpus transcribed from the local v2.1 PDF. “Verbatim
 * normalized” means words and punctuation are retained while PDF line breaks,
 * discretionary hyphenation, and typographic fi/fl ligatures are normalized.
 * These are readings, ritual source texts, and traditional liturgy—not host
 * orientation or action copy. Passage-level metadata remains internal QA data.
 */
export const shirSourcePassages: ShirSourcePassage[] = [
  {
    ...source, id: "shir-kadesh-four-cups", sectionId: "kadesh", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 12, Kadeish — The first cup",
    text: "During the seder, we drink four cups of wine, based on the four actions by which God promised to redeem the people Israel: “I will bring you out from under the burdens of the Egyptians, and I will deliver you from their servitude, and I will redeem you with an outstretched arm and with great judgments, and I will take you to Me for a people, and I will be God for you.”",
    sourcePresentedAttribution: "Exodus 6:6–7", provenanceHash: "511e63d23ddf0f6b4c777f9a4db8c270a8953c441542d5814f774956380067bf",
  },
  {
    ...source, id: "shir-kadesh-kiddush-joy", sectionId: "kadesh", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 12, Kadeish commentary",
    text: "On normal days, even if wine is to be consumed with the meal, we do not make a ceremony of blessing it before the meal begins. But on Shabbat and festivals, we say Kiddush and drink wine before we start the meal, because we wish to bring in the holy day with joy and gladness. This makes the meal itself an extension of the kiddush, dedicating it to the happiness of the day.",
    provenanceHash: "450948b6f1a8d49aefb4fc2f363845e1ae89162895faa77f4f242b09ebd4a504",
  },
  {
    ...source, id: "shir-urchatz-miriams-cup", sectionId: "urchatz", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 15, Miriam’s cup",
    text: "Miriam’s Cup rests on the table, welcoming Miriam the prophet, sister of Moses and Aaron. It is a symbol of the well of water that followed the people Israel through the wilderness. The well provided physical nourishment through water, but also spiritual nourishment, as a constant reminder of the Divine presence within the community. It remains on our table throughout our seder, guiding us in our journey as we reenact the exodus from slavery to freedom tonight.",
    provenanceHash: "02b4338547ffed94f44fbd3a3a301ffc69d9dbac761ad34c315f341c559c4c15",
  },
  {
    ...source, id: "shir-karpas-labor", sectionId: "karpas", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 15, Karpas commentary",
    text: "Tonight, we enjoy a bounty of food set before us, but where did it come from? How did these vegetables we are now eating get to our table? How many hands did they pass through? Did those hands belong to workers who were treated and paid fairly? Tonight, when we celebrate our liberation from bondage, how can we fight for the freedom of others kept in virtual slavery so that we can eat?",
    provenanceHash: "cf9094def96cc422cd5e74ca84de1c38407b80a1a0e409f9af33fe4b5210acce",
  },
  {
    ...source, id: "shir-yachatz-broken-bread", sectionId: "yachatz", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 16, Yaḥatz commentary",
    text: "Why do we break a matzah in half? Why not put a whole matzah away for later? In the next paragraph, we will point to a plate with two complete matzot and one broken one and we will say, “This is the bread of oppression.” The bread of oppression is literally broken. When we are liberated, the bread will be whole.",
    provenanceHash: "d6174e14d0e790148fe590303c0894f9dfed7d8d69e0252ef1bfb96d3fbc295c",
  },
  {
    ...source, id: "shir-maggid-invitation", sectionId: "maggid", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 16, Ha laḥma anya commentary",
    text: "The paragraph that begins the seder is in Aramaic, the everyday language of many Talmudic-era Jews. Here, it is also given in Ladino, the Romance language spoken by many Sefardi Jews. It is supposed to be understandable by everyone, because it is not a prayer, but an invitation. But are all who are hungry truly able to eat anywhere, let alone with us? How many of us would really invite a stranger into our house today? How can we fix the systemic problems that foster hunger, poverty, and oppression?",
    provenanceHash: "8d91849c433b170777a2888258b1418bc7ba8a636ddb6cb5786c257bb2a8bc95",
  },
  {
    ...source, id: "shir-maggid-we-were-slaves", sectionId: "maggid", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 18, We were slaves",
    text: "We were slaves to Pharaoh in Egypt, but YHWH our God took us out of there with a mighty hand and with an outstretched arm. And if the Holy One had not taken our ancestors out of Egypt, then we and all of our descendants might still be enslaved to Pharaoh in Egypt. And even if all of us were scholars, even if all of us were sages, even if all of us were elders, even if all of us were thoroughly learned in Torah, we would still be obligated to tell the story of the exodus from Egypt. Moreover, whoever elaborates upon the story of the exodus from Egypt is deserving of praise.",
    provenanceHash: "79ac4259be15d3a4887d82a4aceebfacbf1813a07bb4a0e9147364ef752fe56a",
  },
  {
    ...source, id: "shir-maggid-own-voices", sectionId: "maggid", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 18, We were slaves commentary",
    text: "We elaborate upon our story because there is nobody else to do it for us. This is our story to tell; therefore let us raise up our own voices. And when the story is not ours but that of other people, let us remember to lift up their voices so that they may tell their own stories. Let us not silence them, but let us let them speak for themselves.",
    provenanceHash: "a4afc1eefcb2670a05d6886e72cf3e82ac7cdc7cf4dc8c6590ac97f7a4965b41",
  },
  {
    ...source, id: "shir-maggid-exodus-verses", sectionId: "maggid", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 24, The exodus from Egypt",
    text: "My father was a wandering Aramean, and he went down to Egypt. He sojourned there with just a few people, and there he became a great nation, mighty and numerous. The Egyptians dealt harshly with us and oppressed us, and imposed hard labor upon us. We cried out to YHWH, the God of our ancestors, and YHWH heard our voice, and saw our oppression, and beheld our labor and our struggle. Then YHWH took us out of Egypt with a mighty hand and an outstretched arm, with awesome power, with signs and with wonders.",
    sourcePresentedAttribution: "Deuteronomy 26:5b–8", provenanceHash: "3675bd78bbb29710eaf2e9b33cab52720ac6ca1ee9ce62532571ab09c676909a",
  },
  {
    ...source, id: "shir-maggid-go-learn", sectionId: "maggid", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 24, The exodus from Egypt commentary",
    text: "The classical interpretive text of the Haggadah starts here with the Hebrew expression tzei u-l’mad—“go out and learn”. In the Aramaic of the Talmud, the rabbis use the phrase ta sh’ma—“come and hear”. You cannot count on wisdom and knowledge to come to you of its own accord; you must go out and seek it, you must follow it, and you must see it through.",
    provenanceHash: "32077cdd84d3dad6e35756ace4674010c554258c6ed142c859e89fd5e8dbd206",
  },
  {
    ...source, id: "shir-maggid-plague-compassion", sectionId: "maggid", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 25, The ten plagues commentary",
    text: "A famous midrash tells how the angels rejoiced as God split the sea and led Israel through, but God rebuked the angels: “My handiwork is drowning in the sea, and you wish to sing praises?!” We learn, “Do not rejoice when your enemies fall, and do not be happy as they stumble.” Is tonight’s celebration justified? Who suffered as a result of the Israelites’ victory? Is spilling a few drops of wine sufficient to recognize the human cost of our victory?",
    sourcePresentedAttribution: "Babylonian Talmud, Megillah 10b; Proverbs 24:17", provenanceHash: "c0cf02b5c91e2e7c6670a736d38dee05789934f1df8ddd3343ead067d33fb295",
  },
  {
    ...source, id: "shir-maggid-sea-action", sectionId: "maggid", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 26, The song at the sea commentary",
    text: "This remarkable passage from the Torah has been commented upon greatly by scholars over the centuries. God tells Moses to stop praying and to actually do something. Midrashic tradition relates that the sea did not actually part until Naḥshon ben Amminadav, a leader of the tribe of Judah, stepped into the waves, causing them to part. Prayer is all well and good, but it can only take us so far.",
    sourcePresentedAttribution: "Babylonian Talmud, Sotah 37a; Numbers Rabbah 8:7", provenanceHash: "5a099c3b3abd6c42bf54fba559184517b0e969f6374e22aae5e35a403216054c",
  },
  {
    ...source, id: "shir-rachtzah-silence", sectionId: "rachtzah", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 33, Roḥ’tzah commentary",
    text: "There is a widely-followed custom (some authorities say a halachic requirement, but others disagree) to refrain from speaking between washing the hands and reciting the blessing over bread, in order to link the two observances and berachot.",
    sourcePresentedAttribution: "Babylonian Talmud, Berachot 42a, followed by Oraḥ Ḥayim 166:1", provenanceHash: "be2e5f152f2ef5df8a3fcae50591a5686b6f3f365b4e7e075113e41be369f992",
  },
  {
    ...source, id: "shir-motzi-two-blessings", sectionId: "motzi-matzah", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 34, Motzi and Matzah",
    text: "Praised are You, our God, Guide of the universe, who brings bread from the ground. Praised are You, our God, Guide of the universe, who has sanctified us by the mitzvot, and instructed us to eat matzah.",
    sourcePresentedAttribution: "Traditional blessings; English translation as printed in Haggadah Shir Ge’ulah", provenanceHash: "72ff3cdbfc0fb2d61fc778fcc5ad7d5b92bdaf8d266fc6d9eacd748ef0b03439",
  },
  {
    ...source, id: "shir-maror-charoset", sectionId: "maror", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 34, Maror commentary",
    text: "The usual constituents of ḥaroset are sweet and hearty nuts and fruits, particularly apples, dates, or figs, blended together with wine to make a paste. One of the many explanations for its presence in the seder is to remind us of the mortar employed in construction. But aside from its symbolic meaning, it simply serves to make the bitterness of the maror more palatable, which in itself is a reminder that even in the darkest of times there may still be sweetness to be found somewhere.",
    provenanceHash: "0e09fe210c00298dabd90d94477d11df16e3e9ffcdce85bb674a63d0fd5bce91",
  },
  {
    ...source, id: "shir-korech-hillel", sectionId: "korech", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 35, Koreich — The Hillel sandwich",
    text: "In memory of the Temple, we do as Hillel used to do when the Temple was standing. He would take the Pesach offering, the matzah, and the maror, and eat them sandwiched together, in order to fulfill the verse: “You shall eat it [the Pesach offering] upon matzot and maror.”",
    sourcePresentedAttribution: "Numbers 9:11", provenanceHash: "9a23e9396e65219d0cbb769bc31bf7c0a166039c60af1e3154ecbfa8b60b5021",
  },
  {
    ...source, id: "shir-korech-bitter-enjoyment", sectionId: "korech", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 35, Koreich commentary",
    text: "Koreich is one of the strangest parts of the Passover seder. We just ate the maror and ḥaroset, and now we’re doing it again, but slightly differently. Why didn’t we just eat it this way to begin with? And furthermore, doing it this way seems to make no sense in these times, given that we are not inserting a piece of roast lamb from the Passover offering into the sandwich. One explanation is that doing it this way affords an opportunity to eat maror while reclining, thus showing our enjoyment even of the bitterest elements of the seder.",
    provenanceHash: "2560f2a1360daa4564051261e39c56fd700d1d5b2ffea8e982d14154a4e15c3c",
  },
  {
    ...source, id: "shir-meal-celebration", sectionId: "shulchan-orech", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 36, Shul’ḥan oreich commentary",
    text: "So far, everything we have eaten in the course of the seder has had some ritual or symbolic significance. But one of the mitzvot of the holiday is to celebrate, and one of the traditional things we do to celebrate is partake of a festive meal. The ritual nature of the food of the meal is simply that it is there to be enjoyed, which itself is a mitzvah.",
    provenanceHash: "15a40da98af65f877942a72e635d7778626f3a8a77c98813963b66060631fc39",
  },
  {
    ...source, id: "shir-tzafun-full-circle", sectionId: "tzafun", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 36, Tzafun commentary",
    text: "The word afikoman probably derives from the Greek epi komos, meaning “that which comes after”. It seems strange to end the meal with bare, unadorned matzah, but the rabbis wanted the taste of the matzah alone to linger in the mouth, thus bringing the seder back full circle: we began our meal with the bread of oppression, and we end it with the same bread, no matter what temporal expressions of wealth might have come in the middle.",
    provenanceHash: "79d4b0cfc6efc2ffb5e09e997d590522fdea66e2530ed330e3dd46d4207a325d",
  },
  {
    ...source, id: "shir-tzafun-children", sectionId: "tzafun", role: "source-reading", tiers: ["medium", "full"], locator: "PDF p. 36, Tzafun commentary",
    text: "The custom of hiding or stealing the afikoman may go back thousands of years: Rabbi Eliezer states that one should “grab the matzot” so that the children don’t fall asleep during the seder. In many circles it is customary for children to demand “ransom” for the afikoman, without which the seder cannot be completed.",
    sourcePresentedAttribution: "Babylonian Talmud, Pesaḥim 109a", provenanceHash: "4c724a5fba47747b2fb8bd8e14f1511189028c35aff9de25178a408f95260ca6",
  },
  {
    ...source, id: "shir-barech-psalm-126", sectionId: "barech", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 37, Psalm 126",
    text: "When God returned Zion’s exiles, it was as if we were dreaming. Our mouths were filled with laughter and our tongues with song. They declared among the nations, “God has done greatness with these!” God has indeed done greatness with us; we have become happy. Return, O God, our captives like springs in the desert. Those who sow in tears shall reap in joy. One who carries seeds weeps, but will return in exultation, bearing sheaves.",
    sourcePresentedAttribution: "Psalm 126", provenanceHash: "e9d3d95de05c00838c5480e9f34fa2d9867dfc51ad992d5d1d355f82daf00176",
  },
  {
    ...source, id: "shir-barech-nourishes-all", sectionId: "barech", role: "ritual-source", tiers: ["medium", "full"], locator: "PDF p. 39, Blessings after the meal",
    text: "Praised are You, our God, Guide of the universe, who nourishes the whole world in goodness, with grace, kindness, and mercy. God gives bread to all flesh, for God’s lovingkindness endures forever. Because of God’s great goodness, we have never lacked, nor may we ever lack, nourishment for eternity. For the sake of God’s great Name, for God is the One who nourishes and sustains all, and benefits all, God prepares food for all the creatures that God created. Praised are You, God, who nourishes all.",
    sourcePresentedAttribution: "Traditional Birkat Hamazon; Psalm 136:25", provenanceHash: "88713342d547076bdc2b2d2b4b6af642b341399aa8b59278bae99d752a9c7312",
  },
  {
    ...source, id: "shir-barech-peace-liberation", sectionId: "barech", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 46, Ha-Raḥaman additions",
    text: "May the Merciful One grant peace and fellowship between Isaac and Ishmael. May the Merciful One wisely and fully liberate all of creation, and thereby enable us to reach our own truths, and to recognize the image of God in each other.",
    provenanceHash: "e8e0e7ffda3290d9b6ed1d96f33dd8855354aec7671ceffa5cc7799edabbfd57",
  },
  {
    ...source, id: "shir-hallel-remembrance", sectionId: "hallel", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 48, Remembrance",
    text: "Oppression is not something that happened long ago such that now we are completely free of it. Our seder turns somber for a moment. Who is not at our seder tonight? Why aren’t they here? We hope for a better future when all may be able to celebrate with us, but we must do more than hope: we must commit to working together to make that future a reality.",
    provenanceHash: "25f8f3a30954626651df627261c981f3161efba4b317d294e2889448ec2c969f",
  },
  {
    ...source, id: "shir-hallel-peace-equality", sectionId: "hallel", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 48, reading before Hallel",
    text: "Pour out Your spirit upon all flesh, and let all nations come together in love and fellowship, peace and true equality. You shall not commit a wrong against a stranger, nor oppress them, for you were strangers in the land of Egypt.",
    sourcePresentedAttribution: "First sentence based on Rabbi Leopold Stein, Seder Ha-Avodah (Mannheim, 1882); second sentence Exodus 22:20", provenanceHash: "55649ce26bdaa88ca3a2107b90ea29c8c6b9a946dfd5121c3c8d0962a0ac9dae",
  },
  {
    ...source, id: "shir-hallel-psalm-118", sectionId: "hallel", role: "ritual-source", tiers: ["medium", "full"], locator: "PDF p. 57, Psalm 118",
    text: "Give thanks to God, for God is good; God’s kindness endures forever. Let now Israel say: “God’s kindness endures forever.” Let now the house of Aaron say: “God’s kindness endures forever.” Let now those who revere God say: “God’s kindness endures forever.” I have called upon God from the straits; God answered me with great abundance. God is for me; I do not fear anything that mortals can do to me. God is for me as my aid; I shall gaze upon all who hate me. Better to trust in God than trust in mortals; better to trust in God than trust in princes.",
    sourcePresentedAttribution: "Psalm 118", provenanceHash: "6da9f4f96cec4f1d25a2eb98d822c1daefab7bcbc7e75a55df5326e89d98bdb4",
  },
  {
    ...source, id: "shir-nirtzah-omer", sectionId: "nirtzah", role: "source-reading", tiers: ["short", "medium", "full"], locator: "PDF p. 64, Counting the omer commentary",
    text: "The Torah instructs us to count seven weeks from Passover, counting up the time from the exodus to the revelation at Mount Sinai, which is commemorated at the holiday of Shavuot. An omer is a measure of grain; in ancient times one was brought to the Temple every day for seven weeks as a physical representation of the counting. The counting represents spiritual preparation: freedom from physical slavery and freedom from spiritual slavery are two inextricable things.",
    sourcePresentedAttribution: "Leviticus 23:15–16", provenanceHash: "3e963d149f4f91a96a76445d65d5ae5aebc5e64f509eb4fa8cfa9ba3444f7469",
  },
  {
    ...source, id: "shir-nirtzah-diversity-of-life", sectionId: "nirtzah", role: "ritual-source", tiers: ["short", "medium", "full"], locator: "PDF p. 65, blessing after a non-wine beverage",
    text: "Praised are You, our God, Guide of the universe, who creates the diversity of life, each kind with its uniqueness, so that all life might be sustained and enriched thereby. Blessed is the Life of Worlds.",
    sourcePresentedAttribution: "Traditional borei nefashot blessing; English translation as printed in Haggadah Shir Ge’ulah", provenanceHash: "7f4542656fc71b3aee0857c403ea22bb6c2c50c2b59fa3c99beaa78b03c3168e",
  },
  {
    ...source, id: "shir-nirtzah-bendigamos", sectionId: "nirtzah", role: "ritual-source", tiers: ["full"], locator: "PDF p. 66, Bendigamos — Let us bless",
    text: "Let us bless the Most High, firstly for his Law, which binds our people with Heaven continually. Praised be his Holy Name, because he always took pity on us. Praise the Lord, for he is good, for his mercy is everlasting. Let us bless the Most High, secondly for the bread, and also for the food which we eat together. For we have eaten and drunk happily, his mercy has never failed us. Praise the Lord, for he is good, for his mercy is everlasting.",
    sourcePresentedAttribution: "Bendigamos; English translation by David de Sola Pool, as credited in Haggadah Shir Ge’ulah p. 66", provenanceHash: "3d9353e6a07e7e2c2c0dd90ee6a627e5e2bea0c6c60a733cb58291945e985795",
  },
];

export const shirCoverage = {
  sectionIds: [...new Set(shirSourcePassages.map((passage) => passage.sectionId))],
  byTier: Object.fromEntries(
    (["short", "medium", "full"] as const).map((tier) => [
      tier,
      [...new Set(shirSourcePassages.filter((passage) => passage.tiers.includes(tier)).map((passage) => passage.sectionId))],
    ]),
  ) as Record<SourceLengthTier, string[]>,
  sourceWordTotals: Object.fromEntries(
    (["short", "medium", "full"] as const).map((tier) => [
      tier,
      shirSourcePassages
        .filter((passage) => passage.tiers.includes(tier))
        .reduce((total, passage) => total + passage.text.trim().split(/\s+/).length, 0),
    ]),
  ) as Record<SourceLengthTier, number>,
  /** Sections with new source text added beyond the preceding tier. */
  expansionSections: {
    medium: [...new Set(shirSourcePassages.filter((passage) => !passage.tiers.includes("short") && passage.tiers.includes("medium")).map((passage) => passage.sectionId))],
    full: [...new Set(shirSourcePassages.filter((passage) => passage.tiers.length === 1 && passage.tiers[0] === "full").map((passage) => passage.sectionId))],
  },
};
