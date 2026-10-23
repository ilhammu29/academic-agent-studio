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

export interface ResearchGapItem {
  no: number;
  authorYear: string;
  titleJournal: string;
  designSample: string;
  variables: string;
  findingsEffect: string;
  gapDifference: string;
}

export interface OperationalDefinitionItem {
  variable: string;
  definition: string;
  parameterTool: string;
  indicatorScale: string;
}

export interface ApprovalSigner {
  role: string;
  name: string;
  idNumber: string; // NIP / NIDN
}

export interface ApprovalSheetInfo {
  title: string;
  approvalDate: string;
  primarySigners: ApprovalSigner[];
  headSigner: ApprovalSigner;
}

export interface BudgetItem {
  item: string;
  category: string;
  cost: number;
}

export interface BibliographyItem {
  id: number;
  author: string;
  year: string;
  title: string;
  source: string;
  doiUrl?: string;
}

export interface CampusGuideline {
  campusName: string;
  facultyMajor?: string;
  guideDocTitle?: string;
  paperSize: 'A4' | 'Letter';
  margins: {
    topCm: number;
    bottomCm: number;
    leftCm: number;
    rightCm: number;
  };
  typography: {
    fontFamily: string;
    bodySizePt: number;
    heading1SizePt: number;
    lineSpacing: number;
  };
  headingStyle: 'decimal' | 'alphanumeric' | 'roman';
  citationStyle: 'apa' | 'ieee' | 'harvard' | 'vancouver';
  approvalConfig: {
    supervisorCount: number;
    requiresHeadOfProgram: boolean;
    requiresDeanOrFieldMentor: boolean;
  };
  customChapters?: {
    chapterKey: string;
    chapterTitle: string;
    mandatorySections: string[];
  }[];
  extractedNotes?: string[];
}

export interface ProposalDocument {
  id: string;
  title: string;
  category: ProposalCategory;
  campusGuideline?: CampusGuideline;
  institution: string;
  facultyMajor: string;
  targetEntity: string;
  targetDepartment: string;
  durationMonths: number;
  candidateName: string;
  candidateId: string;
  generationDate: string;
  executiveSummary: string;
  approvalSheet?: ApprovalSheetInfo;
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
    profilInstansi: string; // Used for Magang
    visiMisi: string[];     // Used for Magang
    strukturOrganisasi: string; // Used for Magang
    landasanTeori: { topic: string; elaboration: string; citation: string }[];
    researchGapMatrix?: ResearchGapItem[]; // Used for Skripsi / Penelitian
    conceptualFramework?: string;          // Used for Skripsi / Penelitian
    hypotheses?: string[];                 // Used for Skripsi / Penelitian
  };
  bab3: {
    title: string;
    metodePelaksanaan: string;
    lingkupPekerjaan: string[];
    perangkatTools: string[];
    rencanaKompetensi: string[];
    operationalDefinitions?: OperationalDefinitionItem[]; // Used for Skripsi
    populationSample?: string;                            // Used for Skripsi
    ethicalConsiderations?: string;                       // Used for Skripsi
    wbsScope?: string[];                                  // Used for Magang
    mentorshipModel?: string;                             // Used for Magang
  };
  bab4: {
    title: string;
    jadwalMatriks: WeeklyScheduleItem[];
    rencanaAnggaran?: string;
    budgetPlan?: BudgetItem[];        // Used for Skripsi
    disseminationPlan?: string;       // Used for Skripsi
    penutup: string;
  };
  bab5?: {
    title: string;
    kesimpulanUsulan: string[];
    kontribusiPraktis: string[];
    mitigasiRisiko: { risiko: string; mitigasi: string }[];
    sustainabilityPlan?: string;
  };
  appendices?: {
    id: string;
    title: string;
    content: string;
    tableRows?: { col1: string; col2: string; col3: string }[];
  }[];
  documentDepth?: 'proposal' | 'comprehensive';
  bibliography?: BibliographyItem[];
  slides: SlideDeckItem[];
  auditLog: {
    rule: string;
    status: 'VERIFIED' | 'PASS';
    details: string;
    thinkingMode: string;
  }[];
}
