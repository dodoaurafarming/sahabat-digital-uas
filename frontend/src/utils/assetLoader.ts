export function loadAssetByKey(
  modules: Record<string, string>,
  preferredKey: string,
  fallbackKey?: string,
): string {
  return (
    modules[preferredKey] ??
    (fallbackKey ? modules[fallbackKey] : undefined) ??
    Object.values(modules)[0] ??
    ''
  );
}
