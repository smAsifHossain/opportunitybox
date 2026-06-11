/**
 * Canonicalize country names so filters don't show "USA", "U.S.A.", and
 * "United States" as three different countries. Keys are compared after
 * lowercasing and stripping periods/extra spaces.
 */
const aliases: Record<string, string> = {
  // United States
  "usa": "United States",
  "us": "United States",
  "u s a": "United States",
  "u s": "United States",
  "united states of america": "United States",
  "america": "United States",
  // United Kingdom
  "uk": "United Kingdom",
  "u k": "United Kingdom",
  "great britain": "United Kingdom",
  "england": "United Kingdom",
  "scotland": "United Kingdom",
  "wales": "United Kingdom",
  "northern ireland": "United Kingdom",
  // United Arab Emirates
  "uae": "United Arab Emirates",
  "u a e": "United Arab Emirates",
  // Korea
  "south korea": "South Korea",
  "korea": "South Korea",
  "republic of korea": "South Korea",
  "korea republic of": "South Korea",
  "korea south": "South Korea",
  // The Netherlands
  "the netherlands": "Netherlands",
  "holland": "Netherlands",
  // Czechia
  "czechia": "Czech Republic",
  // China
  "peoples republic of china": "China",
  "pr china": "China",
  "p r china": "China",
  // Russia
  "russian federation": "Russia",
  // Vietnam
  "viet nam": "Vietnam",
  // Türkiye
  "turkiye": "Turkey",
  "türkiye": "Turkey",
  // Taiwan
  "taiwan province of china": "Taiwan",
  "chinese taipei": "Taiwan",
  // Iran
  "iran islamic republic of": "Iran",
  // Online-ish values some datasets put in the country field
  "online": "",
  "remote": "",
  "virtual": "",
  "worldwide": "",
  "global": "",
};

export function normalizeCountry(
  raw: string | null | undefined
): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;
  const key = trimmed.toLowerCase().replace(/\./g, "").replace(/,/g, "").trim();
  if (key in aliases) return aliases[key] || undefined;
  return trimmed;
}
