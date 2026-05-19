const storageKey = (organizationId: number) => `voxxy:dataExport:${organizationId}:exportedKeys`;

function readKeys(organizationId: number): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(organizationId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writeKeys(organizationId: number, keys: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(organizationId), JSON.stringify([...keys]));
  } catch {
    /* quota or private mode */
  }
}

export function loadExportedKeys(organizationId: number): Set<string> {
  return readKeys(organizationId);
}

export function addExportedKeys(organizationId: number, keys: string[]): void {
  if (keys.length === 0) return;
  const next = readKeys(organizationId);
  keys.forEach(k => next.add(k));
  writeKeys(organizationId, next);
}

export function removeExportedKey(organizationId: number, key: string): void {
  const next = readKeys(organizationId);
  next.delete(key);
  writeKeys(organizationId, next);
}

export function toggleExportedKey(organizationId: number, key: string, exported: boolean): void {
  if (exported) {
    addExportedKeys(organizationId, [key]);
  } else {
    removeExportedKey(organizationId, key);
  }
}
