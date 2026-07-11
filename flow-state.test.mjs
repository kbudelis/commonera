import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialFlow,
  transitionFlow,
  visibleLandmarksForFlow,
} from "./build/flow-test/flow.js";

function advanceToBirthday() {
  const welcome = createInitialFlow();
  const zodiacTransition = transitionFlow(welcome, { type: "advance" });
  return transitionFlow(zodiacTransition, { type: "advance" });
}

test("initial flow advances through the zodiac transition to birthday entry", () => {
  const welcome = createInitialFlow();
  assert.equal(welcome.step, "welcome");

  const zodiacTransition = transitionFlow(welcome, { type: "advance" });
  assert.equal(zodiacTransition.step, "zodiac-transition");

  const birthday = transitionFlow(zodiacTransition, { type: "advance" });
  assert.equal(birthday.step, "birthday");
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
