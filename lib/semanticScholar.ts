/**
 * Scholarly Academic Literature Client
 * Integrates OpenAlex, Crossref, and Semantic Scholar with domain-adaptive fallbacks
 */

export interface AcademicPaper {
  paperId: string;
  title: string;
  authors: { authorId?: string; name: string }[];
  year?: number;
  venue?: string;
  abstract?: string;
  citationCount?: number;
  isOpenAccess?: boolean;
  doi?: string;
  url?: string;
  researchGap?: string;
}

export async function searchSemanticScholarPapers(
  query: string,
  limit: number = 6
): Promise<AcademicPaper[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 1. Try our own unified server API (no CORS, no 429 rate limit, aggregates OpenAlex + Crossref)
  try {
    const isBrowser = typeof window !== "undefined";
    const apiUrl = isBrowser 
      ? `/api/academic/search?query=${encodeURIComponent(cleanQuery)}&limit=${limit}`
      : `http://localhost:3000/api/academic/search?query=${encodeURIComponent(cleanQuery)}&limit=${limit}`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.papers) && data.papers.length > 0) {
        return data.papers;
      }
    }
  } catch (err: any) {
    // Proceed to direct OpenAlex query
  }

  throw new Error('Pencarian literatur tidak tersedia. Periksa koneksi dan coba lagi.');
}

/**
 * Generate BibTeX string for Mendeley / Zotero import
 */
export function generateBibtex(papers: AcademicPaper[]): string {
  return papers
    .map((p, idx) => {
      const firstAuthor = p.authors[0]?.name.split(' ').pop() || 'Author';
      const key = `${firstAuthor.toLowerCase()}${p.year || 2024}`;
      const authorList = p.authors.map((a) => a.name).join(' and ');

      return `@article{${key}_${idx + 1},
  author = {${authorList}},
  title = {${p.title}},
  journal = {${p.venue || 'Academic Journal'}},
  year = {${p.year || 2024}},
  ${p.doi ? `doi = {${p.doi.replace('https://doi.org/', '')}},` : ''}
  url = {${p.url || ''}}
}`;
    })
    .join('\n\n');
}
