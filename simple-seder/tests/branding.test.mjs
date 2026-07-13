import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("reader-facing surfaces use the Let My People Host brand", async () => {
  const [page, layout, readme, project] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
    readFile(new URL("README.md", projectRoot), "utf8"),
    readFile(new URL("project.json", projectRoot), "utf8"),
  ]);
  const readerFacingCopy = [page, layout, readme, project].join("\n");

  assert.match(page, /> Let My People Host</);
  assert.match(layout, /title: "Let My People Host —/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/letmypeoplehost\.com"\)/);
  assert.match(layout, /siteName: "Let My People Host"/);
  assert.match(readme, /^# Let My People Host$/m);
  assert.equal(JSON.parse(project).name, "Let My People Host");
  assert.ok(page.match(/LetMyPeopleHost\.com/g)?.length >= 6);
  assert.doesNotMatch(
    readerFacingCopy,
    /Passover for Beginners|PassoverForBeginners\.com|Simple Seder|Haggadah for Beginners/,
  );
});
