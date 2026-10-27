import { NextResponse } from "next/server";
import { BibliographyItem } from "@/types/studio";
import { extractCleanDoi, isValidDoiSyntax, VerifiedReference, EvidenceVerificationLevel } from "@/lib/evidenceVerifier";

const USER_AGENT = "AcademicAgentStudio/1.0 (mailto:ilhammu29@unp.ac.id)";

interface VerificationRequest {
  references?: BibliographyItem[];
  items?: BibliographyItem[];
}

/**
 * Normalizes text for fuzzy token matching
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function calculateJaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Verify a single reference against Crossref and OpenAlex
 */
async function verifySingleReference(item: BibliographyItem): Promise<VerifiedReference> {
  const cleanDoi = extractCleanDoi(item.doiUrl);

  // 1. If DOI is present, verify directly against Crossref
  if (cleanDoi && isValidDoiSyntax(cleanDoi)) {
    try {
      const crRes = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      });

      if (crRes.ok) {
        const crData = await crRes.json();
        const msg = crData.message;
        const apiTitle = Array.isArray(msg.title) ? msg.title[0] : (msg.title || "");
        const apiAuthors = (msg.author || []).map((a: any) => `${a.given || ""} ${a.family || ""}`.trim()).filter(Boolean);
        const apiYear = msg.published?.["date-parts"]?.[0]?.[0] || msg.created?.["date-parts"]?.[0]?.[0] || 0;
        const apiVenue = msg["container-title"]?.[0] || msg.publisher || item.source;

        const titleSim = calculateJaccardSimilarity(item.title, apiTitle);
        const authorMatch = apiAuthors.some((a: string) => {
          const surname = a.split(" ").pop()?.toLowerCase();
          return surname && item.author.toLowerCase().includes(surname);
        });

        const isRetracted = Boolean(msg.relation?.["is-retracted-by"] || msg["update-to"]);

        let level: EvidenceVerificationLevel = "LEVEL_1_METADATA_VERIFIED";
        let confidence = 0.95;

        if (titleSim < 0.25 && !authorMatch) {
          level = "LEVEL_0_UNVERIFIED";
          confidence = 0.3;
        }

        return {
          id: item.id,
          doi: `https://doi.org/${cleanDoi}`,
          cleanDoi,
          title: apiTitle || item.title,
          authors: apiAuthors.length > 0 ? apiAuthors : [item.author],
          year: apiYear || item.year,
          venue: apiVenue,
          url: `https://doi.org/${cleanDoi}`,
          isOpenAccess: false,
          isRetracted,
          retractionDetails: isRetracted ? "Artikel memiliki catatan pembaruan atau pencabutan (Crossref)" : undefined,
          verificationLevel: level,
          supportedClaims: [],
          confidenceScore: confidence,
          providerSource: "Crossref",
        };
      }
    } catch {
      // Fall through to OpenAlex
    }

    // Try OpenAlex with DOI
    try {
      const oaRes = await fetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(cleanDoi)}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      });

      if (oaRes.ok) {
        const oaData = await oaRes.json();
        const apiTitle = oaData.title || item.title;
        const apiAuthors = (oaData.authorships || []).map((a: any) => a.author?.display_name || "").filter(Boolean);
        const apiYear = oaData.publication_year || item.year;
        const apiVenue = oaData.primary_location?.source?.display_name || item.source;
        const isOpenAccess = Boolean(oaData.open_access?.is_oa);
        const isRetracted = Boolean(oaData.is_retracted);

        const level: EvidenceVerificationLevel = isRetracted
          ? "LEVEL_0_UNVERIFIED"
          : isOpenAccess
          ? "LEVEL_3_FULL_TEXT_VERIFIED"
          : "LEVEL_1_METADATA_VERIFIED";

        return {
          id: item.id,
          doi: oaData.doi || `https://doi.org/${cleanDoi}`,
          cleanDoi,
          title: apiTitle,
          authors: apiAuthors.length > 0 ? apiAuthors : [item.author],
          year: apiYear,
          venue: apiVenue,
          url: oaData.doi || `https://doi.org/${cleanDoi}`,
          isOpenAccess,
          isRetracted,
          retractionDetails: isRetracted ? "Artikel telah dicabut secara resmi (OpenAlex is_retracted)" : undefined,
          verificationLevel: level,
          supportedClaims: [],
          confidenceScore: 0.92,
          providerSource: "OpenAlex",
        };
      }
    } catch {
      // Fall through
    }
  }

  // 2. If no DOI or DOI not resolved, search OpenAlex by Title
  if (item.title && item.title.trim().length > 5) {
    try {
      const oaSearchRes = await fetch(
        `https://api.openalex.org/works?search=${encodeURIComponent(item.title)}&per-page=3`,
        {
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (oaSearchRes.ok) {
        const data = await oaSearchRes.json();
        const first = data.results?.[0];
        if (first) {
          const sim = calculateJaccardSimilarity(item.title, first.title || "");
          if (sim >= 0.4) {
            const apiDoi = first.doi ? extractCleanDoi(first.doi) : undefined;
            const isOpenAccess = Boolean(first.open_access?.is_oa);
            const isRetracted = Boolean(first.is_retracted);
            const level: EvidenceVerificationLevel = isRetracted
              ? "LEVEL_0_UNVERIFIED"
              : isOpenAccess
              ? "LEVEL_3_FULL_TEXT_VERIFIED"
              : "LEVEL_1_METADATA_VERIFIED";

            return {
              id: item.id,
              doi: first.doi || undefined,
              cleanDoi: apiDoi || undefined,
              title: first.title || item.title,
              authors: (first.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean),
              year: first.publication_year || item.year,
              venue: first.primary_location?.source?.display_name || item.source,
              url: first.doi || first.primary_location?.landing_page_url || undefined,
              isOpenAccess,
              isRetracted,
              retractionDetails: isRetracted ? "Artikel dicabut (OpenAlex)" : undefined,
              verificationLevel: level,
              supportedClaims: [],
              confidenceScore: Math.min(0.9, 0.6 + sim * 0.3),
              providerSource: "OpenAlex",
            };
          }
        }
      }
    } catch {
      // Ignore and fallback
    }
  }

  // 3. Fallback: Unverified in external scholarly databases
  return {
    id: item.id,
    doi: item.doiUrl,
    cleanDoi: cleanDoi || undefined,
    title: item.title,
    authors: [item.author],
    year: item.year,
    venue: item.source,
    url: item.doiUrl,
    isOpenAccess: false,
    isRetracted: false,
    verificationLevel: "LEVEL_0_UNVERIFIED",
    supportedClaims: [],
    confidenceScore: 0.1,
    providerSource: "Manual",
  };
}

export async function POST(req: Request) {
  try {
    const body: VerificationRequest = await req.json();
    const items = body.references || body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Daftar pustaka kosong atau tidak valid.",
        verified: [],
      });
    }

    // Process references concurrently with a batch limit of 6 to avoid hammering external APIs
    const BATCH_SIZE = 6;
    const verified: VerifiedReference[] = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const slice = items.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(slice.map((ref) => verifySingleReference(ref)));
      verified.push(...batchResults);
    }

    const verifiedCount = verified.filter((r) => r.verificationLevel !== "LEVEL_0_UNVERIFIED").length;
    const retractedCount = verified.filter((r) => r.isRetracted).length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalChecked: verified.length,
      verifiedCount,
      retractedCount,
      verified,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal memverifikasi referensi akademik.",
        verified: [],
      },
      { status: 500 }
    );
  }
}
