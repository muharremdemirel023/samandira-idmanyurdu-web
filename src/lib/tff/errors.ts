export type TffSyncErrorCode =
  | "config_error"
  | "robots_unavailable"
  | "robots_disallowed"
  | "source_unreachable"
  | "source_blocked"
  | "http_error"
  | "unexpected_content"
  | "structure_changed"
  | "season_not_found"
  | "league_not_found"
  | "validation_failed"
  | "db_error"
  | "unexpected_error";

export class TffSyncError extends Error {
  readonly code: TffSyncErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: TffSyncErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "TffSyncError";
    this.code = code;
    this.details = details;
  }
}
