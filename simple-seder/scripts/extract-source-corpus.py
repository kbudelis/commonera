#!/usr/bin/env python3
"""Create searchable, page-marked local extracts for the source corpus.

The source PDFs/snapshots and generated extracts are intentionally gitignored.
The tracked research/source-runtime-index.json stores hashes and passage-level
provenance, not bulk copyrighted or license-conditioned source files.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent.parent
MATERIALS = ROOT / "research" / "source-materials"
SNAPSHOTS = MATERIALS / "official-json"
EXTRACTS = ROOT / "research" / "source-extracts"
AUDITED_TRANSCRIPTIONS = ROOT / "research" / "audited-source-transcriptions.json"


@dataclass(frozen=True)
class Source:
    source_id: str
    pdf: str | None = None
    snapshot: bool = True
    ocr_xml: str | None = None
    ocr_start: int = 0


SOURCES = (
    Source("traditional-core", "Paltiel Birnbaum Haggadah 1953.pdf", True, "Paltiel Birnbaum Haggadah 1953 OCR.xml"),
    Source("wandering-is-over", "Wandering Is Over Including Womens Voices 2011.pdf"),
    Source("inner-seder", "Haggadah of the Inner Seder 2026.pdf"),
    Source("other-side-of-sea", "Truah Human Rights Haggadah 2020.pdf"),
    Source("freedom-seder-earth", "Freedom Seder for the Earth 2009.pdf"),
    Source("shir-geulah", "Haggadah Shir Geulah v2.1.pdf"),
    Source("velveteen-rabbi", "Velveteen Rabbi Haggadah v9.pdf", False),
    Source("nusach-eretz-yisrael"),
    Source("seder-in-the-streets"),
    Source("tropified-haggadah", "Passover Seder Haggadah Tropified.pdf"),
    Source("feinstein-haggadah", "Feinstein Haggadat Mah Zot 2009.pdf"),
    Source("socialist-hagode", "Socialist Hagode 2025.pdf"),
    Source("mlk-freedom-seder", "MLK50 Interfaith Freedom Seder 2018.pdf"),
    Source("second-seder-plate", "Second Seder Plate 2019.pdf"),
    Source("mayer-ashkenaz", "Mayer Ashkenaz Haggadah 2026.pdf"),
    Source("english-jews-seder"),
    Source("rittangel-latin", "Rittangel Liber Rituum Paschalium 1644.pdf", True, "Rittangel Liber Rituum Paschalium 1644 OCR.xml", 365),
    Source("levy-home-service", "Levy Home Service 1896.pdf"),
    Source("barros-basto", "Barros Basto Hagadah 1928.pdf", True, "Barros Basto Hagadah 1928 OCR.xml"),
    Source("battlestar-seder"),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized(text: str) -> str:
    text = text.replace("\x00", "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf(pdf_path: Path) -> tuple[list[str], int]:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        try:
            pages.append(normalized(page.extract_text() or ""))
        except Exception as error:  # preserve page position even if one page is malformed
            pages.append(f"[text extraction error: {error}]")
    return pages, len(reader.pages)


def extract_djvu_xml(xml_path: Path, start: int, count: int) -> list[str]:
    root = ET.parse(xml_path).getroot()
    objects = root.findall(".//OBJECT")
    selected = objects[start : start + count]
    pages = []
    for page in selected:
        lines = []
        for line in page.findall(".//LINE"):
            words = [html.unescape(word.text or "") for word in line.findall(".//WORD")]
            value = " ".join(word for word in words if word).strip()
            if value:
                lines.append(value)
        pages.append(normalized("\n".join(lines)))
    if len(pages) != count:
        raise ValueError(f"OCR page range yielded {len(pages)} pages; expected {count}")
    return pages


class SourceHTMLParser(HTMLParser):
    block_tags = {
        "address", "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt",
        "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6",
        "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table",
        "td", "th", "tr", "ul",
    }
    skip_tags = {"script", "style", "svg", "noscript"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in self.skip_tags:
            self.skip_depth += 1
        elif not self.skip_depth and tag in self.block_tags:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.skip_tags and self.skip_depth:
            self.skip_depth -= 1
        elif not self.skip_depth and tag in self.block_tags:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.parts.append(data)


def extract_snapshot(snapshot_path: Path) -> tuple[str, dict]:
    payload = json.loads(snapshot_path.read_text(encoding="utf-8"))
    parser = SourceHTMLParser()
    parser.feed(payload["content"])
    return normalized("".join(parser.parts)), payload


def extract_odt(odt_path: Path) -> str:
    """Extract logical paragraph text from an ODT without depending on LibreOffice."""
    with zipfile.ZipFile(odt_path) as archive:
        root = ET.fromstring(archive.read("content.xml"))
    paragraphs: list[str] = []
    for element in root.iter():
        if element.tag.endswith("}p") or element.tag.endswith("}h"):
            value = normalized("".join(element.itertext()))
            if value:
                paragraphs.append(value)
    return normalized("\n".join(paragraphs))


def render_pages(pages: list[str]) -> str:
    return "\n\n".join(
        f"===== PDF PAGE {number} =====\n{text or '[no searchable text on this page]'}"
        for number, text in enumerate(pages, 1)
    )


def process(source: Source) -> dict:
    pdf_path = MATERIALS / source.pdf if source.pdf else None
    snapshot_path = SNAPSHOTS / f"{source.source_id}.opensiddur.json"
    snapshot_text = ""
    snapshot_payload = None
    snapshot_hash = None
    if source.snapshot:
        if not snapshot_path.exists():
            raise FileNotFoundError(snapshot_path)
        snapshot_text, snapshot_payload = extract_snapshot(snapshot_path)
        snapshot_hash = sha256(snapshot_path)

    page_count = None
    pdf_hash = None
    extraction_mode = "official-opensiddur-snapshot"
    body = snapshot_text
    original_filename = snapshot_path.name
    if pdf_path:
        if not pdf_path.exists():
            raise FileNotFoundError(pdf_path)
        pages, page_count = extract_pdf(pdf_path)
        searchable_chars = sum(len(page) for page in pages)
        extraction_mode = "pdf-text-layer"
        if searchable_chars < 500:
            if not source.ocr_xml:
                raise ValueError(f"{source.source_id} has no text layer and no OCR sidecar")
            pages = extract_djvu_xml(MATERIALS / source.ocr_xml, source.ocr_start, page_count)
            extraction_mode = "internet-archive-djvu-ocr"
        body = render_pages(pages)
        original_filename = pdf_path.name
        pdf_hash = sha256(pdf_path)

    supplemental_files: list[dict[str, str]] = []
    if source.source_id == "tropified-haggadah":
        odt_path = MATERIALS / "Passover Seder Haggadah Tropified.odt"
        if not odt_path.exists():
            raise FileNotFoundError(odt_path)
        body = normalized(
            body
            + "\n\n===== AUTHORITATIVE ODT TEXT =====\n"
            + extract_odt(odt_path)
        )
        extraction_mode += "+authoritative-odt"
        supplemental_files.append({"file": odt_path.name, "sha256": sha256(odt_path)})

    if source.source_id == "rittangel-latin":
        dayenu_path = SNAPSHOTS / "rittangel-latin-dayenu.opensiddur.json"
        if not dayenu_path.exists():
            raise FileNotFoundError(dayenu_path)
        dayenu_text, dayenu_payload = extract_snapshot(dayenu_path)
        body = normalized(
            body
            + "\n\n===== OFFICIAL OPEN SIDDUR DAYENU TRANSCRIPTION =====\n"
            + dayenu_text
        )
        extraction_mode += "+official-dayenu-transcription"
        supplemental_files.append(
            {
                "file": dayenu_path.name,
                "sha256": sha256(dayenu_path),
                "postId": str(dayenu_payload["post_id"]),
            }
        )

    if AUDITED_TRANSCRIPTIONS.exists():
        audited = json.loads(AUDITED_TRANSCRIPTIONS.read_text(encoding="utf-8"))
        source_audits = [item for item in audited if item["sourceId"] == source.source_id]
        if source_audits:
            body = normalized(
                body
                + "\n\n===== VISUALLY AUDITED TRANSCRIPTIONS =====\n"
                + "\n".join(
                    f"[{item['sourceLocation']}]\n{item['text']}" for item in source_audits
                )
            )
            extraction_mode += "+audited-transcription"
            supplemental_files.append(
                {
                    "file": str(AUDITED_TRANSCRIPTIONS.relative_to(ROOT)),
                    "sha256": sha256(AUDITED_TRANSCRIPTIONS),
                }
            )

    header = [
        f"SOURCE ID: {source.source_id}",
        f"PRIMARY LOCAL FILE: {original_filename}",
        f"EXTRACTION MODE: {extraction_mode}",
    ]
    if page_count is not None:
        header.append(f"PDF PAGE COUNT: {page_count}")
    if snapshot_payload:
        header.extend(
            [
                f"OFFICIAL SNAPSHOT POST ID: {snapshot_payload['post_id']}",
                f"OFFICIAL SNAPSHOT TITLE: {html.unescape(snapshot_payload['title'])}",
                f"OFFICIAL SNAPSHOT URL: {snapshot_payload.get('source_link') or snapshot_payload.get('permalink')}",
            ]
        )
    output = normalized("\n".join(header) + "\n\n" + body) + "\n"
    extract_path = EXTRACTS / f"{source.source_id}.txt"
    extract_path.write_text(output, encoding="utf-8")
    metadata = {
        "sourceId": source.source_id,
        "primaryLocalFile": original_filename,
        "extractionMode": extraction_mode,
        "pdfPageCount": page_count,
        "pdfSha256": pdf_hash,
        "officialSnapshotSha256": snapshot_hash,
        "extractSha256": sha256(extract_path),
        "extractCharacters": len(output),
        "supplementalFiles": supplemental_files,
    }
    (EXTRACTS / f"{source.source_id}.meta.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return metadata


def main() -> int:
    EXTRACTS.mkdir(parents=True, exist_ok=True)
    failures = []
    results = []
    for source in SOURCES:
        try:
            metadata = process(source)
            results.append(metadata)
            print(
                f"{source.source_id}: {metadata['extractionMode']}; "
                f"{metadata['pdfPageCount'] or 'text'}; {metadata['extractCharacters']} chars"
            )
        except Exception as error:
            failures.append((source.source_id, str(error)))
            print(f"{source.source_id}: ERROR {error}", file=sys.stderr)
    print(f"Extracted {len(results)}/{len(SOURCES)} sources.")
    if failures:
        print("Failures: " + "; ".join(f"{source}: {error}" for source, error in failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
