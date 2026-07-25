/**
 * Split a display name into first + last for editable form fields.
 *
 * The first whitespace-delimited token is the first name; everything after it is
 * the last name. This matches Ruby's `split(" ", 2)` used by the backend
 * serializer, so a name survives a round trip through an edit form.
 *
 * Note that JavaScript's `String.split(' ', 2)` is NOT equivalent — it caps the
 * result at two elements and discards the rest, which silently truncates names
 * with more than two parts (Spanish double surnames, particles like "del" or
 * "van der", multi-part given names).
 */
export function splitName(fullName: string | null | undefined): {
  firstName: string
  lastName: string
} {
  const normalized = (fullName ?? '').trim().replace(/\s+/g, ' ')
  if (!normalized) return { firstName: '', lastName: '' }

  const boundary = normalized.indexOf(' ')
  if (boundary === -1) return { firstName: normalized, lastName: '' }

  return {
    firstName: normalized.slice(0, boundary),
    lastName: normalized.slice(boundary + 1),
  }
}

/** Rejoin first + last into the single name field the backend stores. */
export function joinName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
}
