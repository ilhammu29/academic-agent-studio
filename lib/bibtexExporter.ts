import { BibliographyItem, ProposalDocument } from "@/types/studio";

/**
 * Clean BibTeX and RIS Reference Exporter
 * Compatible with Mendeley, Zotero, EndNote, and JabRef.
 */

// Helper to sanitize BibTeX citekey
function generateCiteKey(author: string, year: string, title: string, index: number): string {
  const cleanAuthor = author.split(/[,;\s]/)[0]?.replace(/[^a-zA-Z]/g, "").toLowerCase() || "author";
  const cleanYear = year.replace(/[^0-9]/g, "") || "2024";
  const cleanTitleWord = title.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, "").toLowerCase() || "ref";
  return `${cleanAuthor}${cleanYear}${cleanTitleWord}_${index + 1}`;
}

export function generateBibTeX(doc: ProposalDocument): string {
  const entries: string[] = [];

  // Extract from doc.bibliography if present
  if (doc.bibliography && doc.bibliography.length > 0) {
    doc.bibliography.forEach((item, idx) => {
      const citeKey = generateCiteKey(item.author, item.year, item.title, idx);
      const doiField = item.doiUrl ? `,\n  doi = {${item.doiUrl.replace(/^https?:\/\/doi\.org\//, "")}}` : "";
      const urlField = item.doiUrl ? `,\n  url = {${item.doiUrl}}` : "";

      entries.push(`@article{${citeKey},
  author = {${item.author}},
  title = {${item.title}},
  journal = {${item.source}},
  year = {${item.year}}${doiField}${urlField}
}`);
    });
  }

  // Also include literature theories from Bab 2 if available
  if (doc.bab2?.landasanTeori && doc.bab2.landasanTeori.length > 0) {
    doc.bab2.landasanTeori.forEach((item, idx) => {
      if (item.citation) {
        const citeKey = `theory_${idx + 1}_${item.topic.replace(/[^a-zA-Z]/g, "").toLowerCase().slice(0, 8)}`;
        entries.push(`@misc{${citeKey},
  author = {${item.citation}},
  title = {${item.topic} dalam Konteks ${doc.targetEntity}},
  note = {Rujukan Landasan Teori Naskah Proposal},
  year = {2023}
}`);
      }
    });
  }

  // Include research gap references if available
  if (doc.bab2?.researchGapMatrix && doc.bab2.researchGapMatrix.length > 0) {
    doc.bab2.researchGapMatrix.forEach((gap, idx) => {
      const citeKey = `gap_${idx + 1}_${gap.authorYear.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`;
      entries.push(`@article{${citeKey},
  author = {${gap.authorYear}},
  title = {${gap.titleJournal}},
  journal = {Riset Terdahulu Terindeks},
  year = {2024},
  note = {Desain: ${gap.designSample} | Variabel: ${gap.variables}}
}`);
    });
  }

  if (entries.length === 0) {
    entries.push(`@misc{proposal_${doc.id},
  author = {${doc.candidateName || "Peneliti"}},
  title = {${doc.title}},
  institution = {${doc.institution}},
  year = {${new Date().getFullYear()}},
  note = {Usulan Proposal Akademik}
}`);
  }

  return entries.join("\n\n");
}

export function generateRIS(doc: ProposalDocument): string {
  const entries: string[] = [];

  if (doc.bibliography && doc.bibliography.length > 0) {
    doc.bibliography.forEach((item) => {
      const doi = item.doiUrl ? `DO  - ${item.doiUrl.replace(/^https?:\/\/doi\.org\//, "")}\nUR  - ${item.doiUrl}\n` : "";
      entries.push(`TY  - JOUR
AU  - ${item.author}
TI  - ${item.title}
JO  - ${item.source}
PY  - ${item.year}
${doi}ER  - `);
    });
  }

  if (doc.bab2?.researchGapMatrix && doc.bab2.researchGapMatrix.length > 0) {
    doc.bab2.researchGapMatrix.forEach((gap) => {
      entries.push(`TY  - JOUR
AU  - ${gap.authorYear}
TI  - ${gap.titleJournal}
N1  - Desain: ${gap.designSample}; Variabel: ${gap.variables}
ER  - `);
    });
  }

  if (entries.length === 0) {
    entries.push(`TY  - GEN
AU  - ${doc.candidateName || "Peneliti"}
TI  - ${doc.title}
PB  - ${doc.institution}
PY  - ${new Date().getFullYear()}
ER  - `);
  }

  return entries.join("\n\n");
}

export function downloadCitationFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
