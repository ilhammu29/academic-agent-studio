export type ProposalCategory = 'magang' | 'skripsi' | 'penelitian';

export type ReportType = 'magang' | 'skripsi' | 'tugas_akhir' | 'tesis' | 'penelitian' | 'laporan_pkl_unp' | 'laporan_magang';

export type StudioStage = 'input' | 'interview' | 'orchestration' | 'result' | 'slides' | 'drive' | 'consultation';

export type SheetType = 'pengesahan' | 'berita_acara' | 'pernyataan_orisinalitas' | 'kata_pengantar' | 'abstrak' | 'custom_upload';

export interface CustomSheetItem {
  id: string;
  type: SheetType;
  title: string;
  pagePosition?: number; // e.g. 2 for after cover, 3, 4, etc.
  content?: string;
  englishContent?: string; // For abstract
  uploadedFileUrl?: string; // Base64 or URL of scanned doc
  fileDataUrl?: string; // Alias for uploaded scan image
  signers?: ApprovalSigner[];
  metaNotes?: string;
  enabled?: boolean;
}

export interface DocumentFigureItem {
  id: string;
  chapterKey: 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5' | 'lampiran';
  chapterPlacement?: number; // Numeric chapter placement (e.g. 2, 3, 4)
  subSectionKey?: string;
  figureNumber: string; // e.g. "Gambar 3.1"
  title: string;
  caption: string;
  imageUrl?: string;
  imageDataUrl?: string; // Base64 or URL data source
  sourceText?: string;
  source?: string; // Alias for source text
  placementRationale?: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  timeRange?: string;
  weekNumber?: number;
  hoursSpent?: number | string;
  activity: string;
  activityDescription?: string;
  output: string;
  outputDeliverable?: string;
  mentorFeedback?: string;
  mentorApprovalStatus?: 'approved' | 'draft' | 'pending';
  status?: 'verified' | 'pending' | 'revised';
  evidenceUrl?: string;
}

export interface DefenseMinutesInfo {
  id?: string;
  sessionType?: 'bimbingan' | 'seminar_proposal' | 'sidang_akhir';
  date?: string;
  meetingDate?: string;
  time?: string;
  roomOrPlatform?: string;
  examiners?: { role: string; name: string; nip?: string; idNumber?: string; attendance?: 'hadir' | 'izin' }[];
  candidateScore?: number;
  averageScore?: number;
  gradeResult?: 'Lulus Tanpa Revisi' | 'Lulus dengan Revisi Minor' | 'Lulus dengan Revisi Mayor' | 'Sidang Ulang' | string;
  status?: string;
  revisionNotes?: string[];
  revisions?: { id?: string | number; section: string; revisionPoint: string; isCompleted?: boolean }[];
  signatureReady?: boolean;
}

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
  id?: string;
  campusName: string;
  facultyMajor?: string;
  guideDocTitle?: string;
  badge?: string;
  description?: string;
  chapterCount?: number;
  numberingSystem?: 'decimal' | 'alphanumeric' | 'roman';
  rules?: string[];
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
    tableFontSizePt?: number;
    tableLineSpacing?: number;
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
  reportType?: ReportType;
  campusGuideline?: CampusGuideline;
  campusLogoUrl?: string;
  institution: string;
  facultyMajor: string;
  targetEntity: string;
  targetDepartment: string;
  durationMonths: number;
  candidateName: string;
  candidateId: string;
  generationDate: string;
  executiveSummary: string;
  targetDepthPages?: number;
  preface?: string;
  abstractId?: string;
  abstractEn?: string;
  approvalSheet?: ApprovalSheetInfo;
  customSheets?: CustomSheetItem[];
  documentFigures?: DocumentFigureItem[];
  logbookEntries?: LogbookEntry[];
  defenseMinutes?: DefenseMinutesInfo;
  preliminaryOptions?: {
    includeToC: boolean;
    includeListOfFigures: boolean;
    includeListOfTables: boolean;
    includePreface: boolean;
    includeAbstract: boolean;
  };
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
    ganttSchedule?: any[];
    anggaranBiaya?: any[];
    rencanaAnggaran?: string;
    budgetPlan?: BudgetItem[];        // Used for Skripsi
    disseminationPlan?: string;       // Used for Skripsi
    penutup: string;
  };
  bab5?: {
    title: string;
    kesimpulanUsulan: string[];
    kesimpulanUmum?: string;
    saranPraktis?: string[];
    kontribusiTeoretis?: string;
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
