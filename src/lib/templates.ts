export const templates = {
 QUICK_QUOTE:["What’s the one thing you value most about our product?","What would you tell someone considering us?","How can we use your response?"],
 CUSTOMER_WIN:["What were you trying to accomplish?","How were you handling this before?","What’s changed since using Fieldline?","Can you put a number on the impact?","What would you tell someone considering Fieldline?","How can we use your response?"],
 BEFORE_AFTER:["What was happening before Fieldline?","What does your workflow look like now?","What has improved?","How can we use your response?"],
 FEATURE_LOVE:["Which feature do you love most?","How does it help your team?","What would you tell a friend?","How can we use your response?"],
 CASE_STUDY_LEAD:["What changed after working with us?","What measurable result did you see?","Would you be open to a deeper conversation?","How can we use your response?"],
 CUSTOM:["Tell us about your experience.","What result have you seen?","How can we use your response?"],
} as const;
export const typeLabels:Record<string,string> = { QUICK_QUOTE:"Quick Quote",CUSTOMER_WIN:"Customer Win",BEFORE_AFTER:"Before & After",FEATURE_LOVE:"Feature Love",CASE_STUDY_LEAD:"Case Study Lead",CUSTOM:"Custom" };
export const permissionOptions = [["PUBLIC_FULL","Publicly with my name and company"],["PUBLIC_COMPANY","Publicly with my company only"],["PUBLIC_ANON","Publicly without identifying me"],["INTERNAL","Internal sales and marketing only"],["ASK_FIRST","Please ask me before using it"]] as const;
