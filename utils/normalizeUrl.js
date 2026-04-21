export function normalizeUrl(rawUrl) {
  try {
    const urlObj = new URL(rawUrl);

    // Force https
    urlObj.protocol = "https:";

    // Remove tracking params
    const paramsToRemove = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ref",
      "ref_",
    ];

    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    // Remove trailing slash
    let normalizedUrl = urlObj.toString();
    if (normalizedUrl.endsWith("/")) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // Lowercase domain
    normalizedUrl = normalizedUrl.replace(
      urlObj.hostname,
      urlObj.hostname.toLowerCase(),
    );

    return normalizedUrl;
  } catch (error) {
    console.error("Error normalising URL:", error);
    return url;
  }
}
