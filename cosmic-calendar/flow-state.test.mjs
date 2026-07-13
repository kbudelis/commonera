import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  createInitialFlow,
  formatBirthdayFieldValue,
  transitionFlow,
  visibleLandmarksForFlow,
} from "./build/flow-test/flow.js";
import {
  FlowSections,
  getCircularMonthOffset,
  scrollToLandmarkUnlessReducedMotion,
  wrapMonthIndex,
} from "./build/flow-test/App.js";
import {
  BIRTH_PORTRAITS,
  buildPersonalThread,
  createStoredBirthProfile,
  getCurrentSeason,
  getUpcomingPanel,
  MONTH_ENTRIES,
  MONTH_ORDER,
} from "./build/flow-test/content.js";

function advanceToBirthday() {
  const welcome = createInitialFlow();
  const zodiacTransition = transitionFlow(welcome, { type: "advance" });
  return transitionFlow(zodiacTransition, { type: "advance" });
}

test("birthday entry inserts date slashes while typing and pasting", () => {
  assert.equal(formatBirthdayFieldValue(""), "");
  assert.equal(formatBirthdayFieldValue("1"), "1");
  assert.equal(formatBirthdayFieldValue("12", "1"), "12/");
  assert.equal(formatBirthdayFieldValue("123"), "12/3");
  assert.equal(formatBirthdayFieldValue("1234", "12/3"), "12/34/");
  assert.equal(formatBirthdayFieldValue("12345"), "12/34/5");
  assert.equal(formatBirthdayFieldValue("12-34-1998"), "12/34/1998");
  assert.equal(formatBirthdayFieldValue("123456789"), "12/34/5678");
  assert.equal(formatBirthdayFieldValue("12", "12/"), "12");
  assert.equal(formatBirthdayFieldValue("12/34", "12/34/"), "12/34");
});

test("initial flow advances through the zodiac transition to birthday entry", () => {
  const welcome = createInitialFlow();
  assert.equal(welcome.step, "welcome");

  const zodiacTransition = transitionFlow(welcome, { type: "advance" });
  assert.equal(zodiacTransition.step, "zodiac-transition");

  const birthday = transitionFlow(zodiacTransition, { type: "advance" });
  assert.equal(birthday.step, "birthday");
});

test("the month curve wraps continuously around all twelve entries", () => {
  assert.equal(wrapMonthIndex(-1), 11);
  assert.equal(wrapMonthIndex(12), 0);
  assert.equal(getCircularMonthOffset(11, 0), -1);
  assert.equal(getCircularMonthOffset(0, 11), 1);
  assert.equal(getCircularMonthOffset(4, 3), 1);
});

test("valid birthday records the date and shows personal before month", () => {
  const birthday = advanceToBirthday();
  const personal = transitionFlow(birthday, {
    type: "submit-birthday",
    value: "07/10/1998",
  });

  assert.equal(personal.step, "personal");
  assert.equal(personal.birthday, "07/10/1998");
  assert.equal(personal.validationError, null);
  assert.deepEqual(visibleLandmarksForFlow(personal), [
    "personal",
    "month",
    "upcoming",
  ]);
});

test("birth-chart edit returns to the populated birthday entry", () => {
  const personal = transitionFlow(advanceToBirthday(), {
    type: "submit-birthday",
    value: "07/10/1998",
  });
  const birthday = transitionFlow(personal, { type: "edit-birthday" });

  assert.equal(birthday.step, "birthday");
  assert.equal(birthday.birthday, "07/10/1998");
  assert.equal(birthday.validationError, null);
  assert.deepEqual(visibleLandmarksForFlow(birthday), ["birthday"]);
});

test("welcome and birthday skips reach month without personal data", () => {
  const welcomeSkip = transitionFlow(createInitialFlow(), {
    type: "skip-to-month",
  });
  const birthdaySkip = transitionFlow(advanceToBirthday(), {
    type: "skip-to-month",
  });

  for (const state of [welcomeSkip, birthdaySkip]) {
    assert.equal(state.step, "month");
    assert.equal(state.birthday, null);
    assert.deepEqual(visibleLandmarksForFlow(state), ["month", "upcoming"]);
  }
});

test("invalid birthday stays active and exposes validation feedback", () => {
  const birthday = advanceToBirthday();
  const invalid = transitionFlow(birthday, {
    type: "submit-birthday",
    value: "02/30/1998",
  });

  assert.equal(invalid.step, "birthday");
  assert.equal(invalid.birthday, null);
  assert.match(invalid.validationError ?? "", /valid date/i);
  assert.deepEqual(visibleLandmarksForFlow(invalid), ["birthday"]);
});

const renderFlow = (state, welcomeLine = 0) =>
  renderToStaticMarkup(
    createElement(FlowSections, {
      state,
      nameValue: "Mara",
      nameError: null,
      birthdayValue: "",
      welcomeLine,
      welcomeExiting: false,
      onAdvanceWelcome() {},
      onAdvance() {},
      onNameChange() {},
      onBirthdayChange() {},
      onBirthdaySubmit() {},
      onSkip() {},
      onEditBirthday() {},
    }),
  );

test("welcome renders the approved two-page sequence", () => {
  const pages = [
    ["Where were you", "when the universe began?"],
    ["Long before you were born,", "the heavens knew your name"],
  ];

  pages.forEach((page, index) => {
    const markup = renderFlow(createInitialFlow(), index);
    let previousLine = -1;
    page.forEach((line) => {
      const currentLine = markup.indexOf(`>${line}</span>`);
      assert.ok(currentLine > previousLine);
      previousLine = currentLine;
    });
  });
});

test("welcome uses one tap action and birthday owns the month skip", () => {
  const welcomeMarkup = renderFlow(createInitialFlow());
  const birthdayMarkup = renderFlow(advanceToBirthday());

  assert.match(welcomeMarkup, />tap to continue</);
  assert.doesNotMatch(welcomeMarkup, /Skip to this month/);
  assert.match(birthdayMarkup, /Skip to this month/);
  assert.match(birthdayMarkup, /placeholder="Name"/);
  assert.ok(
    birthdayMarkup.indexOf('placeholder="Name"') <
      birthdayMarkup.indexOf('placeholder="MM\/DD\/YYYY"'),
  );
});

test("both skip origins render month and upcoming without personal", () => {
  const welcomeSkip = transitionFlow(createInitialFlow(), {
    type: "skip-to-month",
  });
  const birthdaySkip = transitionFlow(advanceToBirthday(), {
    type: "skip-to-month",
  });

  for (const state of [welcomeSkip, birthdaySkip]) {
    const markup = renderFlow(state);
    assert.doesNotMatch(markup, /data-landmark="personal"/);
    assert.match(markup, /data-landmark="month"/);
    assert.match(markup, /data-landmark="upcoming"/);
  }
});

test("birthday path renders personal before month and upcoming", () => {
  const state = transitionFlow(advanceToBirthday(), {
    type: "submit-birthday",
    value: "07/10/1998",
  });
  const profile = createStoredBirthProfile("07/10/1998", "Mara");
  const markup = renderFlow(state);

  assert.ok(profile);

  const personal = markup.indexOf('data-landmark="personal"');
  const month = markup.indexOf('data-landmark="month"');
  const upcoming = markup.indexOf('data-landmark="upcoming"');

  assert.ok(personal >= 0);
  assert.ok(personal < month);
  assert.ok(month < upcoming);
  assert.match(markup, /id="personal-title" class="personal-name">Mara<\/h1>/);
  const birthMonth = MONTH_ENTRIES[profile.derived.hebrewDate.monthKey];
  const personalMarkup = markup.slice(personal, month);
  assert.match(
    personalMarkup,
    new RegExp(
      `<span>${birthMonth.correspondence.mazal.zodiacLabel}<\\/span><span aria-hidden="true">·<\\/span><span>${birthMonth.correspondence.names.english}<\\/span>`,
    ),
  );
  const personalThread = buildPersonalThread(profile);
  assert.match(personalThread, /^The season of your birth /);
  assert.equal(
    personalThread.includes(birthMonth.correspondence.mazal.zodiacLabel),
    false,
  );
  const portrait = BIRTH_PORTRAITS[birthMonth.correspondence.key];
  assert.ok(portrait);
  assert.match(personalMarkup, /<dt>Light<\/dt>/);
  assert.match(personalMarkup, /<dt>Shadow wisdom<\/dt>/);
  assert.match(personalMarkup, new RegExp(portrait.question.replace(/[?]/g, "\\?")));
  assert.doesNotMatch(personalMarkup, /Your invitation/);
  assert.doesNotMatch(personalMarkup, /moon/i);
  assert.equal(
    (personalMarkup.match(
      new RegExp(birthMonth.correspondence.names.english, "g"),
    ) ?? []).length,
    1,
  );
  assert.equal(markup.includes(profile.derived.hebrewDate.displayLabel), false);
  assert.equal(markup.includes(profile.derived.hebrewDate.hebrewDisplay), false);
  assert.doesNotMatch(markup, /Personal Thread/);
});

test("Tevet saves its voice for the closing question", () => {
  assert.match(
    MONTH_ENTRIES.tevet.reading.reading,
    /^In Tevet, endurance can carry us through the dark/,
  );
  assert.equal(MONTH_ENTRIES.tevet.reading.reading.includes("Tevet asks"), false);
  assert.equal(
    MONTH_ENTRIES.tevet.reading.witnessingQuestion,
    "What deserves your discipline rather than your force?",
  );
});

test("birthday and month compositions render real visual assets", () => {
  const birthdayState = transitionFlow(advanceToBirthday(), {
    type: "submit-birthday",
    value: "07/10/1998",
  });
  const birthdayMarkup = renderFlow(birthdayState);
  const monthMarkup = renderFlow(
    transitionFlow(createInitialFlow(), { type: "skip-to-month" }),
  );

  assert.match(birthdayMarkup, /class="hero-glyph-art"/);
  assert.match(
    birthdayMarkup,
    /<button[^>]*aria-label="Edit name and birthday"[^>]*>/,
  );
  assert.equal(
    (birthdayMarkup.match(/constellation-art--month/g) ?? []).length,
    12,
  );
  assert.equal(
    (monthMarkup.match(/constellation-art--month/g) ?? []).length,
    12,
  );
  assert.ok(
    birthdayMarkup.indexOf("constellation-art--month") >
      birthdayMarkup.indexOf('data-landmark="month"'),
  );
  const currentSeason = getCurrentSeason();
  assert.match(monthMarkup, /role="listbox" aria-label="Twelve month readings"/);
  assert.match(monthMarkup, /class="month-zodiac-backdrop"/);
  assert.doesNotMatch(monthMarkup, /month-curve-label/);
  for (const monthKey of MONTH_ORDER) {
    const entry = MONTH_ENTRIES[monthKey];
    assert.match(
      monthMarkup,
      new RegExp(
        `aria-label="${entry.correspondence.names.english}, ${entry.correspondence.mazal.zodiacLabel}`,
      ),
    );
  }
  assert.match(
    monthMarkup,
    new RegExp(`This month · ${currentSeason.entry.correspondence.mazal.zodiacLabel}`),
  );
  assert.ok(
    monthMarkup.includes(
      `<h1 id="month-title" class="visually-hidden">${currentSeason.entry.correspondence.names.english}</h1>`,
    ),
  );
  assert.match(monthMarkup, /class="month-title-glyph"/);
  assert.match(monthMarkup, /03-white-transparent/);
  assert.doesNotMatch(monthMarkup, /lang="he"/u);
  assert.doesNotMatch(monthMarkup, /class="profile-facts"/);
  assert.doesNotMatch(
    monthMarkup,
    new RegExp(`This month · ${currentSeason.hebrewDate.exactMonthLabel}`),
  );
  assert.doesNotMatch(
    monthMarkup,
    new RegExp(`profile-facts">[^<]+ · ${getCurrentSeason().moon.label}`),
  );
  assert.doesNotMatch(birthdayMarkup, /[♈♉♊♋♌♍♎♏♐♑♒♓]/u);
  assert.doesNotMatch(monthMarkup, /[♈♉♊♋♌♍♎♏♐♑♒♓]/u);
  assert.doesNotMatch(birthdayMarkup, /constellation-placeholder/);
  assert.match(monthMarkup, /Friday &amp; Moon/);
  assert.match(monthMarkup, />Friday pulse</);
  assert.match(monthMarkup, />Moon moment</);
  assert.match(monthMarkup, /class="moon-state moon-state--waning-crescent"/);
  assert.doesNotMatch(monthMarkup, /Moon phase placeholder/);
  assert.match(monthMarkup, /class="upcoming-context"/);
  assert.match(monthMarkup, /class="friday-carry"/);
  assert.match(monthMarkup, /class="upcoming-prompt"/);
  assert.ok(
    monthMarkup.indexOf('class="upcoming-card friday-card"') <
      monthMarkup.indexOf('class="upcoming-card moon-card"'),
  );
  assert.match(
    monthMarkup,
    /Symbolic Hebrew-calendar rhythm · not an astronomical phase/,
  );
});

test("post-birth pages snap one screen at a time without ritual dividers", () => {
  const styles = readFileSync(new URL("./src/styles.css", import.meta.url), "utf8");
  const documentShell = readFileSync(
    new URL("./index.html", import.meta.url),
    "utf8",
  );
  const personalFlowRule = styles.match(
    /\.flow-page--personal\s*\{([^}]*)\}/s,
  )?.[1] ?? "";
  const personalSectionsRule = styles.match(
    /\.flow-page--personal \.flow-section\s*\{([^}]*)\}/s,
  )?.[1] ?? "";
  const ritualRule = styles.match(/\.ritual-card\s*\{([^}]*)\}/s)?.[1] ?? "";
  const monthSectionRule = styles.match(/\.month-section\s*\{([^}]*)\}/s)?.[1] ?? "";
  const constellationRule = styles.match(
    /\.constellation-art img\s*\{([^}]*)\}/s,
  )?.[1] ?? "";
  const curveRule = styles.match(/\.month-curve-gallery\s*\{([^}]*)\}/s)?.[1] ?? "";
  const moonStateRule = styles.match(/\.moon-state\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(personalFlowRule, /scroll-snap-type:\s*y mandatory/);
  assert.match(personalSectionsRule, /scroll-snap-stop:\s*always/);
  assert.doesNotMatch(ritualRule, /border-(?:top|bottom):/);
  assert.match(monthSectionRule, /overflow:\s*hidden/);
  assert.match(monthSectionRule, /background:\s*var\(--blue\)/);
  assert.match(constellationRule, /brightness\(0\) invert\(1\)/);
  assert.match(curveRule, /perspective:\s*900px/);
  assert.match(curveRule, /touch-action:\s*pan-y/);
  assert.match(moonStateRule, /width:\s*64px/);
  assert.match(moonStateRule, /--moon-shadow-shift:\s*0%/);
  assert.match(documentShell, /http-equiv="Content-Security-Policy"/);
  assert.match(documentShell, /connect-src 'none'/);
  assert.match(documentShell, /frame-ancestors 'none'/);
  assert.match(documentShell, /form-action 'self'/);
  assert.match(documentShell, /name="referrer" content="no-referrer"/);
});

test("reduced motion returns before querying a landmark or scrolling", () => {
  let landmarkQueries = 0;
  let scrollCalls = 0;

  const didScroll = scrollToLandmarkUnlessReducedMotion(
    "personal",
    {
      querySelector() {
        landmarkQueries += 1;
        return null;
      },
    },
    {
      matchMedia() {
        return { matches: true };
      },
      scrollTo() {
        scrollCalls += 1;
      },
    },
  );

  assert.equal(didScroll, false);
  assert.equal(landmarkQueries, 0);
  assert.equal(scrollCalls, 0);
});

test("the content model contains 12 current-month readings with rituals", () => {
  const entries = Object.values(MONTH_ENTRIES);

  assert.equal(entries.length, 12);
  assert.equal(MONTH_ORDER.length, 12);
  assert.deepEqual(new Set(MONTH_ORDER), new Set(Object.keys(MONTH_ENTRIES)));
  for (const entry of entries) {
    assert.ok(entry.reading.reading.length > 0);
    assert.ok(entry.reading.ritual.length > 0);
    assert.equal(entry.reading.monthKey, entry.correspondence.key);
    assert.equal(
      entry.reading.reading.includes(entry.correspondence.names.english),
      true,
    );
  }
});

test("every birth month has one compact portrait without deferred profile material", () => {
  const portraitKeys = Object.keys(BIRTH_PORTRAITS);
  const wordCount = (value) => value.trim().split(/\s+/u).length;

  assert.deepEqual(new Set(portraitKeys), new Set(MONTH_ORDER));
  for (const monthKey of MONTH_ORDER) {
    const portrait = BIRTH_PORTRAITS[monthKey];

    assert.ok(wordCount(portrait.narrative) >= 42);
    assert.ok(wordCount(portrait.narrative) <= 55);
    assert.ok(wordCount(portrait.light) >= 8);
    assert.ok(wordCount(portrait.light) <= 14);
    assert.ok(wordCount(portrait.shadowWisdom) >= 12);
    assert.ok(wordCount(portrait.shadowWisdom) <= 20);
    assert.ok(wordCount(portrait.question) >= 8);
    assert.ok(wordCount(portrait.question) <= 14);
    assert.match(portrait.question, /\?$/u);
    assert.doesNotMatch(
      Object.values(portrait).join(" "),
      /\b(?:moon|tribe|your invitation)\b/iu,
    );
  }
});

test("a birthday stays local-only without storing authored prose", () => {
  const profile = createStoredBirthProfile("07/10/1998", "  Mara  ");
  const appSource = readFileSync(new URL("./src/App.tsx", import.meta.url), "utf8");
  const contentSource = readFileSync(
    new URL("./src/content.ts", import.meta.url),
    "utf8",
  );

  assert.ok(profile);
  assert.equal(profile.input.displayName, "Mara");
  assert.equal(profile.derived.hebrewDate.monthKey, "tammuz");
  assert.equal(MONTH_ENTRIES.tammuz.correspondence.letter.glyph, "ח");
  assert.doesNotMatch(JSON.stringify(profile), /reading|ritual/i);
  assert.match(contentSource, /storage\.setItem\(BIRTH_PROFILE_STORAGE_KEY,/);
  assert.match(contentSource, /storage\.getItem\(BIRTH_PROFILE_STORAGE_KEY\)/);
  assert.doesNotMatch(contentSource, /removeItem|storage\.clear\(/);
  assert.doesNotMatch(
    `${appSource}\n${contentSource}`,
    /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/,
  );
});

test("the date library's Sh'vat spelling normalizes to the Shevat portrait", () => {
  const profile = createStoredBirthProfile("01/28/1998");

  assert.ok(profile);
  assert.equal(profile.derived.hebrewDate.monthKey, "shevat");
  assert.ok(BIRTH_PORTRAITS[profile.derived.hebrewDate.monthKey]);
});

test("Adar I and Adar II retain their exact labels but share one month entry", () => {
  const adarI = createStoredBirthProfile("02/15/2024");
  const adarII = createStoredBirthProfile("03/15/2024");

  assert.ok(adarI);
  assert.ok(adarII);
  assert.equal(adarI.derived.hebrewDate.exactMonthLabel, "Adar I");
  assert.equal(adarII.derived.hebrewDate.exactMonthLabel, "Adar II");
  assert.equal(adarI.derived.hebrewDate.monthKey, "adar");
  assert.equal(adarII.derived.hebrewDate.monthKey, "adar");
});

test("current season derives Tishrei from a fixed civil date", () => {
  const season = getCurrentSeason(new Date(2024, 9, 3, 12));

  assert.equal(season.hebrewDate.monthKey, "tishrei");
  assert.equal(season.entry.correspondence.names.english, "Tishrei");
});

test("upcoming panel stays event-month honest across late Tammuz", () => {
  const panel = getUpcomingPanel(new Date(2026, 6, 11, 12));

  assert.equal(panel.current.hebrewDate.monthKey, "tammuz");
  assert.equal(panel.current.moon.phaseKey, "waning-crescent");
  assert.equal(panel.friday.state, "shabbat");
  assert.match(panel.friday.carry, /^One question:/);
  assert.ok(panel.moonMoment);
  assert.equal(panel.moonMoment.kind, "new");
  assert.equal(panel.moonMoment.monthKey, "av");
  assert.equal(panel.moonMoment.windowStartISO, "2026-07-15");
  assert.equal(panel.moonMoment.windowEndISO, "2026-07-16");
  assert.match(panel.moonMoment.hebrewLabel, /Av/);
});

test("upcoming panel distinguishes a live Friday from a distant moon window", () => {
  const panel = getUpcomingPanel(new Date(2026, 6, 17, 12));

  assert.equal(panel.current.hebrewDate.monthKey, "av");
  assert.equal(panel.friday.state, "friday");
  assert.equal(panel.friday.daysAway, 0);
  assert.equal(panel.friday.monthKey, "av");
  assert.equal(panel.moonMoment, null);
});

test("upcoming panel surfaces a symbolic full-moon window", () => {
  const panel = getUpcomingPanel(new Date(2026, 6, 27, 12));

  assert.ok(panel.moonMoment);
  assert.equal(panel.moonMoment.kind, "full");
  assert.equal(panel.moonMoment.windowStartISO, "2026-07-29");
  assert.equal(panel.moonMoment.windowEndISO, "2026-07-30");
  assert.equal(panel.moonMoment.hebrewLabel, "15–16 Av");
});
