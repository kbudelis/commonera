/* eslint-disable @next/next/no-img-element -- local cover thumbnails require user-selectable CSS filters */
"use client";

import { type ChangeEvent, type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { coverOptions, quoteCatalog, sourceCatalog, themeDescriptions, themeLabels } from "@/content/pack";
import { generateHaggadah, mergeModelEnhancement, type ModelEnhancement } from "@/lib/generator";
import { defaultProfile, type GenerationProfile, type HaggadahDocument, type HaggadahSection, type PlateAddition, type ThemeId } from "@/lib/types";

type ResultTab = "haggadah" | "guide" | "invitation";
const resultTabs: ResultTab[] = ["haggadah", "guide", "invitation"];
const intakeStepLabels = ["The table", "The feeling", "Finishing touches"] as const;
const themeIds = Object.keys(themeLabels) as ThemeId[];
const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";
const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${publicBasePath}${path}`;

function formatSederDate(value: string) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Passover 2026";
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read cover artwork."));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read cover artwork."));
    reader.readAsDataURL(blob);
  });
}

function preferredScrollBehavior(): ScrollBehavior {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function AutoTextarea({ value, onChange, className, ariaLabel, minRows = 2 }: { value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void; className?: string; ariaLabel: string; minRows?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    resize();
    const parent = textarea.parentElement;
    let observedWidth = parent?.clientWidth ?? 0;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === observedWidth) return;
      observedWidth = entry.contentRect.width;
      resize();
    });
    if (parent) observer.observe(parent);
    return () => observer.disconnect();
  }, [value]);

  return <textarea ref={textareaRef} className={className} value={value} rows={minRows} onChange={onChange} aria-label={ariaLabel}/>;
}

const choices = {
  length: [[20, "20 min", "Simple & swift"], [45, "45 min", "The sweet spot"], [90, "90 min", "Full & spacious"]] as const,
  audience: [["adults", "Mostly adults"], ["kids", "Kid-centered"], ["mixed", "All ages"]] as const,
  interaction: [["reflective", "Reflective"], ["balanced", "A little of both"], ["participatory", "Participatory"]] as const,
  tone: [["playful", "Playful"], ["balanced", "Warm & grounded"], ["reverent", "Reverent"]] as const,
  language: [["english", "English only"], ["transliteration", "English + transliteration"]] as const,
  typography: [["classic", "Classic serif"], ["modern", "Modern sans"], ["readable", "Extra readable"]] as const,
};
const intakePreviewCover = coverOptions.find((cover) => cover.id === "modernist-1") ?? coverOptions[0];

function FieldChoice<T extends string | number>({ name, value, options, onChange }: { name: string; value: T; options: readonly (readonly [T, string, string?])[]; onChange: (value: T) => void }) {
  return <div className="choice-grid">{options.map(([id, label, note]) => <label className={`choice ${value === id ? "selected" : ""}`} key={id}><input type="radio" name={name} checked={value === id} onChange={() => onChange(id)} /><span>{label}</span>{note && <small>{note}</small>}</label>)}</div>;
}

function Cover({ document, coverId, customCoverUrl = "", compact = false }: { document: HaggadahDocument; coverId: string; customCoverUrl?: string; compact?: boolean }) {
  const cover = coverOptions.find((item) => item.id === coverId) ?? coverOptions[0];
  const date = formatSederDate(document.profile.sederDate);
  return <div className={`cover ${compact ? "compact" : ""} ${customCoverUrl ? "custom-cover" : cover.ink}`}><img className="cover-bg" src={customCoverUrl || assetPath(cover.image)} alt="" style={customCoverUrl ? undefined : { filter: cover.filter, objectPosition: cover.position }}/><span className="cover-shade"/>
    <div className="cover-kicker">A Haggadah for this table</div>
    <div className="cover-center"><span className="cover-hebrew">פֶּסַח</span><h2>{document.title}</h2><p>{document.profile.coverQuote || "We tell the story so freedom can become practice."}</p></div>
    <div className="cover-bottom"><span>{document.profile.hostName || "Made for your table"} · {date}</span><strong>LetMyPeopleHost.com</strong></div>
  </div>;
}

export default function Home() {
  const [profile, setProfile] = useState<GenerationProfile>({ ...defaultProfile });
  const [document, setDocument] = useState<HaggadahDocument | null>(null);
  const [history, setHistory] = useState<HaggadahDocument[]>([]);
  const [tab, setTab] = useState<ResultTab>("haggadah");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [intakeStep, setIntakeStep] = useState(1);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [customCoverName, setCustomCoverName] = useState("");
  const builderRef = useRef<HTMLElement>(null);
  const intakeStepRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const setProfileKey = <K extends keyof GenerationProfile>(key: K, value: GenerationProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const toggleTheme = (theme: ThemeId) => setProfile((current) => ({ ...current, themes: current.themes.includes(theme) ? current.themes.filter((id) => id !== theme) : current.themes.length < 3 ? [...current.themes, theme] : current.themes }));
  const togglePlateAddition = (addition: PlateAddition) => setProfile((current) => ({ ...current, sederPlateAdditions: current.sederPlateAdditions.includes(addition) ? current.sederPlateAdditions.filter((id) => id !== addition) : [...current.sederPlateAdditions, addition] }));
  function goToIntakeStep(step: number) {
    setIntakeStep(step);
    requestAnimationFrame(() => {
      intakeStepRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
      intakeStepRef.current?.focus({ preventScroll: true });
    });
  }

  function scrollToBuilder() {
    builderRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    requestAnimationFrame(() => intakeStepRef.current?.focus({ preventScroll: true }));
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTab: ResultTab) {
    const currentIndex = resultTabs.indexOf(currentTab);
    const nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % resultTabs.length
      : event.key === "ArrowLeft" ? (currentIndex - 1 + resultTabs.length) % resultTabs.length
        : event.key === "Home" ? 0
          : event.key === "End" ? resultTabs.length - 1
            : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const nextTab = resultTabs[nextIndex];
    setTab(nextTab);
    requestAnimationFrame(() => globalThis.document.getElementById(`tab-${nextTab}`)?.focus());
  }

  function uploadCover(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("Please choose an image file for your cover."); return; }
    if (file.size > 12 * 1024 * 1024) { setStatus("Please choose a cover image smaller than 12 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { setCustomCoverUrl(reader.result); setCustomCoverName(file.name); setStatus("Your cover image is ready."); } };
    reader.onerror = () => setStatus("We couldn’t read that image. Please try another file.");
    reader.readAsDataURL(file);
  }

  async function build() {
    setBusy(true); setStatus("Assembling your Haggadah…");
    let next = generateHaggadah(profile);
    const baseDraft = next;
    setDocument(next); setHistory([]); setStatus("Your complete draft is ready. Checking the best approved matches…");
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    });
    try {
      if (isStaticDemo) throw new Error("Static demo uses the deterministic draft.");
      const response = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, candidateSectionIds: next.sections.map((s) => s.id), quoteIds: quoteCatalog.map((q) => q.id), coverIds: coverOptions.map((c) => c.id) }) });
      if (response.ok) {
        const data = await response.json() as { enhancement?: ModelEnhancement };
        const enhanced = mergeModelEnhancement(next, data.enhancement ?? {});
        setDocument((current) => current === baseDraft ? enhanced : current);
        next = enhanced;
      }
    } catch { /* deterministic document is the intentional offline fallback */ }
    setBusy(false); setStatus("Your Haggadah is ready.");
  }

  function changeDocument(updater: (current: HaggadahDocument) => HaggadahDocument) {
    setDocument((current) => { if (!current) return current; setHistory((items) => [...items.slice(-19), current]); return updater(current); });
  }
  function updateSection(id: string, patch: Partial<HaggadahSection>) { changeDocument((current) => ({ ...current, sections: current.sections.map((section) => section.id === id ? { ...section, ...patch } : section) })); }
  function undo() { const previous = history.at(-1); if (!previous) return; setDocument(previous); setHistory((items) => items.slice(0, -1)); setStatus("Last edit undone."); }
  async function save() {
    if (!document) return;
    if (isStaticDemo) { setStatus("This public demo keeps edits in this browser session. Download the PDF or copy the text before closing it."); return; }
    setBusy(true); setStatus("Saving…");
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: document }) });
      setStatus(response.ok ? "Saved to your projects." : "Couldn’t save—your edits are still here.");
    } catch {
      setStatus("Couldn’t save—your edits are still here.");
    } finally {
      setBusy(false);
    }
  }
  async function copyText() {
    if (!document) return;
    setBusy(true); setStatus("Copying your Haggadah…");
    try {
      const text = [document.title, ...document.sections.flatMap((s) => [`\n${s.transliteration ? `${s.transliteration} · ` : ""}${s.title}`, s.ritual, ...s.body, s.bridge ?? "", s.prompt ?? "", s.quote ? `“${s.quote.text}” — ${s.quote.author}, ${s.quote.work}` : ""])] .join("\n");
      await navigator.clipboard.writeText(text); setStatus("Haggadah copied.");
    } catch {
      setStatus("Couldn’t copy the Haggadah. Check clipboard permission and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copyInvitation() {
    if (!document) return;
    setBusy(true); setStatus("Copying your invitation…");
    try {
      await navigator.clipboard.writeText(document.invitation); setStatus("Invitation copied.");
    } catch {
      setStatus("Couldn’t copy the invitation. Check clipboard permission and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function downloadPdf() {
    if (!document) return; setBusy(true); setStatus("Composing your PDF…");
    try {
      const cover = coverOptions.find((item) => item.id === document.coverId) ?? coverOptions[0];
      const coverResponse = await fetch(customCoverUrl || assetPath(cover.image));
      if (!coverResponse.ok) throw new Error("Cover artwork was unavailable.");
      const coverDataUrl = await blobToDataUrl(await coverResponse.blob());
      const { GState, jsPDF } = await import("jspdf"); const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = 612, pageH = 792, margin = 58, contentW = pageW - margin * 2, bottom = pageH - 58;
      const coverProperties = pdf.getImageProperties(coverDataUrl); const coverScale = Math.max(pageW / coverProperties.width, pageH / coverProperties.height); const coverW = coverProperties.width * coverScale; const coverH = coverProperties.height * coverScale;
      const coverFormat = coverDataUrl.startsWith("data:image/jpeg") ? "JPEG" : coverDataUrl.startsWith("data:image/webp") ? "WEBP" : "PNG";
      pdf.addImage(coverDataUrl, coverFormat, (pageW - coverW) / 2, (pageH - coverH) / 2, coverW, coverH, undefined, "FAST");
      pdf.saveGraphicsState(); pdf.setGState(new GState({ opacity: cover.ink === "light" ? 0.48 : 0.34 })); pdf.setFillColor(41, 23, 15); pdf.rect(0, 0, pageW, pageH, "F"); pdf.restoreGraphicsState();
      pdf.saveGraphicsState(); pdf.setGState(new GState({ opacity: 0.88 })); pdf.setFillColor(255, 250, 243); pdf.roundedRect(54, 62, pageW - 108, pageH - 124, 10, 10, "F"); pdf.restoreGraphicsState();
      pdf.setTextColor(41, 23, 15); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setCharSpace(1.6); pdf.text("A HAGGADAH FOR THIS TABLE", pageW / 2, 106, { align: "center" }); pdf.setCharSpace(0);
      pdf.setDrawColor(28, 98, 189); pdf.setLineWidth(1); pdf.line(244, 128, 368, 128);
      pdf.setFont("times", "bold"); pdf.setFontSize(31); const title = pdf.splitTextToSize(document.title, 404); pdf.text(title, pageW / 2, 236, { align: "center" });
      pdf.setFont("times", "italic"); pdf.setFontSize(14); const coverQuote = pdf.splitTextToSize(document.profile.coverQuote || "We tell the story so freedom can become practice.", 354); pdf.text(coverQuote, pageW / 2, 390, { align: "center", lineHeightFactor: 1.35 });
      pdf.setDrawColor(41, 23, 15); pdf.setLineWidth(0.5); pdf.line(212, 588, 400, 588);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.text(document.profile.hostName || "Made for your table", pageW / 2, 620, { align: "center" }); pdf.text(formatSederDate(document.profile.sederDate), pageW / 2, 640, { align: "center" });
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("LetMyPeopleHost.com", pageW / 2, 699, { align: "center" });
      for (const section of document.sections) {
        let y = 66;
        const addContentPage = () => { pdf.addPage(); pdf.setTextColor(41, 23, 15); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text("LetMyPeopleHost.com", pageW - margin, pageH - 28, { align: "right" }); y = 64; };
        const ensureSpace = (height: number) => { if (y + height > bottom) addContentPage(); };
        addContentPage();
        pdf.setTextColor(28, 98, 189); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(`${section.order}  ·  ${section.ritual.toUpperCase()}  ·  ${section.minutes} MIN`, margin, y); y += 32;
        pdf.setTextColor(41, 23, 15); pdf.setFont("times", "bold"); pdf.setFontSize(24); const sectionTitle = pdf.splitTextToSize(`${section.transliteration ? `${section.transliteration} · ` : ""}${section.title}`, contentW); pdf.text(sectionTitle, margin, y); y += sectionTitle.length * 27 + 8;
        pdf.setFont("times", "normal"); pdf.setFontSize(11);
        for (const paragraph of section.body) { const lines = pdf.splitTextToSize(paragraph, contentW); ensureSpace(lines.length * 15 + 12); pdf.setTextColor(41, 23, 15); pdf.setFont("times", "normal"); pdf.setFontSize(11); pdf.text(lines, margin, y); y += lines.length * 15 + 12; }
        if (section.bridge) { const lines = pdf.splitTextToSize(section.bridge, contentW - 18); const height = lines.length * 15 + 16; ensureSpace(height); pdf.setDrawColor(28, 98, 189); pdf.setLineWidth(2); pdf.line(margin, y - 3, margin, y + height - 12); pdf.setTextColor(86, 83, 78); pdf.setFont("times", "italic"); pdf.text(lines, margin + 14, y); y += height; }
        if (section.prompt) { const lines = pdf.splitTextToSize(section.prompt, contentW - 28); const height = lines.length * 14 + 28; ensureSpace(height + 12); pdf.setFillColor(234, 242, 252); pdf.roundedRect(margin, y, contentW, height, 5, 5, "F"); pdf.setTextColor(41, 23, 15); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(lines, margin + 14, y + 20); y += height + 18; }
        if (section.quote) { const contextLines = section.quoteContext ? pdf.splitTextToSize(section.quoteContext, contentW - 36) : []; const quoteLines = pdf.splitTextToSize(`“${section.quote.text}”`, contentW - 36); const creditLines = pdf.splitTextToSize(`— ${section.quote.author}, ${section.quote.work}`, contentW - 36); const height = contextLines.length * 12 + quoteLines.length * 16 + creditLines.length * 12 + 40; ensureSpace(height); pdf.setDrawColor(216, 203, 189); pdf.setLineWidth(0.5); pdf.line(margin, y, pageW - margin, y); y += 18; if (contextLines.length) { pdf.setTextColor(109, 98, 90); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.text(contextLines, pageW / 2, y, { align: "center" }); y += contextLines.length * 12 + 8; } pdf.setTextColor(41, 23, 15); pdf.setFont("times", "italic"); pdf.setFontSize(11); pdf.text(quoteLines, pageW / 2, y, { align: "center" }); y += quoteLines.length * 16 + 8; pdf.setTextColor(109, 98, 90); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text(creditLines, pageW / 2, y, { align: "center" }); y += creditLines.length * 12; }
      }
      const usedSourceIds = new Set(document.sections.flatMap((section) => section.sourceIds));
      const usedSources = sourceCatalog
        .filter((source) => usedSourceIds.has(source.id))
        .map((source) => ({
          title: source.title,
          creator: source.creator,
          url: source.url,
          rights: source.rights,
        }));
      const usedQuotes = document.sections.flatMap((section) => section.quote ? [{ title: section.quote.work, creator: section.quote.author, url: section.quote.sourceUrl, rights: `${section.quote.rights}; quotation reproduced in its approved catalog form.` }] : []);
      const credits = [...usedSources, ...usedQuotes].filter((credit, index, all) => all.findIndex((candidate) => candidate.title === credit.title && candidate.creator === credit.creator && candidate.url === credit.url) === index);
      pdf.addPage();
      pdf.setTextColor(41, 23, 15); pdf.setFont("times", "bold"); pdf.setFontSize(19); pdf.text("Sources & credits", margin, 58);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(6); pdf.setTextColor(109, 98, 90); pdf.text("Sources used in this generated Haggadah. Rights notes describe the credited editions; follow each source’s terms for reuse.", margin, 75);
      const creditColumnWidth = (contentW - 22) / 2;
      const creditsPerColumn = Math.ceil(credits.length / 2);
      const creditY = [100, 100];
      credits.forEach((credit, index) => {
        const column = Math.floor(index / creditsPerColumn); const x = margin + column * (creditColumnWidth + 22);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.2); const titleLines = pdf.splitTextToSize(`${credit.title} — ${credit.creator}`, creditColumnWidth);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(5.2); const urlLines = pdf.splitTextToSize(credit.url, creditColumnWidth); const rightsLines = pdf.splitTextToSize(credit.rights, creditColumnWidth);
        pdf.setTextColor(41, 23, 15); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.2); pdf.text(titleLines, x, creditY[column], { lineHeightFactor: 1.05 });
        const urlY = creditY[column] + titleLines.length * 6.5 + 2;
        pdf.setTextColor(109, 98, 90); pdf.setFont("helvetica", "normal"); pdf.setFontSize(5.2); pdf.text(urlLines, x, urlY, { lineHeightFactor: 1.05 });
        const rightsY = urlY + urlLines.length * 5.5 + 2; pdf.text(rightsLines, x, rightsY, { lineHeightFactor: 1.05 });
        creditY[column] = rightsY + rightsLines.length * 5.5 + 8;
      });
      pdf.setFontSize(6); pdf.text("LetMyPeopleHost.com", pageW - margin, pageH - 28, { align: "right" });
      pdf.save(`${document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`); setStatus("PDF downloaded.");
    } catch {
      setStatus("Couldn’t compose the PDF. Your edits are still here—please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main>
    <nav className="topbar"><a className="brand" href="#top"><span>פ</span> Let My People Host</a><div><a href="#how">How it works</a><button className="nav-cta" onClick={scrollToBuilder}>Build yours</button></div></nav>
    <header className="hero" id="top"><div className="hero-copy"><p className="eyebrow">A Passover Haggadah that sounds like your table</p><h1>Tell the old story.<br/><em>Make it yours.</em></h1><p className="lede">Create a thoughtful, beautiful, ready-to-lead Passover Haggadah in minutes. No Hebrew, ritual experience, or seder confidence required.</p><button className="primary large" onClick={scrollToBuilder}>Start building <span>→</span></button><p className="micro">Free to make · Edit anything · Download & print</p></div><div className="hero-art"><div className="hero-frame"><img src={assetPath("/covers/papercut.webp")} alt="Example Passover Haggadah cover art with waves, flowering branches, and a path toward the horizon."/><div className="hero-cover-title" aria-hidden="true"><span>Let My People Host</span><strong>A Passover<br/>Haggadah</strong><small>Made for your table</small></div></div></div></header>
    <section className="how" id="how"><div className="how-head"><p className="eyebrow">Your seder, in three steps</p><h2>A guided path from blank page to a night everyone remembers.</h2></div><div className="steps"><div><b>01</b><h3>Tell us about your table</h3><p>Choose your people, timing, tone, and the themes that matter to you.</p></div><div><b>02</b><h3>We shape the story</h3><p>Ritual, prompts, readings, and transitions come together automatically.</p></div><div><b>03</b><h3>Make it completely yours</h3><p>Edit any line, choose a cover, then save, print, or share it.</p></div></div></section>
    <section className="builder" ref={builderRef}><div className="builder-head"><p className="eyebrow">Let’s make your Haggadah</p><h2>What kind of night are you planning?</h2><p>Three quick steps. There are no wrong answers—you can change everything later.</p></div>
      <div className="intake-shell">
      <div className="form-card">
        <nav className="intake-progress" aria-label="Builder progress">{intakeStepLabels.map((label, index) => <button key={label} type="button" className={intakeStep === index + 1 ? "active" : intakeStep > index + 1 ? "done" : ""} onClick={() => goToIntakeStep(index + 1)} aria-current={intakeStep === index + 1 ? "step" : undefined} aria-label={`Step ${index + 1}: ${label}`}><span aria-hidden="true">{intakeStep > index + 1 ? "✓" : index + 1}</span>{label}</button>)}</nav>
        <div className="intake-step" key={intakeStep} ref={intakeStepRef} tabIndex={-1} role="group" aria-labelledby={`intake-step-${intakeStep}-title`}>
        <h3 className="sr-only" id={`intake-step-${intakeStep}-title`}>Step {intakeStep}: {intakeStepLabels[intakeStep - 1]}</h3>
        {intakeStep === 1 && <><p className="step-intro">Start with the shape of the evening. Three quick choices give us enough to begin.</p><fieldset><legend>How long should the seder feel?</legend><FieldChoice name="length" value={profile.length} options={choices.length} onChange={(v) => setProfileKey("length", v)} /></fieldset><fieldset><legend>Who’s around the table?</legend><FieldChoice name="audience" value={profile.audience} options={choices.audience} onChange={(v) => setProfileKey("audience", v)} /></fieldset><fieldset><legend>What should run through the story? <small>Choose up to 3</small></legend><div className="themes">{themeIds.map((id) => <label key={id} className={profile.themes.includes(id) ? "selected" : ""}><input type="checkbox" checked={profile.themes.includes(id)} onChange={() => toggleTheme(id)} disabled={!profile.themes.includes(id) && profile.themes.length >= 3} aria-describedby="theme-limit-note"/><span>{themeLabels[id]}<small>{themeDescriptions[id]}</small></span></label>)}</div><p className="field-note" id="theme-limit-note" role="status" aria-live="polite">{profile.themes.length} of 3 selected{profile.themes.length === 3 ? ". Remove one to choose another." : "."}</p><label className="text-field"><span>Something more specific?</span><input value={profile.customTheme} maxLength={120} onChange={(e) => setProfileKey("customTheme", e.target.value)} placeholder="e.g. our family’s immigration story" /></label></fieldset></>}
        {intakeStep === 2 && <><p className="step-intro">Now tune the voice and pace. Every choice stays editable after generation.</p><div className="form-row"><fieldset><legend>Table energy</legend><FieldChoice name="interaction" value={profile.interaction} options={choices.interaction} onChange={(v) => setProfileKey("interaction", v)} /></fieldset><fieldset><legend>Tone</legend><FieldChoice name="tone" value={profile.tone} options={choices.tone} onChange={(v) => setProfileKey("tone", v)} /></fieldset></div><div className="form-row"><fieldset><legend>Language</legend><FieldChoice name="language" value={profile.language} options={choices.language} onChange={(v) => setProfileKey("language", v)} /></fieldset><fieldset><legend>Page style</legend><FieldChoice name="typography" value={profile.typography} options={choices.typography} onChange={(v) => setProfileKey("typography", v)} /></fieldset></div></>}
        {intakeStep === 3 && <><p className="step-intro">Personalize the cover and ritual details, or leave these blank and start with our defaults.</p><fieldset className="context"><legend>Add the finishing details</legend><div className="input-grid"><label>Host or family name<input value={profile.hostName} onChange={(e) => setProfileKey("hostName", e.target.value)} placeholder="The Cohen family" /></label><label>Seder date<input type="date" value={profile.sederDate} onChange={(e) => setProfileKey("sederDate", e.target.value)} /></label><label className="wide">Cover quote <small>(optional)</small><input value={profile.coverQuote} onChange={(e) => setProfileKey("coverQuote", e.target.value)} placeholder="A line you want guests to carry with them" /></label><label className="wide upload-field">Use your own cover image <small>(optional)</small><input type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="cover-upload-help" onChange={(event) => uploadCover(event.target.files?.[0])}/><span id="cover-upload-help">{customCoverName || "PNG, JPEG, or WebP · up to 12 MB"}</span></label></div>{customCoverUrl && <button type="button" className="remove-upload" onClick={() => { setCustomCoverUrl(""); setCustomCoverName(""); setStatus("Uploaded cover removed."); }}>Remove uploaded image</button>}<div className="plate-additions"><b>Optional seder plate additions</b><p>These are modern choices, not required traditional items.</p><div><label className={profile.sederPlateAdditions.includes("orange") ? "selected" : ""}><input type="checkbox" checked={profile.sederPlateAdditions.includes("orange")} onChange={() => togglePlateAddition("orange")}/><span>Orange<small>Full inclusion of LGBTQ+ Jews and others pushed to the margins.</small></span></label><label className={profile.sederPlateAdditions.includes("pomegranate") ? "selected" : ""}><input type="checkbox" checked={profile.sederPlateAdditions.includes("pomegranate")} onChange={() => togglePlateAddition("pomegranate")}/><span>Pomegranate<small>Many lives in one community, abundance, and shared responsibility.</small></span></label></div></div></fieldset></>}
        </div>
        {!document && status && <p className="form-status" role="status" aria-live="polite">{status}</p>}
        <div className="intake-nav">{intakeStep > 1 && <button type="button" className="back" onClick={() => goToIntakeStep(intakeStep - 1)}>← Back</button>}<span/>{intakeStep < 3 ? <button type="button" className="primary" onClick={() => goToIntakeStep(intakeStep + 1)}>Continue <span>→</span></button> : <button className="primary large" onClick={build} disabled={busy}>{busy ? "Building…" : "Build my Haggadah"} <span>→</span></button>}</div>
      </div>
      <aside className={`intake-preview editorial-preview ${customCoverUrl ? "custom-cover" : ""}`} aria-label="Live Haggadah cover sample"><img src={customCoverUrl || assetPath(intakePreviewCover.image)} alt=""/><span className="preview-shade"/><div className="preview-panel"><p className="preview-kicker">Live sample</p><h3>{profile.hostName ? `${profile.hostName}’s Haggadah` : "A Haggadah for your table"}</h3><p className="preview-quote-text">{profile.coverQuote || "We tell the story so freedom can become practice."}</p><p className="preview-meta"><span>{profile.length} minutes</span><span>{choices.audience.find(([id]) => id === profile.audience)?.[1]}</span></p><p className="preview-theme">{profile.themes.length ? `${themeLabels[profile.themes[0]]}${profile.themes.length > 1 ? ` + ${profile.themes.length - 1} more` : ""}` : "Warm, welcoming, and beginner-friendly"}</p><small>LetMyPeopleHost.com</small></div></aside>
      </div>
    </section>
    {document && <section className={`result type-${document.profile.typography}`} id="result" ref={resultRef} tabIndex={-1} aria-labelledby="result-title" aria-busy={busy}>
      <div className="result-head"><div><p className="eyebrow">Made for your table</p><h2 id="result-title">{document.title}</h2><p role="status" aria-live="polite">{status}</p></div><div className="actions"><button onClick={undo} disabled={!history.length}>↶ Undo</button><button onClick={build} disabled={busy}>Regenerate</button><button onClick={copyText} disabled={busy}>Copy</button><button onClick={() => window.print()}>Print</button>{!isStaticDemo && <button onClick={save} disabled={busy}>Save</button>}<button className="primary" onClick={downloadPdf} disabled={busy}>Download PDF</button></div></div>
      <div className="tabs" role="tablist" aria-label="Generated Haggadah views">{resultTabs.map((id) => <button id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={(event) => handleTabKeyDown(event, id)} key={id}>{id === "haggadah" ? "Haggadah" : id === "guide" ? "Host guide" : "Invitation"}</button>)}</div>
      {tab === "haggadah" && <div className="workspace" id="panel-haggadah" role="tabpanel" aria-labelledby="tab-haggadah" tabIndex={0}>
        <aside><h3>Choose a cover</h3><p>{customCoverUrl ? "Your uploaded image is active." : "Swipe or use the arrow keys to explore."}</p><div className="cover-gallery" role="group" aria-label="Cover artwork choices">{coverOptions.map((cover) => {
          const isActive = !customCoverUrl && cover.id === document.coverId;
          return <button className={isActive ? "active" : ""} onClick={() => { setCustomCoverUrl(""); setCustomCoverName(""); changeDocument((current) => ({ ...current, coverId: cover.id })); }} key={cover.id} aria-label={`Choose ${cover.name}`} aria-pressed={isActive} title={cover.name}><img src={assetPath(cover.image)} alt="" style={{ filter: cover.filter, objectPosition: cover.position }}/></button>;
        })}</div></aside>
        <article className="pages"><Cover document={document} coverId={document.coverId} customCoverUrl={customCoverUrl}/>{document.sections.map((section) => {
          const displayTitle = `${section.transliteration ? `${section.transliteration} · ` : ""}${section.title}`;
          return <section className="section-page" key={section.id}><div className="section-meta"><span>{section.order.toString().padStart(2,"0")}</span><b>{section.ritual}</b><i>{section.minutes} min</i></div><input className="section-title" value={displayTitle} onChange={(e) => { const value = e.target.value; const title = section.transliteration && value.includes(" · ") ? value.split(" · ").slice(1).join(" · ") : value; updateSection(section.id, { title }); }} aria-label={`${section.title} title`}/><h3 className="print-section-title">{displayTitle}</h3>{section.body.map((paragraph, index) => <div className="editable-paragraph" key={index}><AutoTextarea value={paragraph} onChange={(e) => updateSection(section.id, { body: section.body.map((p, i) => i === index ? e.target.value : p) })} ariaLabel={`${section.title} paragraph ${index + 1}`}/><p className="print-copy">{paragraph}</p></div>)}{section.bridge && <><AutoTextarea className="bridge" value={section.bridge} onChange={(e) => updateSection(section.id, { bridge: e.target.value })} ariaLabel={`${section.title} transition`}/><p className="print-copy print-bridge">{section.bridge}</p></>} {section.prompt && <div className="prompt"><b>AT THE TABLE</b><AutoTextarea value={section.prompt} onChange={(e) => updateSection(section.id, { prompt: e.target.value })} ariaLabel={`${section.title} table prompt`}/><p className="print-copy">{section.prompt}</p></div>}{section.quote && <blockquote>{section.quoteContext && <span className="quote-context">{section.quoteContext}</span>}“{section.quote.text}”<cite>— {section.quote.author}, <em>{section.quote.work}</em></cite></blockquote>}</section>;
        })}</article>
      </div>}
      {tab === "guide" && <div className="aux-page" id="panel-guide" role="tabpanel" aria-labelledby="tab-guide" tabIndex={0}><p className="eyebrow">A calm host is a good host</p><h2>Your host guide</h2><p className="intro">You do not have to perform expertise. Read ahead once, delegate freely, and let the table help make the night.</p><div className="guide-grid"><div><h3>Timing, ritual & hosting</h3><ul>{document.hostGuide.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Shopping & setup</h3><ul>{document.shoppingList.map((item) => <li key={item}>{item}</li>)}</ul></div></div><section aria-labelledby="plate-guide-title"><h3 id="plate-guide-title">The seder plate, element by element</h3><p>Place one of each item on a large plate or in small bowls. The plate is a teaching tool, so substitutions are welcome when you explain them.</p>{document.sederPlateGuide.map((entry) => <article key={entry.element}><h4>{entry.element}</h4><dl><dt>What it means</dt><dd>{entry.meaning}</dd><dt>Ingredients & substitutions</dt><dd>{entry.ingredients}</dd><dt>Simple preparation</dt><dd>{entry.preparation}</dd></dl></article>)}</section></div>}
      {tab === "invitation" && <div className="invite-wrap" id="panel-invitation" role="tabpanel" aria-labelledby="tab-invitation" tabIndex={0}><div className="invitation"><p className="eyebrow">You’re invited</p><span className="invite-mark">פֶּסַח</span><textarea value={document.invitation} rows={6} onChange={(e) => changeDocument((current) => ({ ...current, invitation: e.target.value }))} aria-label="Invitation text"/><p className="print-copy print-invitation-copy">{document.invitation}</p><b>LetMyPeopleHost.com</b></div><button className="primary" onClick={copyInvitation} disabled={busy}>Copy invitation</button></div>}
    </section>}
    <footer><a className="brand" href="#top"><span>פ</span> Let My People Host</a><p>An open, welcoming way into an ancient story.</p><b>LetMyPeopleHost.com</b></footer>
  </main>;
}
