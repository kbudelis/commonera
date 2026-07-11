# Source-corpus manifest

Last audited: **July 11, 2026**  
Catalog scope: **20 source Haggadah records**  
Locally acquired and file-verified: **3 PDFs**  
Storage: `research/source-materials/` (intentionally gitignored)

This manifest is the acquisition and editorial ledger for the source corpus. A record in the catalog does **not** mean that its complete source file has been downloaded, reviewed passage by passage, or incorporated into generated output. Runtime text may be described as borrowed or adapted only when it has an internal passage record with an exact locator, treatment, source excerpt, and provenance hash.

## Reuse and attribution rules

- Public-domain works, standardized open licenses, and explicit creator permission are accepted on their stated terms.
- Under the project's inclusive editorial rule, third-party material printed inside an approved source Haggadah may be considered for the local demo. Preserve its attribution exactly as printed in that source, record the containing Haggadah, page or section, exact treatment, and a hash of the reviewed excerpt. Do not silently strip or replace the original credit.
- Internal provenance is granular: source ID, edition, page or section, exact excerpt, treatment (`verbatim`, `excerpted`, `lightly-adapted`, or `adapted`), modification note, and SHA-256 provenance hash.
- Reader-facing Haggadah credits are deliberately simpler: list each **used source Haggadah once** on the final credits page. Do not place line-by-line citations in the reading flow.
- ShareAlike, noncommercial, attribution, license-link, and change-notice conditions remain binding. This ledger is not a substitute for a release-specific rights review.
- A source may supply a coherent primary spine or a carefully selected secondary insert. Do not combine passages merely because both are legally reusable.

## File-verification ledger

The following files were checked with both `file` and `pdfinfo`; none is HTML mislabeled as PDF.

| Source ID | Local file | Verified type | Pages | Bytes | SHA-256 |
|---|---|---:|---:|---:|---|
| `shir-geulah` | `research/source-materials/Haggadah Shir Geulah v2.1.pdf` | PDF 1.3 | 74 | 821,293 | `74624f8561826eb1e4850c8c625c28a029396ac4f6df7077cf213e8ed9730ed1` |
| `tropified-haggadah` | `research/source-materials/Passover Seder Haggadah Tropified.pdf` | PDF 1.5 | 37 | 312,166 | `11c97fd628ad30de4c6039a3a28413e380bea80d28b101aa6000869429c247fe` |
| `velveteen-rabbi` | `research/source-materials/Velveteen Rabbi Haggadah v9.pdf` | PDF 1.4 | 84 | 11,419,488 | `20d0a3c496427c10dd7de0e05d82a5834faeaaa09effcdd12f3fe861fa6779f1` |

## Complete 20-source acquisition ledger

Statuses are intentionally literal. **Acquired** means a local file exists and was verified. **Known direct file, not acquired** means a reusable file URL was identified but the file was not downloaded in this pass. **Catalog page only** means no verified direct asset was established. Open Siddur's Cloudflare protection made automated asset discovery unreliable during this audit; that is an acquisition blocker, not a rights judgment.

### 1. `traditional-core` — Seder Haggadah Shel Pesaḥ

- Creator: Paltiel Birnbaum
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/seder-haggadah-shel-pesah-translated-and-annotated-by-paltiel-birnbaum-1953/>
- Reuse basis: cataloged as a CC0/public-domain scan; recheck jurisdiction outside the United States.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: formal mid-century English; traditional liturgical theology; adult/family audience with prior ritual context; nonpartisan/traditional political framing; best fit `traditional`.
- Editorial role: candidate traditional primary spine after edition-level review; pair modern explanatory inserts sparingly.

### 2. `wandering-is-over` — The Wandering Is Over Haggadah

- Creator: JewishBoston and Jewish Women's Archive
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-wandering-is-over-haggadah-including-womens-voices-by-jewish-boston-and-jewish-womens-archive-2011/>
- Direct PDF identified: <https://opensiddur.org/wp-content/uploads/2011/03/The-Wandering-is-Over-Haggadah-JewishBoston-2011.pdf>
- Reuse basis: CC BY-SA 3.0 except where the work itself notes otherwise; preserve all printed credits and ShareAlike obligations.
- Acquisition: **Known direct file, not acquired.** Network acquisition was stopped before this file was saved.
- Cohesion profile: contemporary, accessible, story-centered; pluralistic Jewish framing with women's voices; mixed-age/community audience; inclusive social-history framing; best fits `feminist` and `family-storytelling`.
- Editorial role: promising accessible spine or substantial secondary layer; likely compatible with Shir Ge'ulah ritual instructions.

### 3. `inner-seder` — Haggadah of the Inner Seder

- Creator: David Seidenberg
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-of-the-inner-seder-by-david-seidenberg-neohasid-org/>
- Direct PDF identified: <https://opensiddur.org/wp-content/uploads/2015/04/Haggadah-of-the-Inner-Seder-Rabbi-David-Seidenberg-neohasid.org-v.10.pdf>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Known direct file, not acquired.** Network acquisition was stopped before this file was saved.
- Cohesion profile: contemplative and interpretive; neo-Hasidic/mystical theology; reflective adult or older-teen audience; inward rather than partisan political framing; best fits `mindfulness` and `environment`.
- Editorial role: secondary reflection layer, or a reverent/reflective spine for longer versions; avoid scattering isolated mystical lines into playful copy.

### 4. `other-side-of-sea` — The Other Side of the Sea

- Creator: T'ruah
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-other-side-of-the-sea-a-haggadah-for-fighting-modern-day-slavery-by-truah-the-rabbinic-call-for-human-rights/>
- Direct PDF identified: <https://opensiddur.org/wp-content/uploads/2015/03/Truah-Other-Side-of-the-Sea-An-Antitrafficking-Haggadah-for-Passover-5775-2015-CC-BY-SA.pdf>
- Reuse basis: CC BY-SA 4.0; preserve all printed third-party credits in internal provenance.
- Acquisition: **Known direct file, not acquired.** Network acquisition was stopped before this file was saved.
- Cohesion profile: urgent, educational, human-rights focused; Jewish ethical theology; adult/teen justice-oriented audience; explicit anti-trafficking framing; best fit `social-justice`.
- Editorial role: targeted Maggid and discussion inserts over a stable ritual spine, not a universal default voice.

### 5. `freedom-seder-earth` — The Freedom Seder for the Earth

- Creator: Arthur Waskow and The Shalom Center
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-freedom-seder-haggadah-for-passover-by-the-shalom-center-and-rabbi-arthur-waskow/>
- Direct PDF identified: <https://opensiddur.org/wp-content/uploads/2014/04/The-Shalom-Center-Freedom-Seder-for-the-Earth-Haggadah-2009-03-09.pdf>
- Reuse basis: cataloged as CC BY-SA 4.0; preserve source-presented credits and required notices.
- Acquisition: **Known direct file, not acquired.** Network acquisition was stopped before this file was saved.
- Cohesion profile: prophetic, expansive, activist; eco-Jewish/interfaith theology; adult/community audience; climate-justice political framing; best fits `environment` and `social-justice`.
- Editorial role: environmental insert bank or themed long-form spine; pair with a concise procedural source for beginners.

### 6. `shir-geulah` — Haggadah Shir Ge'ulah / Song of Liberation

- Creator: Emily Aviva Kapor-Mater
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-shir-geulah-song-of-liberation-by-emily-aviva-kapor/>
- Stable evidence record: <https://opensiddur.org/?p=8819>
- Reuse basis: CC BY 4.0; attribution, license link, and modification notice required.
- Acquisition: **Acquired and verified.** Local edition is v2.1, 74 pages; see file-verification ledger.
- Cohesion profile: contemporary, direct, liberation-centered; pluralistic Jewish ritual theology; beginner-friendly adult/mixed audience; inclusive freedom framing; best fits `traditional`, `social-justice`, and `lgbtq` depending on selected passages.
- Editorial role: strong procedural and ritual backbone for a beginner version; pair with one coherent thematic source rather than unrelated quotations.

### 7. `velveteen-rabbi` — The Velveteen Rabbi's Haggadah for Pesach

- Creator: Rachel Barenblat
- Catalog PDF record: <https://velveteenrabbi.blogs.com/files/vrhaggadah-3.pdf>
- Current-edition page reviewed: <https://velveteenrabbi.com/2025/04/04/new-edition-of-the-vr-haggadah/>
- Reuse basis: creator explicitly permits readers to use, modify, and borrow with appropriate credit when shared freely and not sold.
- Acquisition: **Acquired and verified.** Local edition is Version 9, 84 pages; see file-verification ledger. The catalog URL points to an older edition, so locators must name v9 explicitly.
- Cohesion profile: warm, poetic, accessible, contemplative; progressive Jewish spiritual framing; adults and mixed-age groups; peace- and liberation-oriented without requiring partisan claims; best fits `mindfulness`, `family-storytelling`, and `interfaith`.
- Editorial role: excellent narrative/explanatory secondary voice and possible reverent spine; use its exact prose with credit instead of imitating its style.

### 8. `nusach-eretz-yisrael` — Pesaḥ Haggadah (Nusaḥ Erets Yisrael)

- Creator: Isaac Gantwerk Mayer
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/pesah-haggadah-nusah-erets-yisrael-based-on-multiple-cairo-geniza-manuscripts-compiled-and-translated-by-isaac-gantwerk-mayer/>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Full catalog-page text/source data reported available, but no local snapshot was acquired.** No verified PDF URL was established; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: scholarly, reconstructed liturgical voice; historical Palestinian Jewish rite; specialist/adult audience; historical rather than modern-national political framing; best fit `traditional`.
- Editorial role: historical variant or sidebar, not a beginner default spine without extensive orientation.

### 9. `seder-in-the-streets` — Seder in the Streets Passover Haggadah

- Creators: Danielle Gershkoff, Rachel Lerman, Rachel Beck, and Margot Seigle
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/seder-in-the-streets-haggadah-compiled-by-danielle-gershkoff-rachel-lerman-rachel-beck-and-margot-seigle/>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Full catalog-page text/source data reported available, but no local snapshot was acquired.** No verified PDF URL was established; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: participatory, public-facing, activist; justice-centered pluralistic Jewish framing; community/adult audience; protest and public-action framing; best fit `social-justice`.
- Editorial role: participatory prompts and justice inserts; pair with a clear home-seder procedural spine.

### 10. `tropified-haggadah` — The Passover Seder Haggadah, Tropified

- Creator: Isaac Gantwerk Mayer
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-passover-seder-haggadah-tropified-by-isaac-gantwerk-mayer/>
- Acquired PDF source: <https://archive.org/download/ThePassoverSederHaggadahTropifiedIsaacGantwerkMayer2019/The%20Passover%20Seder%20Haggadah%20Tropified%20%28Isaac%20Gantwerk%20Mayer%202019%29.pdf>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Acquired and verified.** Local PDF is 37 pages; see file-verification ledger.
- Cohesion profile: liturgically precise and chant-oriented; traditional Jewish theology; readers comfortable with Hebrew/liturgy or facilitators seeking cantillation; nonpartisan/traditional framing; best fit `traditional`.
- Editorial role: authoritative liturgical wording and transliteration/cantillation reference; not by itself a plain-language beginner spine.

### 11. `feinstein-haggadah` — Haggadah for the Passover Seder

- Creators: Eve Levavi Feinstein and Efraim Feinstein
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-an-english-translation/>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: translation-forward, clear, text-centered; broadly traditional/pluralistic Jewish framing; adult/mixed audience; nonpartisan; best fit `traditional` and `interfaith`.
- Editorial role: candidate English-language textual spine after full review.

### 12. `socialist-hagode` — Hagode shel Peysekh: in a Socialist Mode

- Creators: Benjamin Feigenbaum, Leon Zolotkof, and Shlomo Enkin Lewis
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/hagode-shel-peysekh-in-a-socialist-mode-1887-1919-trans-shlomo-enkin-lewis-2025/>
- Reuse basis: 2025 bilingual edition cataloged as CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: historical, Yiddish/socialist, movement-oriented; secular Jewish labor framing; adult/history-oriented audience; explicit socialist political framing; best fits `secular` and `social-justice`.
- Editorial role: historically grounded thematic insert bank, not a neutral default spine.

### 13. `mlk-freedom-seder` — MLK +50 Labor-Justice Interfaith Freedom Seder

- Creator: Arthur Waskow and The Shalom Center
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/mlk-plus-50-labor-justice-interfaith-freedom-seder-by-arthur-waskow-and-the-shalom-center/>
- Direct PDF identified: <https://opensiddur.org/wp-content/uploads/2018/03/MLK50-Interfaith-Freedom-Seder-The-Shalom-Center-2018.pdf>
- Reuse basis: source's unattributed passages are cataloged as CC BY 4.0; preserve printed credits for embedded material and the publisher's request to notify/support The Shalom Center.
- Acquisition: **Known direct file, not acquired.** Network acquisition was stopped before this file was saved.
- Cohesion profile: oratorical, interfaith, labor-justice focused; prophetic Jewish/civil-rights framing; adult/community audience; explicit racial and economic justice politics; best fits `social-justice` and `interfaith`.
- Editorial role: coherent justice insert sequence for Maggid/Hallel; avoid using isolated slogans outside their historical setup.

### 14. `second-seder-plate` — A Second Passover Seder Plate with Seven Additions

- Creator: Isaac Gantwerk Mayer
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/second-passover-seder-plate-with-seven-additions-by-isaac-gantwerk-mayer/>
- Reuse basis: CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: modular, symbolic, explanatory; pluralistic ritual innovation; mixed-age/community audience; issue-specific symbolism varies by addition; best fits `feminist`, `lgbtq`, `environment`, and `social-justice`.
- Editorial role: source for opt-in seder-plate personalization only; each added object needs its complete explanation and context.

### 15. `mayer-ashkenaz` — Haggadah for Pesaḥ — Nusaḥ Ashkenaz with Additions

- Creator: Isaac Gantwerk Mayer
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-nusah-ashkenaz-with-unique-additions-from-across-the-jewish-world-by-isaac-gantwerk-mayer-2025/>
- Reuse basis: CC BY-SA 4.0; retain printed provenance for additions.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: comprehensive, liturgical, comparative; traditional Ashkenazi base with plural additions; adult/family audience; generally traditional/nonpartisan with varied insert framing; best fit `traditional`.
- Editorial role: candidate long-form traditional spine and comparative source; too dense for the 20-minute beginner version without selection.

### 16. `english-jews-seder` — The Ritual of the Seder and the Agada of the English Jews Before the Expulsion

- Creator: Dávid Kaufmann; transcription by Aharon N. Varady
- Primary record: <https://opensiddur.org/miscellanea/traditions/ritual-of-the-seder-and-the-agada-of-the-english-jews-before-the-expulsion/>
- Reuse basis: public-domain 1892 study and medieval source; Open Siddur transcription cataloged under CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: academic/historical; medieval English Jewish liturgical history; specialist adult audience; historical rather than contemporary political framing; best fit `traditional` and `interfaith` as historical context.
- Editorial role: historical sidebar and provenance reference, not a primary beginner voice.

### 17. `rittangel-latin` — Liber Rituum Paschalium

- Creator: Johann Stephan Rittangel; transcription by Aharon N. Varady
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/liber-rituum-paschalium-by-johann-stephan-rittangel-1644/>
- Reuse basis: public-domain 1644 work; Open Siddur transcription cataloged under CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: antiquarian, multilingual/Latin scholarly voice; early-modern documentation of Jewish ritual; specialist/research audience; historical Christian/Jewish interface rather than modern politics; best fit `traditional` or `interfaith` historical context.
- Editorial role: research reference or carefully explained historical insert; not suitable as a modern primary spine.

### 18. `levy-home-service` — Haggadah or Home Service for the Festival of Passover

- Creator: J. Leonard Levy
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/haggadah-or-home-service-for-the-festival-of-passover-by-j-leonard-levy/>
- Reuse basis: public-domain editions (1896–1922); Open Siddur page cataloged under CC BY-SA 4.0.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: formal English home-service voice; historical Reform theology; family/home audience; civic/universalist but not contemporary-partisan framing; best fits `traditional`, `secular`, and `interfaith` depending on passage.
- Editorial role: possible historical plain-English spine after checking dated assumptions and vocabulary.

### 19. `barros-basto` — Hagadah shel Pessah

- Creator: Artur Carlos de Barros Basto
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/hagadah-shel-pessah-compiled-by-artur-carlos-de-barros-basto-1928/>
- Reuse basis: cataloged as CC0/public domain; credit creator and digitization where practical.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: historical Portuguese Jewish liturgy; traditional theology; adult/family readers with language support; nonpartisan/historical framing; best fit `traditional` and cultural family storytelling.
- Editorial role: cultural/historical variant and translation reference; not a default English spine.

### 20. `battlestar-seder` — The First Battlestar Galactica Seder Haggadah

- Creators: David Lieberman, Alison Ogden, Mary Bruch, and Aharon N. Varady
- Primary record: <https://opensiddur.org/compilations/table-guides-and-haggadot/passover-seder/the-first-battlestar-galactica-passover-seder-haggadah-2008/>
- Reuse basis: Open Siddur edition cataloged as CC BY-SA 4.0 and derived from a GNU Free Documentation License work; preserve source-presented credits for embedded material.
- Acquisition: **Catalog page only; not acquired.** No direct downloadable asset was verified in this pass; automated Open Siddur discovery was impeded by Cloudflare.
- Cohesion profile: playful, referential, fandom-driven; secular/cultural reinterpretation; adult fans and niche groups; allegorical rather than contemporary-partisan framing; best fit `secular` and `playful`.
- Editorial role: opt-in novelty inserts only. It should never leak into a general-audience or reverent Haggadah merely because a keyword matches.

## Recommended cohesion families

These are editorial starting points, not automatic generation rules. A generated Haggadah should normally choose **one primary spine** and at most one or two compatible insert families.

| Experience | Primary spine candidate | Compatible secondary source(s) | Avoid without explicit opt-in |
|---|---|---|---|
| Beginner, balanced, broadly Jewish | Shir Ge'ulah | Velveteen Rabbi; Feinstein after acquisition | Battlestar; specialist historical texts |
| Reverent and reflective | Velveteen Rabbi | Inner Seder; Shir Ge'ulah procedures | Seder in the Streets slogans; fandom material |
| Traditional and liturgically precise | Mayer Ashkenaz or Feinstein after acquisition | Tropified for chant/liturgical wording; Birnbaum after review | Modern activist inserts unless chosen by theme |
| Feminist/family storytelling | Wandering Is Over after acquisition | Shir Ge'ulah procedures; Velveteen Rabbi transitions | Uncontextualized historical polemic |
| Environmental | Freedom Seder for the Earth after acquisition | Inner Seder reflections; Shir Ge'ulah procedures | Generic nature quotations unrelated to the ritual moment |
| Social justice/human rights | Shir Ge'ulah as procedural spine | Other Side of the Sea, MLK +50, or Seder in the Streets as one coherent insert family | Mixing multiple activist sources into a slogan collage |
| Secular/labor history | Socialist Hagode after acquisition | Levy or a concise procedural spine after review | Mystical language unless independently selected |
| Historical exploration | One historical source as the subject | English Jews, Rittangel, Levy, Barros Basto, or Nusaḥ Erets Yisrael | Treating historical wording as contemporary beginner guidance |
| Playful/fandom | A complete standard procedural spine | Battlestar only when specifically chosen | Using fandom references in reverent or general outputs |

## Remaining acquisition work

1. Acquire and file-verify the five known direct PDFs: Wandering Is Over, Inner Seder, Other Side of the Sea, Freedom Seder for the Earth, and MLK +50.
2. Save versioned HTML/XML/source-data snapshots for Nusaḥ Erets Yisrael and Seder in the Streets if Open Siddur provides no PDF.
3. Resolve a direct downloadable asset or a versioned source-data snapshot for the remaining twelve catalog-page-only records. Record a real blocker instead of treating a webpage listing as a local corpus.
4. Extract searchable text from every acquired edition while keeping the original file. Record extraction tooling and hashes separately.
5. Before any runtime rewrite, audit each proposed passage against the actual acquired edition and populate passage-level provenance. Catalog metadata alone is not evidence that generated prose came from a source.
