"use client";

import { useRef, useState } from "react";
import { fonts, themes } from "@/lib/themes";
import { permissionOptions } from "@/lib/templates";

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: unknown;
};

type Capture = {
  slug: string;
  name: string;
  themeId: string;
  fontId: string;
  showLogo: boolean;
  introHeadline: string;
  introBody: string;
  thankYouMessage: string;
  workspace: string;
  logoUrl: string | null;
  questions: Question[];
};

type CaptureClientProps = {
  capture: Capture;
};

function answersStorageKey(slug: string) {
  return `proove:${slug}`;
}

function stepStorageKey(slug: string) {
  return `proove:${slug}:step`;
}

function readSavedAnswers(slug: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(answersStorageKey(slug)) || "{}");
  } catch {
    return {};
  }
}

function readSavedStep(slug: string, questionCount: number) {
  if (typeof window === "undefined") return 0;
  const saved = Number.parseInt(
    localStorage.getItem(stepStorageKey(slug)) || "0",
    10,
  );
  if (!Number.isInteger(saved)) return 0;
  return Math.max(0, Math.min(saved, questionCount - 1));
}

function Completion({
  capture,
  theme,
}: {
  capture: Capture;
  theme: (typeof themes)[keyof typeof themes];
}) {
  return (
    <main
      style={{ background: theme.bg, color: theme.text }}
      className="flex min-h-screen items-center justify-center px-6"
    >
      <div className="fade-in max-w-md text-center">
        <div className="mx-auto mb-8 text-3xl">✓</div>
        <h1 className="text-4xl font-semibold tracking-[-.05em]">
          {capture.thankYouMessage}
        </h1>
        <p style={{ color: theme.secondary }} className="mt-5 leading-7">
          Your response has been shared with {capture.workspace}.
        </p>
        <p style={{ color: theme.secondary }} className="mt-16 text-xs">
          Collected with proove.now
        </p>
      </div>
    </main>
  );
}

function Intro({
  capture,
  theme,
  onStart,
}: {
  capture: Capture;
  theme: (typeof themes)[keyof typeof themes];
  onStart: () => void;
}) {
  return (
    <div className="fade-in my-auto max-w-xl">
      <p
        style={{ color: theme.accent }}
        className="text-sm tracking-[.16em] uppercase"
      >
        A quick question
      </p>
      <h1 className="mt-6 text-5xl leading-[1.03] font-semibold tracking-[-.06em] md:text-7xl">
        {capture.introHeadline}
      </h1>
      <p
        style={{ color: theme.secondary }}
        className="mt-7 max-w-md text-lg leading-8"
      >
        {capture.introBody}
      </p>
      <button
        onClick={onStart}
        style={{ background: theme.button, color: theme.bg }}
        className="mt-10 rounded-md px-6 py-3.5 text-sm font-medium"
      >
        Start →
      </button>
    </div>
  );
}

function PermissionInput({
  value,
  theme,
  onChange,
}: {
  value: string;
  theme: (typeof themes)[keyof typeof themes];
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-10 grid gap-3">
      {permissionOptions.map(([permission, label]) => (
        <button
          key={permission}
          onClick={() => onChange(permission)}
          className="border px-4 py-4 text-left text-sm transition"
          style={{
            borderColor:
              value === permission ? theme.accent : `${theme.secondary}55`,
            background:
              value === permission ? `${theme.accent}18` : "transparent",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MultipleChoiceInput({
  question,
  value,
  theme,
  onChange,
}: {
  question: Question;
  value: string;
  theme: (typeof themes)[keyof typeof themes];
  onChange: (value: string) => void;
}) {
  const options = Array.isArray(question.options)
    ? question.options
    : ["Yes", "Maybe", "Not right now"];
  return (
    <div className="mt-10 grid gap-3">
      {options.map((option) => (
        <button
          key={String(option)}
          onClick={() => onChange(String(option))}
          className="border px-4 py-4 text-left text-sm transition"
          style={{
            borderColor:
              value === option ? theme.accent : `${theme.secondary}55`,
            background: value === option ? `${theme.accent}18` : "transparent",
          }}
        >
          {String(option)}
        </button>
      ))}
    </div>
  );
}

function QuestionStep({
  capture,
  question,
  index,
  value,
  theme,
  busy,
  onChange,
  onNext,
}: {
  capture: Capture;
  question: Question;
  index: number;
  value: string;
  theme: (typeof themes)[keyof typeof themes];
  busy: boolean;
  onChange: (value: string) => void;
  onNext: (value?: string) => void;
}) {
  const isChoice =
    question.type === "PERMISSION" || question.type === "MULTIPLE_CHOICE";
  return (
    <div className="fade-in my-auto" key={question.id}>
      <div
        className="flex items-center justify-between text-sm"
        style={{ color: theme.secondary }}
      >
        <span>
          {index + 1} of {capture.questions.length}
        </span>
        <span>{Math.round((index / capture.questions.length) * 100)}%</span>
      </div>
      <div className="mt-12 max-w-2xl">
        <h1 className="text-4xl leading-tight font-semibold tracking-[-.05em] md:text-6xl">
          {question.label}
        </h1>
        {question.type === "PERMISSION" ? (
          <PermissionInput value={value} theme={theme} onChange={onChange} />
        ) : question.type === "MULTIPLE_CHOICE" ? (
          <MultipleChoiceInput
            question={question}
            value={value}
            theme={theme}
            onChange={onChange}
          />
        ) : question.type === "NUMBER" ? (
          <input
            autoFocus
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onNext(event.currentTarget.value);
              }
            }}
            placeholder="0"
            className="mt-10 w-full border-0 border-b-2 bg-transparent px-0 py-3 text-2xl outline-none placeholder:opacity-40 md:text-3xl"
            style={{ borderColor: `${theme.secondary}66` }}
          />
        ) : (
          <textarea
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onNext(event.currentTarget.value);
              }
            }}
            placeholder="Write your answer…"
            className="mt-10 min-h-36 w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-2xl outline-none placeholder:opacity-40 md:text-3xl"
            style={{ borderColor: `${theme.secondary}66` }}
          />
        )}
        <div className="mt-10 flex items-center justify-between gap-4">
          <span style={{ color: theme.secondary }} className="text-xs">
            {isChoice
              ? "Choose an option to continue"
              : "Enter to continue · Shift + Enter for a new line"}
          </span>
          <button
            onClick={() => onNext()}
            disabled={busy}
            style={{ background: theme.button, color: theme.bg }}
            className="shrink-0 rounded-md px-6 py-3 text-sm font-medium"
          >
            {busy
              ? "Saving…"
              : index === capture.questions.length - 1
                ? "Send response"
                : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CaptureClient({ capture }: CaptureClientProps) {
  const theme = themes[capture.themeId as keyof typeof themes] || themes.paper;
  const font = fonts[capture.fontId as keyof typeof fonts] || fonts.modern;
  const [index, setIndex] = useState(() =>
    readSavedStep(capture.slug, capture.questions.length),
  );
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    readSavedAnswers(capture.slug),
  );
  const answersRef = useRef(answers);
  const [started, setStarted] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem(stepStorageKey(capture.slug)) !== null ||
      Object.keys(readSavedAnswers(capture.slug)).length > 0
    );
  });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = capture.questions[index];

  function updateAnswer(value: string) {
    const next = { ...answersRef.current, [question.id]: value };
    answersRef.current = next;
    setAnswers(next);
    try {
      localStorage.setItem(
        answersStorageKey(capture.slug),
        JSON.stringify(next),
      );
    } catch {
      // Local autosave is best-effort when storage is unavailable.
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: capture.slug, answers: answersRef.current }),
    });
    if (!response.ok) {
      setError("We couldn’t save your response. Please try again.");
      setBusy(false);
      return;
    }
    setDone(true);
    localStorage.removeItem(answersStorageKey(capture.slug));
    localStorage.removeItem(stepStorageKey(capture.slug));
    setBusy(false);
  }

  function start() {
    setStarted(true);
    localStorage.setItem(stepStorageKey(capture.slug), String(index));
  }

  function next(valueOverride?: string) {
    const value = valueOverride ?? answersRef.current[question.id] ?? "";
    if (question.required && !value.trim()) return;
    if (index === capture.questions.length - 1) {
      submit();
      return;
    }
    setIndex((current) => {
      const nextIndex = current + 1;
      localStorage.setItem(stepStorageKey(capture.slug), String(nextIndex));
      return nextIndex;
    });
  }

  if (done) return <Completion capture={capture} theme={theme} />;

  return (
    <main
      style={{ background: theme.bg, color: theme.text }}
      className={`min-h-screen ${font.className}`}
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 md:px-10 md:py-12">
        {capture.showLogo && (
          <div className="flex items-center gap-3 text-sm font-semibold tracking-[-.03em]">
            {capture.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capture.logoUrl}
                alt=""
                className="h-8 max-w-32 object-contain"
              />
            ) : (
              capture.workspace
            )}
          </div>
        )}
        {!started ? (
          <Intro capture={capture} theme={theme} onStart={start} />
        ) : (
          <QuestionStep
            capture={capture}
            question={question}
            index={index}
            value={answers[question.id] || ""}
            theme={theme}
            busy={busy}
            onChange={updateAnswer}
            onNext={next}
          />
        )}
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
    </main>
  );
}
