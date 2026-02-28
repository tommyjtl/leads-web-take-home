/**
 * ISO 3166-1 alpha-2 region codes.
 * Labels are resolved at runtime via Intl.DisplayNames so they stay
 * accurate and locale-aware without maintaining a name list.
 */
export const COUNTRY_CODES = [
    "AF", "AL", "DZ", "AR", "AM", "AU", "AT", "AZ", "BD", "BY",
    "BE", "BO", "BA", "BR", "BG", "KH", "CM", "CA", "CL", "CN",
    "CO", "CR", "HR", "CU", "CZ", "DK", "DO", "EC", "EG", "SV",
    "ET", "FI", "FR", "GE", "DE", "GH", "GR", "GT", "HN", "HK",
    "HU", "IN", "ID", "IR", "IQ", "IE", "IL", "IT", "JM", "JP",
    "JO", "KZ", "KE", "KR", "XK", "KW", "KG", "LB", "LY", "LT",
    "MY", "MX", "MD", "MA", "MM", "NP", "NL", "NZ", "NI", "NG",
    "NO", "PK", "PS", "PA", "PY", "PE", "PH", "PL", "PT", "PR",
    "RO", "RU", "SA", "SN", "RS", "SG", "SK", "ZA", "ES", "LK",
    "SD", "SE", "CH", "SY", "TW", "TJ", "TH", "TN", "TR", "TM",
    "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VE", "VN", "YE", "ZW",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export interface CountryOption {
    value: string;
    label: string;
}

/**
 * Returns a sorted list of { value: alpha-2, label: display name } options
 * using the browser/Node Intl.DisplayNames API.
 */
export function getCountryOptions(locale = "en"): CountryOption[] {
    const regionNames = new Intl.DisplayNames([locale], { type: "region" });
    return COUNTRY_CODES
        .map((code) => ({
            value: code,
            label: regionNames.of(code) ?? code,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, locale));
}

/**
 * Resolve a single alpha-2 code to its display name.
 * Falls back to the code itself if Intl.DisplayNames is unavailable.
 */
export function getCountryLabel(code: string, locale = "en"): string {
    try {
        const regionNames = new Intl.DisplayNames([locale], { type: "region" });
        return regionNames.of(code) ?? code;
    } catch {
        return code;
    }
}
