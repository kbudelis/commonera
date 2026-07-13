"use client";

import { useState } from "react";

export default function AskForm() {
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState("");

  if (submitted) {
    return (
      <div className="bg-surface border border-line rounded-[20px] p-7 text-center">
        <p className="font-display text-xl font-bold text-text mb-2">Got it.</p>
        <p className="text-text-muted leading-relaxed max-w-md mx-auto text-[15px]">
          Live Q&amp;A is coming soon — this prototype doesn&apos;t store
          questions yet, but yours is exactly the kind we&apos;ll be
          answering for real: a non-denominational answer, sent back to you.
        </p>
      </div>
    );
  }

  return (
    <form
      className="bg-surface border border-line rounded-[20px] p-7"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="font-display text-xl font-bold text-text mb-2">Didn&apos;t see your question?</div>
      <p className="text-[15px] text-text-muted mb-5 leading-[1.5]">
        Send it in. Live Q&amp;A is coming soon, and yours might be one of
        the first we answer. (Nothing here is saved yet — but don&apos;t
        let that stop you.)
      </p>
      <textarea
        required
        rows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What do you want to know?"
        className="w-full min-h-[90px] bg-bg border border-line-strong rounded-xl p-3.5 text-text placeholder:text-text-faint text-[15px] mb-3.5 resize-y focus-ring outline-none"
      />
      <div className="flex gap-2.5 flex-wrap">
        <input
          type="email"
          placeholder="Email (optional)"
          className="flex-1 min-w-[200px] bg-bg border border-line-strong rounded-full px-[18px] py-3 text-text placeholder:text-text-faint text-sm focus-ring outline-none"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          className="bg-indigo hover:bg-indigo-hover text-ink font-display font-bold text-sm px-[22px] py-3 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap focus-ring"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
