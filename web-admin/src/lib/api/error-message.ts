/**
 * Build a user-facing message from an API error response body.
 *
 * Handles the shapes our proxy routes return:
 *  - zod `flatten()` output: `{ formErrors: string[], fieldErrors: Record<string, string[]> }`
 *  - Mongoose-style: `{ [field]: string[] }`
 *  - a plain `{ error: string }`
 */
export function extractApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const body = data as { error?: unknown; details?: unknown };
  const messages: string[] = [];

  if (body.details && typeof body.details === 'object') {
    const details = body.details as Record<string, unknown>;
    const isZodFlatten = 'fieldErrors' in details || 'formErrors' in details;

    if (isZodFlatten) {
      const formErrors = details.formErrors;
      if (Array.isArray(formErrors)) messages.push(...formErrors.filter((m): m is string => typeof m === 'string'));
      const fieldErrors = details.fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        for (const [field, msgs] of Object.entries(fieldErrors as Record<string, unknown>)) {
          if (Array.isArray(msgs) && msgs.length > 0) messages.push(`${field}: ${msgs[0]}`);
        }
      }
    } else {
      for (const [field, msgs] of Object.entries(details)) {
        if (Array.isArray(msgs) && msgs.length > 0) messages.push(`${field}: ${msgs[0]}`);
        else if (typeof msgs === 'string') messages.push(`${field}: ${msgs}`);
      }
    }
  }

  if (messages.length > 0) return messages.join('\n');
  if (typeof body.error === 'string' && body.error && body.error !== 'Validation error') return body.error;
  return fallback;
}
