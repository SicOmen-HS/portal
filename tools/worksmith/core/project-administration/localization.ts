export type WorksmithLanguage = "en" | "sv";

export type WorksmithMessageId =
  | "config.title"
  | "config.source"
  | "config.path"
  | "config.project_name"
  | "config.profile"
  | "config.language"
  | "config.output_target"
  | "config.shell"
  | "config.color"
  | "config.warning_detail"
  | "queue.application_title"
  | "queue.title"
  | "queue.empty"
  | "queue.handoff_empty"
  | "queue.completed"
  | "queue.total"
  | "queue.handoff_title"
  | "queue.project_summary"
  | "queue.items_summary"
  | "queue.completed_read"
  | "queue.completed_listed"
  | "queue.next_validate"
  | "handoff.result"
  | "handoff.command"
  | "handoff.status"
  | "handoff.exit_code"
  | "handoff.completed_actions"
  | "handoff.changed_files"
  | "handoff.diagnostics"
  | "handoff.next_actions"
  | "handoff.none";

type MessageVariables = Readonly<Record<string, string | number>>;
type MessageCatalog = Readonly<Record<WorksmithMessageId, string>>;

const ENGLISH_MESSAGES: MessageCatalog = Object.freeze({
  "config.title": "Effective Configuration",
  "config.source": "Source",
  "config.path": "Path",
  "config.project_name": "Project name",
  "config.profile": "Profile",
  "config.language": "Language",
  "config.output_target": "Output target",
  "config.shell": "Shell",
  "config.color": "Color",
  "config.warning_detail": "Warning detail",
  "queue.application_title": "{project} Project Administration CLI",
  "queue.title": "Work Queue",
  "queue.empty": "(empty)",
  "queue.handoff_empty": "_Empty._",
  "queue.completed": "completed {date}",
  "queue.total": "Total: {count}",
  "queue.handoff_title": "Worksmith Queue Handoff",
  "queue.project_summary": "Project: {project}",
  "queue.items_summary": "Work items: {count}",
  "queue.completed_read": "Read the current work queue.",
  "queue.completed_listed": "Listed every lifecycle section in canonical order.",
  "queue.next_validate": "Validate project administration state.",
  "handoff.result": "Result",
  "handoff.command": "Command",
  "handoff.status": "Status",
  "handoff.exit_code": "Exit code",
  "handoff.completed_actions": "Completed Actions",
  "handoff.changed_files": "Changed Files",
  "handoff.diagnostics": "Diagnostics",
  "handoff.next_actions": "Suggested Next Actions",
  "handoff.none": "_None._"
});

const SWEDISH_MESSAGES: MessageCatalog = Object.freeze({
  "config.title": "Effektiv konfiguration",
  "config.source": "Källa",
  "config.path": "Sökväg",
  "config.project_name": "Projektnamn",
  "config.profile": "Profil",
  "config.language": "Språk",
  "config.output_target": "Utmatningsmål",
  "config.shell": "Skal",
  "config.color": "Färg",
  "config.warning_detail": "Varningsdetalj",
  "queue.application_title": "{project} projektadministrations-CLI",
  "queue.title": "Arbetskö",
  "queue.empty": "(tom)",
  "queue.handoff_empty": "_Tom._",
  "queue.completed": "slutförd {date}",
  "queue.total": "Totalt: {count}",
  "queue.handoff_title": "Worksmith kööverlämning",
  "queue.project_summary": "Projekt: {project}",
  "queue.items_summary": "Arbetsobjekt: {count}",
  "queue.completed_read": "Läste den aktuella arbetskön.",
  "queue.completed_listed": "Listade alla livscykelavsnitt i kanonisk ordning.",
  "queue.next_validate": "Validera projektadministrationens tillstånd.",
  "handoff.result": "Resultat",
  "handoff.command": "Kommando",
  "handoff.status": "Status",
  "handoff.exit_code": "Returkod",
  "handoff.completed_actions": "Utförda åtgärder",
  "handoff.changed_files": "Ändrade filer",
  "handoff.diagnostics": "Diagnostik",
  "handoff.next_actions": "Föreslagna nästa åtgärder",
  "handoff.none": "_Inga._"
});

const CATALOGS: Readonly<Record<WorksmithLanguage, MessageCatalog>> = Object.freeze({
  en: ENGLISH_MESSAGES,
  sv: SWEDISH_MESSAGES
});

export function getWorksmithMessage(
  language: string,
  id: WorksmithMessageId,
  variables: MessageVariables = {}
): string {
  const catalog = CATALOGS[language as WorksmithLanguage] ?? ENGLISH_MESSAGES;
  return Object.entries(variables).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    catalog[id] ?? ENGLISH_MESSAGES[id]
  );
}
