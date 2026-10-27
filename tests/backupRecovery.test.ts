import test from "node:test";
import assert from "node:assert";
import { exportProjectAsJson, importProjectFromJson } from "../lib/supabase.ts";
import type { SavedProjectRecord } from "../lib/supabase.ts";

test("Project Backup and Recovery: export and import preserves project data integrity", () => {
  const sampleProject: SavedProjectRecord = {
    id: "proj-123",
    title: "Sistem Informasi Geografis Pemetaan Daerah Rawan Longsor",
    category: "skripsi",
    targetEntity: "BPBD Kota Padang",
    durationMonths: 6,
    stage: "result",
    answers: {
      q1: "BPBD Kota Padang membutuhkan pemetaan spasial otomatis.",
      q2: "Data topografi dan curah hujan."
    },
    documentData: {
      id: "doc-123",
      title: "Sistem Informasi Geografis Pemetaan Daerah Rawan Longsor",
      category: "skripsi",
      institution: "Universitas Negeri Padang",
      facultyMajor: "Teknik Informatika",
      targetEntity: "BPBD Kota Padang",
      targetDepartment: "Divisi Pencegahan & Kesiapsiagaan",
      durationMonths: 6,
      candidateName: "Ilham Maulana",
      candidateId: "20076012",
      generationDate: "2026-10-28",
      executiveSummary: "Ringkasan eksekutif penelitian...",
      bab1: {
        title: "BAB I: PENDAHULUAN",
        latarBelakang: ["Latar belakang penelitian spasial."],
        rumusanMasalah: ["Bagaimana model spasial diimplementasikan?"],
        batasanMasalah: ["Kota Padang"],
        tujuanUmum: "Tujuan umum",
        tujuanKhusus: ["Tujuan khusus 1"],
        manfaatMahasiswa: [],
        manfaatInstansi: [],
        manfaatAkademik: []
      },
      bab2: {
        title: "BAB II: TINJAUAN PUSTAKA",
        profilInstansi: "Profil BPBD",
        visiMisi: [],
        strukturOrganisasi: "",
        landasanTeori: [
          {
            topic: "Sistem Informasi Geografis",
            elaboration: "SIG adalah sistem komputer...",
            citation: "(Burrough, 2015)"
          }
        ]
      },
      bibliography: [
        {
          id: 1,
          author: "Burrough, P. A.",
          year: "2015",
          title: "Principles of Geographical Information Systems",
          source: "Oxford University Press",
          doiUrl: "https://doi.org/10.1093/oso/9780198233657.001.0001"
        }
      ]
    } as any,
    treeGraph: {
      id: "root",
      label: "Sistem Informasi Geografis",
      type: "root",
      category: "skripsi",
      status: "ready",
      thinkingMode: "first-principles",
      description: "Root node",
      contentSnippet: "Overview",
      children: []
    },
    createdAt: "2026-10-28T00:00:00.000Z",
    updatedAt: "2026-10-28T00:00:00.000Z"
  };

  // 1. Export to JSON string
  const jsonOutput = exportProjectAsJson(sampleProject);
  assert.ok(typeof jsonOutput === "string");
  assert.ok(jsonOutput.includes("Sistem Informasi Geografis Pemetaan"));

  // 2. Import from JSON string
  const restored = importProjectFromJson(jsonOutput);
  assert.strictEqual(restored.title, sampleProject.title);
  assert.strictEqual(restored.category, sampleProject.category);
  assert.strictEqual(restored.targetEntity, sampleProject.targetEntity);
  assert.strictEqual(restored.documentData?.bibliography?.length, 1);
  assert.strictEqual(restored.documentData?.bibliography?.[0].author, "Burrough, P. A.");
  assert.ok(restored.id.startsWith("proj-"));
  assert.ok(restored.updatedAt);
});

test("importProjectFromJson throws descriptive error on invalid format", () => {
  assert.throws(() => {
    importProjectFromJson(JSON.stringify({ notAProject: true }));
  }, /Format file proyek tidak valid/);
});
