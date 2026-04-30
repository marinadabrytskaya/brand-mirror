export function hasDataProcessingConsent(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function hasMarketingConsent(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}
