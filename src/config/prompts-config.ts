export interface PromptsConfig {
  superficial: PromptTemplate;
  simplified: PromptTemplate;
  full: PromptTemplate;
  detailed: PromptTemplate;
}

export interface PromptTemplate {
  introduction: string;
  focusPoints: string[];
  jsonSchema: string;
}

export function buildPromptFromTemplate(
  template: PromptTemplate,
  diff: string,
  lines: number,
): string {
  const focusSection = template.focusPoints.length > 0
    ? `\n${template.focusPoints.join("\n")}`
    : "";

  return `${template.introduction.replace("{{lines}}", lines.toString())}

DIFF:
${diff}

${template.jsonSchema}${focusSection}`;
}
