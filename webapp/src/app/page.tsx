'use client';

import { useMemo, useState } from "react";
import { AddOnSelections, GeneratedPrompt, generatePrompt } from "@/lib/promptEngine";

const defaultAddOns: AddOnSelections = {
  voiceover: false,
  dialogue: false,
  thumbnailPrompt: true,
  captionsAndTags: true,
  musicNotes: false,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (copied) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          })
          .catch(() => setCopied(false));
      }}
      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [selections, setSelections] = useState<AddOnSelections>(defaultAddOns);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isInvalid = useMemo(() => !idea.trim(), [idea]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isInvalid) {
      setError("Give the generator a strong concept to transform.");
      return;
    }

    try {
      setIsGenerating(true);
      const next = generatePrompt(idea, selections);
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't craft that prompt. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggle = (key: keyof AddOnSelections) => {
    setSelections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-14 sm:px-10 lg:px-16">
        <header className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Cinematic Prompt Architect</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Transform any spark into a full text-to-video blueprint tailored for AI filmmakers.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Feed the engine a concept. Receive a tightly structured title, four-scene breakdown, and a master prompt that
            keeps visuals consistent end-to-end.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-200" htmlFor="core-idea">
                Concept to build
              </label>
              <textarea
                id="core-idea"
                placeholder="Example: A lone astronaut planting a garden on Mars to remember Earth."
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition hover:border-cyan-400/50 focus:border-cyan-300 focus:ring focus:ring-cyan-500/20"
                required
              />
              <p className="text-xs text-slate-400">
                Keep it under three sentences. Mention tone, stakes, or key motifs if you want them emphasized.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Optional add-ons</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["voiceover", "Voiceover narration script"],
                    ["dialogue", "Sample dialogue beat"],
                    ["thumbnailPrompt", "Poster / thumbnail visual prompt"],
                    ["captionsAndTags", "Caption copy & smart tags"],
                    ["musicNotes", "Music tone & sound direction"],
                  ] as Array<[keyof AddOnSelections, string]>
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                      checked={selections[key]}
                      onChange={() => handleToggle(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <button
              type="submit"
              disabled={isGenerating}
              className="flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:bg-cyan-200/60 sm:w-56"
            >
              {isGenerating ? "Crafting blueprint..." : "Generate prompt"}
            </button>
          </form>
        </section>

        {result ? (
          <div className="space-y-10">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Video Concept</p>
                  <h2 className="text-3xl font-semibold text-white">{result.conceptTitle}</h2>
                  <p className="text-base text-slate-300">{result.oneLiner}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-200">
                  <p>
                    <span className="font-semibold text-white">Mood:</span> {result.mood}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Style:</span> {result.style}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Scene Breakdown</h3>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Four-act flow</span>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {result.scenes.map((scene, index) => (
                  <article key={scene.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Scene {index + 1}</p>
                      <h4 className="mt-1 text-lg font-semibold text-white">{scene.title}</h4>
                    </div>
                    <dl className="space-y-2 text-sm text-slate-100">
                      <div className="rounded-2xl bg-black/30 p-3">
                        <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Setting</dt>
                        <dd className="mt-1 text-sm text-slate-100">{scene.setting}</dd>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-black/30 p-3">
                          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Camera angle</dt>
                          <dd className="mt-1">{scene.cameraAngle}</dd>
                        </div>
                        <div className="rounded-2xl bg-black/30 p-3">
                          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Movement</dt>
                          <dd className="mt-1">{scene.cameraMovement}</dd>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-black/30 p-3">
                        <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Character actions</dt>
                        <dd className="mt-1">{scene.characterActions}</dd>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-black/30 p-3">
                          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Lighting</dt>
                          <dd className="mt-1">{scene.lighting}</dd>
                        </div>
                        <div className="rounded-2xl bg-black/30 p-3">
                          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Colors</dt>
                          <dd className="mt-1">{scene.colors}</dd>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-black/30 p-3">
                        <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Atmosphere</dt>
                        <dd className="mt-1">{scene.atmosphere}</dd>
                      </div>
                      <div className="rounded-2xl bg-black/30 p-3">
                        <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Important objects</dt>
                        <dd className="mt-1">{scene.importantObjects}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">Full Text-to-Video Prompt</h3>
                  <p className="text-sm text-slate-300">Paste directly into your video model for consistent visuals.</p>
                </div>
                <CopyButton text={result.fullPrompt} />
              </div>
              <p className="text-base leading-relaxed text-slate-100">{result.fullPrompt}</p>
            </section>

            {Object.entries(result.addOns).length > 0 ? (
              <section className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Add-ons</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  {Object.entries(result.addOns).map(([key, value]) =>
                    value ? (
                      <article key={key} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            {key === "voiceover" && "Voiceover script"}
                            {key === "dialogue" && "Dialogue beat"}
                            {key === "thumbnailPrompt" && "Thumbnail / Poster prompt"}
                            {key === "captionsAndTags" && "Captions & tags"}
                            {key === "musicNotes" && "Music direction"}
                          </h4>
                          <CopyButton text={value} />
                        </div>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">{value}</p>
                      </article>
                    ) : null,
                  )}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <section className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-slate-300 sm:p-8">
            <h3 className="text-base font-semibold uppercase tracking-[0.35em] text-slate-200">Quick ideas to ignite</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "A forgotten lighthouse awakening during a midnight storm.",
                "Street dancers using projection art to hack city billboards.",
                "An elder painter restoring constellations inside a planetarium.",
                "Time travelers sending memories through origami cranes.",
              ].map((suggestion) => (
                <li
                  key={suggestion}
                  className="cursor-pointer rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-slate-200 transition hover:border-cyan-400/40 hover:bg-black/40"
                  onClick={() => setIdea(suggestion)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setIdea(suggestion);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
