export const questionTypes = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "MULTIPLE_CHOICE",
  "NUMBER",
  "PERMISSION",
  "NAME",
  "COMPANY",
  "JOB_TITLE",
  "EMAIL",
] as const;

export type QuestionTypeName = (typeof questionTypes)[number];

export type TemplateQuestion = {
  label: string;
  type: QuestionTypeName;
  required?: boolean;
  options?: string[];
};

export const templates: Record<string, TemplateQuestion[]> = {
  QUICK_QUOTE: [
    {
      label: "What’s the one thing you value most about our product?",
      type: "LONG_TEXT",
    },
    { label: "What would you tell someone considering us?", type: "LONG_TEXT" },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
  CUSTOMER_WIN: [
    { label: "What were you trying to accomplish?", type: "LONG_TEXT" },
    { label: "How were you handling this before?", type: "LONG_TEXT" },
    { label: "What’s changed since using Fieldline?", type: "LONG_TEXT" },
    { label: "Can you put a number on the impact?", type: "NUMBER" },
    {
      label: "What would you tell someone considering Fieldline?",
      type: "LONG_TEXT",
    },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
  BEFORE_AFTER: [
    { label: "What was happening before Fieldline?", type: "LONG_TEXT" },
    { label: "What does your workflow look like now?", type: "LONG_TEXT" },
    { label: "What has improved?", type: "LONG_TEXT" },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
  FEATURE_LOVE: [
    { label: "Which feature do you love most?", type: "SHORT_TEXT" },
    { label: "How does it help your team?", type: "LONG_TEXT" },
    { label: "What would you tell a friend?", type: "LONG_TEXT" },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
  CASE_STUDY_LEAD: [
    { label: "What changed after working with us?", type: "LONG_TEXT" },
    { label: "What measurable result did you see?", type: "NUMBER" },
    {
      label: "Would you be open to a deeper conversation?",
      type: "MULTIPLE_CHOICE",
      options: ["Yes", "Maybe", "Not right now"],
    },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
  CUSTOM: [
    { label: "Tell us about your experience.", type: "LONG_TEXT" },
    { label: "What result have you seen?", type: "LONG_TEXT" },
    { label: "How can we use your response?", type: "PERMISSION" },
  ],
};

export const typeLabels: Record<string, string> = {
  QUICK_QUOTE: "Quick Quote",
  CUSTOMER_WIN: "Customer Win",
  BEFORE_AFTER: "Before & After",
  FEATURE_LOVE: "Feature Love",
  CASE_STUDY_LEAD: "Case Study Lead",
  CUSTOM: "Custom",
};

export const permissionOptions = [
  ["PUBLIC_FULL", "Publicly with my name and company"],
  ["PUBLIC_COMPANY", "Publicly with my company only"],
  ["PUBLIC_ANON", "Publicly without identifying me"],
  ["INTERNAL", "Internal sales and marketing only"],
  ["ASK_FIRST", "Please ask me before using it"],
] as const;

export const permissionLabels: Record<string, string> = {
  PUBLIC_FULL: "Public",
  PUBLIC_COMPANY: "Company only",
  PUBLIC_ANON: "Anonymous",
  INTERNAL: "Internal",
  ASK_FIRST: "Ask first",
};
