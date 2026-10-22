export type ProposalCategory = 'magang' | 'skripsi' | 'penelitian';

export type StudioStage = 'input' | 'interview' | 'orchestration' | 'result' | 'drive';

export interface DiagnosticQuestion {
  id: string;
  field: string;
  question: string;
  contextHint: string;
  placeholder: string;
  aiSuggestion: string;
  thinkingModeApplied: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  colorAccent: string;
  status: 'idle' | 'thinking' | 'working' | 'completed';
  progress: number;
  currentTask: string;
  logs: string[];
  deliverableSummary?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  type: 'root' | 'chapter' | 'section' | 'deliverable';
  category: string;
  status: 'pending' | 'processing' | 'ready';
  thinkingMode: string;
  description: string;
  contentSnippet: string;
  children?: TreeNode[];
}

export interface WeeklyScheduleItem {
  week: number;
  phase: string;
  activities: string[];
  output: string;
  competencyTarget: string;
}

export interface SlideDeckItem {
  slideNumber: number;
  kicker: string;
  title: string;
  subtitle: string;
  keyPoints: string[];
  speakerNotes: string;
}

export interface ProposalDocument {
  id: string;
  title: string;
  category: ProposalCategory;
  institution: string;
  facultyMajor: string;
  targetEntity: string;
  targetDepartment: string;
  durationMonths: number;
  candidateName: string;
  candidateId: string;
  generationDate: string;
  executiveSummary: string;
  bab1: {
    title: string;
    latarBelakang: string[];
    rumusanMasalah: string[];
    batasanMasalah: string[];
    tujuanUmum: string;
    tujuanKhusus: string[];
    manfaatMahasiswa: string[];
    manfaatInstansi: string[];
    manfaatAkademik: string[];
  };
  bab2: {
    title: string;
    profilInstansi: string;
    visiMisi: string[];
    strukturOrganisasi: string;
    landasanTeori: { topic: string; elaboration: string; citation: string }[];
  };
  bab3: {
    title: string;
    metodePelaksanaan: string;
    lingkupPekerjaan: string[];
    perangkatTools: string[];
    rencanaKompetensi: string[];
  };
  bab4: {
    title: string;
    jadwalMatriks: WeeklyScheduleItem[];
    rencanaAnggaran?: string;
    penutup: string;
  };
  slides: SlideDeckItem[];
  auditLog: {
    rule: string;
    status: 'VERIFIED' | 'PASS';
    details: string;
    thinkingMode: string;
  }[];
}
