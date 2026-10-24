/**
 * Academic Text Sanitizer
 * Membersihkan artefak sintaks AI markdown (seperti tanda bintang ganda literal '**')
 * dari judul, teks bab, formulasi usulan proposal, dan jawaban konsul AI.
 */

/**
 * Menghapus tanda bintang ganda ('**') dari string
 * Menjaga seluruh teks isi di dalamnya tetap utuh dan rapi.
 */
export function stripDoubleAsterisks(str: string): string {
  if (!str) return "";
  return str.replace(/\*\*/g, "");
}

/**
 * Membersihkan artefak markdown berulang seperti asterisks, markdown fence yang bocor, dll.
 */
export function cleanAcademicPlainText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\*\*/g, "") // Hapus **
    .replace(/^\s*[-*]\s+/gm, "• ") // Normalkan bullet dash/asterisk menjadi clean bullet
    .trim();
}

/**
 * Rekursif membersihkan seluruh string dalam objek, array, atau nested record
 * dari tanda bintang ganda '**' sehingga data state proposal, section, atau slide 100% bersih.
 */
export function sanitizeAcademicText<T>(input: T): T {
  if (typeof input === "string") {
    return stripDoubleAsterisks(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeAcademicText(item)) as unknown as T;
  }
  if (input !== null && typeof input === "object") {
    const output: any = {};
    for (const key of Object.keys(input)) {
      output[key] = sanitizeAcademicText((input as any)[key]);
    }
    return output as T;
  }
  return input;
}
