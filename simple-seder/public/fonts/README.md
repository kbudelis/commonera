# PDF fonts

The client-side PDF exporter uses the unmodified Cardo family from the
official Google Fonts repository. Cardo covers Hebrew letters, niqqud, and all
cantillation marks used by the runtime source corpus, as well as the Latin and
Latin Extended characters used by the reader-facing Haggadah. Text is
canonically decomposed only at PDF-render time so Cardo can render the two
precomposed transliteration characters `ḇ` and `ḵ` without changing stored
source text.

- Upstream: https://github.com/google/fonts/tree/main/ofl/cardo
- Source project: https://github.com/googlefonts/CardoFont
- `Cardo-Regular.ttf` SHA-256: `bcb81f376f1c3892c7026dabf2beafbd1a7ee8ae95d132ee7d4ff7d7c3988261`
- `Cardo-Bold.ttf` SHA-256: `6c9383b1471936ee83b08b67bf79f0ed92bee3d5e8363ec3ba21309d5a272e36`
- `Cardo-Italic.ttf` SHA-256: `52c51cfde3a827dd9428511c4a968699952b8a917c5f0e97be782cbfa1880f9c`
- License: SIL Open Font License 1.1; see `Cardo-OFL.txt`.

The font files and license are stored locally so static and offline demos
generate the same PDF without a third-party font request.
