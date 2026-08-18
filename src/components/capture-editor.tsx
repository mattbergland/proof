"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Header, TextArea } from "@/components/ui";
import { fonts, themes } from "@/lib/themes";
import {
  questionTypes,
  templates,
  typeLabels,
  type TemplateQuestion,
} from "@/lib/templates";

type EditableQuestion = TemplateQuestion & { id?: string };

type CaptureEditorProps = {
  mode: "new" | "edit";
  captureId?: string;
  initialType?: string;
  initialName?: string;
  initialHeadline?: string;
  initialBody?: string;
  initialThankYou?: string;
  initialTheme?: string;
  initialFont?: string;
  initialShowLogo?: boolean;
  initialQuestions?: EditableQuestion[];
};

const typeDescriptions: Record<string, string> = {
  QUICK_QUOTE: "A short quote you can use right away.",
  CUSTOMER_WIN: "Context, change, and impact in one request.",
  BEFORE_AFTER: "Make the before and after easy to see.",
  FEATURE_LOVE: "Capture specific product love.",
  CASE_STUDY_LEAD: "Find customers ready for a deeper story.",
  CUSTOM: "Start with a blank, flexible request.",
};

export default function CaptureEditor({
  mode,
  captureId,
  initialType = "CUSTOMER_WIN",
  initialName = "Customer Win",
  initialHeadline = "We’d love to hear about your experience.",
  initialBody = "This should only take about 90 seconds.",
  initialThankYou = "Thanks for sharing your experience.",
  initialTheme = "paper",
  initialFont = "modern",
  initialShowLogo = true,
  initialQuestions,
}: CaptureEditorProps) {
  const router = useRouter();
  const [step, setStep] = useState(mode === "new" ? 1 : 2);
  const [type, setType] = useState(initialType);
  const [name, setName] = useState(initialName);
  const [headline, setHeadline] = useState(initialHeadline);
  const [body, setBody] = useState(initialBody);
  const [thankYou, setThankYou] = useState(initialThankYou);
  const [questions, setQuestions] = useState<EditableQuestion[]>(
    initialQuestions || templates[initialType] || templates.CUSTOMER_WIN,
  );
  const [theme, setTheme] = useState(initialTheme);
  const [font, setFont] = useState(initialFont);
  const [showLogo, setShowLogo] = useState(initialShowLogo);
  const [busy, setBusy] = useState(false);

  function chooseType(nextType: string) {
    setType(nextType);
    setName(typeLabels[nextType]);
    setQuestions(
      (templates[nextType] || templates.CUSTOM).map((question) => ({
        ...question,
      })),
    );
  }

  function updateQuestion(index: number, update: Partial<EditableQuestion>) {
    setQuestions((current) =>
      current.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...update } : question,
      ),
    );
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= questions.length) return;
    setQuestions((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  async function save() {
    setBusy(true);
    const payload = {
      type,
      name,
      introHeadline: headline,
      introBody: body,
      thankYouMessage: thankYou,
      questions,
      themeId: theme,
      fontId: font,
      showLogo,
    };
    const response = await fetch(
      mode === "new" ? "/api/captures" : `/api/captures/${captureId}`,
      {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    if (result.capture) {
      router.push(
        mode === "new"
          ? `/c/${result.capture.slug}`
          : `/captures/${result.capture.id}`,
      );
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <main>
      <Header
        action={
          <span className="text-sm text-[#726d63]">
            {mode === "new" ? "New capture" : "Edit capture"}
          </span>
        }
      />
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10">
        <p className="text-sm tracking-[.16em] text-[#b4540a] uppercase">
          {mode === "new" ? `Step ${step} of 2` : "Capture settings"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em]">
          {step === 1
            ? "What are you trying to capture?"
            : "Shape your customer experience."}
        </h1>

        {step === 1 ? (
          <>
            <p className="mt-4 text-[#726d63]">
              Start with a focused format. You can adjust every question next.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {Object.keys(typeLabels).map((captureType) => (
                <button
                  key={captureType}
                  onClick={() => chooseType(captureType)}
                  className={`border p-5 text-left transition ${
                    type === captureType
                      ? "border-[#191815] bg-white"
                      : "border-[#dfdbd2] hover:border-[#aaa398]"
                  }`}
                >
                  <span className="font-semibold">
                    {typeLabels[captureType]}
                  </span>
                  <span className="mt-2 block text-sm text-[#726d63]">
                    {typeDescriptions[captureType]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <Button onClick={() => setStep(2)}>Continue →</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 grid gap-6">
              <Field
                label="Capture name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <TextArea
                label="Intro headline"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
              />
              <TextArea
                label="Intro body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <TextArea
                label="Thank-you message"
                value={thankYou}
                onChange={(event) => setThankYou(event.target.value)}
              />

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Questions</h2>
                  <button
                    onClick={() =>
                      setQuestions((current) => [
                        ...current,
                        { label: "New question", type: "LONG_TEXT" },
                      ])
                    }
                    className="text-sm underline"
                  >
                    + Add question
                  </button>
                </div>
                <div className="mt-3 grid gap-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.id || `question-${index}`}
                      className="border border-[#dfdbd2] bg-white p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-10 w-7 items-center justify-center text-sm text-[#726d63]">
                          {index + 1}
                        </span>
                        <input
                          value={question.label}
                          onChange={(event) =>
                            updateQuestion(index, { label: event.target.value })
                          }
                          className="min-w-0 flex-1 border border-[#cfc9be] px-3 py-2 outline-none focus:border-[#191815]"
                        />
                        <button
                          disabled={index === 0}
                          onClick={() => moveQuestion(index, -1)}
                          className="px-2 py-2 text-sm disabled:opacity-30"
                          aria-label="Move question up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={index === questions.length - 1}
                          onClick={() => moveQuestion(index, 1)}
                          className="px-2 py-2 text-sm disabled:opacity-30"
                          aria-label="Move question down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() =>
                            setQuestions((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="px-2 py-2 text-[#726d63]"
                          aria-label="Delete question"
                        >
                          ×
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 pl-9 sm:grid-cols-2">
                        <label className="grid gap-1 text-xs font-medium tracking-[.1em] text-[#726d63] uppercase">
                          Type
                          <select
                            value={question.type}
                            onChange={(event) =>
                              updateQuestion(index, {
                                type: event.target
                                  .value as EditableQuestion["type"],
                              })
                            }
                            className="border border-[#cfc9be] bg-white px-2 py-2 text-sm tracking-normal text-[#191815] normal-case"
                          >
                            {questionTypes.map((questionType) => (
                              <option key={questionType} value={questionType}>
                                {questionType.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        </label>
                        {question.type === "MULTIPLE_CHOICE" && (
                          <label className="grid gap-1 text-xs font-medium tracking-[.1em] text-[#726d63] uppercase">
                            Options
                            <input
                              value={(question.options || []).join(", ")}
                              onChange={(event) =>
                                updateQuestion(index, {
                                  options: event.target.value
                                    .split(",")
                                    .map((option) => option.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="border border-[#cfc9be] px-2 py-2 text-sm tracking-normal text-[#191815] normal-case"
                              placeholder="Yes, Maybe, No"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(event) => setShowLogo(event.target.checked)}
                />
                Show company logo on the capture
              </label>

              <div>
                <h2 className="font-semibold">Theme</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(themes).map(([themeId, themeOption]) => (
                    <button
                      key={themeId}
                      onClick={() => setTheme(themeId)}
                      className={`border px-3 py-2 text-sm ${theme === themeId ? "border-[#191815]" : "border-[#dfdbd2]"}`}
                      style={{
                        background: themeOption.bg,
                        color: themeOption.text,
                      }}
                    >
                      {themeOption.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-semibold">Font pairing</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(fonts).map(([fontId, fontOption]) => (
                    <button
                      key={fontId}
                      onClick={() => setFont(fontId)}
                      className={`border px-3 py-2 text-sm ${fontOption.className} ${font === fontId ? "border-[#191815]" : "border-[#dfdbd2]"}`}
                    >
                      {fontOption.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              {mode === "new" ? (
                <button
                  onClick={() => setStep(1)}
                  className="text-sm underline"
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <Button disabled={busy} onClick={save}>
                {busy
                  ? "Saving…"
                  : mode === "new"
                    ? "Publish capture →"
                    : "Save capture"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
