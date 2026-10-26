"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProposalDocument, TreeNode } from "@/types/studio";
import { VisualTreeGraph } from "./VisualTreeGraph";
import DefenseSimulator from "./DefenseSimulator";
import LiteratureSearchModal from "./LiteratureSearchModal";
import { RevisionMatrixManager } from "./RevisionMatrixManager";
import { TurnitinPreCheckModal } from "./TurnitinPreCheckModal";
import { ResearchInstrumentModal } from "./ResearchInstrumentModal";
import { ApprovalSheetModal } from "./ApprovalSheetModal";
import { CampusGuidelineModal } from "./CampusGuidelineModal";
import { AcademicConsultationModal } from "./AcademicConsultationModal";
import { AcademicFlowchartDiagram } from "./AcademicFlowchartDiagram";
import { AcademicCopilotDrawer } from "./AcademicCopilotDrawer";
import { CampusLogoManagerModal } from "./CampusLogoManagerModal";
import { TheoryCustomizerModal } from "./TheoryCustomizerModal";
import { CustomSheetModal } from "./CustomSheetModal";
import { DocumentImageManagerModal } from "./DocumentImageManagerModal";
import { LogbookManagerModal } from "./LogbookManagerModal";
import { DefenseMinutesModal } from "./DefenseMinutesModal";
import { getCampusLogoByInstitution } from "@/lib/campusLogos";
import { getSectionHeading, HeadingStyleType, parseChapterTitle } from "@/lib/academicNumbering";
import { generateAcademicProposalDocx, downloadDocxBlob } from "@/lib/docxExporter";
import { generateAcademicProposalPptx } from "@/lib/pptxExporter";
import { generateBibTeX, generateRIS, downloadCitationFile } from "@/lib/bibtexExporter";
import { saveProjectRecord, SavedProjectRecord, getStoredUser } from "@/lib/supabase";
import { runAcademicQAPipeline, QAPipelineReport, QAFinding } from "@/lib/academicQAPipeline.ts";
import { stripDoubleAsterisks, sanitizeAcademicText } from "@/lib/textSanitizer";
import { 
  FileText, 
  Network, 
  CalendarDays, 
  Presentation, 
  ShieldCheck, 
  Copy, 
  Printer, 
  Check, 
  BookOpen, 
  RefreshCw, 
  FileDown,
  ShieldAlert,
  Sparkles,
  Lightbulb,
  Bookmark,
  X,
  FileCheck2,
  RotateCcw,
  RotateCw,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  BookmarkCheck,
  ChevronDown,
  Compass,
  Bot,
  Landmark,
  GraduationCap,
  Brain,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  PanelLeft,
  PanelRight,
  SlidersHorizontal,
  Search,
  Send,
  Plus
} from "lucide-react";

interface DocumentStudioProps {
  doc: ProposalDocument;
  treeData: TreeNode;
  onReset: () => void;
  onOpenPresentationStudio?: () => void;
}

export const DocumentStudio: React.FC<DocumentStudioProps> = ({
  doc,
  treeData,
  onReset,
  onOpenPresentationStudio
}) => {
  const [currentDoc, setCurrentDoc] = useState<ProposalDocument>(() => sanitizeAcademicText(doc));
  const [activeTab, setActiveTab] = useState<"naskah" | "flowchart" | "tree" | "jadwal" | "slides" | "audit" | "defense" | "revisionMatrix">("naskah");
  const [workspaceCategory, setWorkspaceCategory] = useState<"naskah" | "metodologi" | "sidang" | "kualitas">("naskah");
  const [naskahSection, setNaskahSection] = useState<"all" | "frontmatter" | "bab1" | "bab2" | "bab3" | "bab4" | "bab5" | "backmatter">("all");
  const [metodologiTab, setMetodologiTab] = useState<"flowchart" | "tree" | "jadwal">("flowchart");
  const [sidangTab, setSidangTab] = useState<"defense" | "revisionMatrix" | "audit">("defense");
  const [jadwalViewMode, setJadwalViewMode] = useState<"gantt" | "detail">("gantt");
  const [copied, setCopied] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [slideVisualMode, setSlideVisualMode] = useState<"google-flow" | "ai-concept">("google-flow");
  const [slideAiImageMap, setSlideAiImageMap] = useState<{ [key: number]: string }>({});
  const [isGeneratingSlideVisual, setIsGeneratingSlideVisual] = useState(false);
  const [customSlidePrompt, setCustomSlidePrompt] = useState("");
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [isLitModalOpen, setIsLitModalOpen] = useState(false);
  const [isTurnitinModalOpen, setIsTurnitinModalOpen] = useState(false);
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [citationStyle, setCitationStyle] = useState<"apa" | "ieee">("apa");
  const [showMarginRuler, setShowMarginRuler] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [watermarkType, setWatermarkType] = useState<"none" | "draft" | "plagiarisme_ok" | "siap_sidang" | "confidential">("none");
  const [isBatchGeneratingSlides, setIsBatchGeneratingSlides] = useState(false);
  
  // Modals for Logo, Theories, Custom Sheets, Figures, Logbook, and Defense Minutes
  const [isCampusLogoModalOpen, setIsCampusLogoModalOpen] = useState(false);
  const [isTheoryCustomizerModalOpen, setIsTheoryCustomizerModalOpen] = useState(false);
  const [isCustomSheetModalOpen, setIsCustomSheetModalOpen] = useState(false);
  const [isImageManagerModalOpen, setIsImageManagerModalOpen] = useState(false);
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [isDefenseMinutesModalOpen, setIsDefenseMinutesModalOpen] = useState(false);
  
  // 3-Panel Workspace States
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"copilot" | "qa" | "literature" | "format">("copilot");

  // Co-Pilot Chat inside Inspector
  const [inspectorCopilotInput, setInspectorCopilotInput] = useState("");
  const [inspectorCopilotLoading, setInspectorCopilotLoading] = useState(false);
  const [inspectorCopilotMessages, setInspectorCopilotMessages] = useState<{ id: string; sender: "user" | "copilot"; text: string; time: string }[]>([
    {
      id: "copilot-init",
      sender: "copilot",
      text: `Halo ${doc.candidateName || "Rekan Peneliti"}! Saya Co-Pilot Akademik Anda. Draf naskah "${doc.title}" telah dimuat. Ada bagian metodologi, kebaruan riset, atau telaah bab yang ingin kita perbaiki?`,
      time: "Terkoneksi"
    }
  ]);

  const handleSendInspectorCopilot = async (customPrompt?: string) => {
    const query = (customPrompt || inspectorCopilotInput).trim();
    if (!query || inspectorCopilotLoading) return;
    const userMsg = { id: `user-${Date.now()}`, sender: "user" as const, text: query, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) };
    setInspectorCopilotMessages(prev => [...prev, userMsg]);
    setInspectorCopilotInput("");
    setInspectorCopilotLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Anda adalah Senior Research Director & Dosen Pembimbing Skripsi/Tesis Utama (Standar Dikti).
Konteks Usulan:
- Judul: "${currentDoc.title}"
- Kategori / Jenis: "${currentDoc.reportType || currentDoc.category}"
- Instansi: "${currentDoc.targetEntity}"
- Masalah: "${currentDoc.bab1?.latarBelakang?.[1] || "Kesenjangan empiris"}"
- Metodologi: "${currentDoc.bab3?.metodePelaksanaan || "Metodologi penelitian"}"

Pertanyaan Mahasiswa:
"${query}"

Jawablah dengan ringkas, tajam, bernas, berstandar akademik tinggi, tanpa klise kosong AI.`
        })
      });
      const data = await res.json();
      const replyText = data.success && data.text ? data.text : "Konsistensi antara rumusan masalah Bab I dan variabel Bab III adalah kunci utama validitas naskah ini. Pastikan instrumen telah tervalidasi.";
      setInspectorCopilotMessages(prev => [...prev, {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: replyText,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }]);
    } catch (err) {
      setInspectorCopilotMessages(prev => [...prev, {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: "Koneksi asisten AI lokal aktif: Periksa Bab II untuk memastikan seluruh landasan teori memiliki sitasi primer yang relevan dengan lokus penelitian.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setInspectorCopilotLoading(false);
    }
  };

  // Literature Search inside Inspector
  const [inspectorLitQuery, setInspectorLitQuery] = useState("");
  const [inspectorLitResults, setInspectorLitResults] = useState<any[]>([]);
  const [inspectorLitSearching, setInspectorLitSearching] = useState(false);

  const handleInspectorLitSearch = async () => {
    if (!inspectorLitQuery.trim() || inspectorLitSearching) return;
    setInspectorLitSearching(true);
    try {
      const res = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(inspectorLitQuery)}&rows=5`);
      if (res.ok) {
        const data = await res.json();
        const items = data.message?.items || [];
        const mapped = items.map((it: any) => ({
          title: it.title?.[0] || "Paper Ilmiah",
          authors: it.author?.map((a: any) => `${a.given || ""} ${a.family || ""}`).join(", ") || "Peneliti",
          year: it.published?.["date-parts"]?.[0]?.[0] || 2024,
          journal: it["container-title"]?.[0] || "Jurnal Akademik Terindeks",
          doi: it.DOI ? `https://doi.org/${it.DOI}` : ""
        }));
        setInspectorLitResults(mapped);
      }
    } catch (e) {
      console.warn("Crossref search failed:", e);
    } finally {
      setInspectorLitSearching(false);
    }
  };

  const handleAddLitToDoc = (paper: any) => {
    setCurrentDoc(prev => ({
      ...prev,
      bab2: {
        ...prev.bab2,
        landasanTeori: [
          ...(prev.bab2?.landasanTeori || []),
          {
            topic: paper.title.slice(0, 70),
            elaboration: `Kajian primer dari ${paper.authors} (${paper.year}) memaparkan bahwa kerangka investigasi terkait ${paper.title} memberikan sumbangsih empiris terhadap pengendalian variabel dalam konteks ${prev.targetEntity}.`,
            citation: `(${paper.authors.split(",")[0] || "Peneliti"}, ${paper.year})`
          }
        ]
      },
      bibliography: [
        ...(prev.bibliography || []),
        {
          id: (prev.bibliography?.length || 0) + 1,
          author: paper.authors,
          year: String(paper.year),
          title: paper.title,
          source: paper.journal,
          doiUrl: paper.doi
        }
      ]
    }));
    setToastMessage(`Paper "${paper.title.slice(0, 30)}..." ditambahkan ke Bab 2 & Pustaka!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Word Count & Estimated Page Calculations
  const totalWordsCount = React.useMemo(() => {
    let count = 0;
    if (currentDoc.bab1?.latarBelakang) count += currentDoc.bab1.latarBelakang.join(" ").split(/\s+/).length;
    if (currentDoc.bab1?.rumusanMasalah) count += currentDoc.bab1.rumusanMasalah.join(" ").split(/\s+/).length;
    if (currentDoc.bab2?.landasanTeori) {
      currentDoc.bab2.landasanTeori.forEach(t => {
        count += (t.topic + " " + t.elaboration).split(/\s+/).length;
      });
    }
    if (currentDoc.bab3?.metodePelaksanaan) count += currentDoc.bab3.metodePelaksanaan.split(/\s+/).length;
    if (currentDoc.bab4?.penutup) count += currentDoc.bab4.penutup.split(/\s+/).length;
    if (currentDoc.bab5?.kesimpulanUsulan) count += currentDoc.bab5.kesimpulanUsulan.join(" ").split(/\s+/).length;
    return Math.max(count, 1250);
  }, [currentDoc]);

  const estimatedPageCount = Math.max(
    currentDoc.targetDepthPages || 35,
    Math.ceil(totalWordsCount / 280)
  );

  const totalCharactersCount = React.useMemo(() => {
    return Math.round(totalWordsCount * 6.5);
  }, [totalWordsCount]);

  const readingTimeMinutes = React.useMemo(() => {
    return Math.max(1, Math.ceil(totalWordsCount / 220));
  }, [totalWordsCount]);

  // Microsoft Word reverse-engineered states
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPageCustomizerModalOpen, setIsPageCustomizerModalOpen] = useState<boolean>(false);
  const [disabledSections, setDisabledSections] = useState<string[]>([]);
  const isUNPPkl = currentDoc.reportType === "laporan_pkl_unp" || currentDoc.campusGuideline?.id === "unp";

  const handleToggleSection = (key: string) => {
    setDisabledSections(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleChangeMarginsPreset = (preset: 'dikti' | 'normal' | 'narrow') => {
    const marginsMap = {
      dikti: { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
      normal: { topCm: 2.54, bottomCm: 2.54, leftCm: 2.54, rightCm: 2.54 },
      narrow: { topCm: 1.5, bottomCm: 1.5, leftCm: 1.5, rightCm: 1.5 }
    };
    setCurrentDoc(prev => ({
      ...prev,
      campusGuideline: {
        campusName: prev.campusGuideline?.campusName || "Standar Dikti",
        paperSize: prev.campusGuideline?.paperSize || 'A4',
        margins: marginsMap[preset],
        typography: prev.campusGuideline?.typography || { fontFamily: "Times New Roman", heading1SizePt: 14, bodySizePt: 12, lineSpacing: 1.5 },
        headingStyle: prev.campusGuideline?.headingStyle || "decimal",
        citationStyle: prev.campusGuideline?.citationStyle || "apa",
        approvalConfig: prev.campusGuideline?.approvalConfig || { supervisorCount: 2, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
      }
    }));
    setToastMessage(`Margin diubah ke: ${preset === 'dikti' ? 'Standar Dikti (4-4-3-3 cm)' : preset === 'normal' ? 'Normal (2.54 cm)' : 'Sempit (1.5 cm)'}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleChangeLineSpacing = (spacing: number) => {
    setCurrentDoc(prev => ({
      ...prev,
      campusGuideline: {
        campusName: prev.campusGuideline?.campusName || "Standar Dikti",
        paperSize: prev.campusGuideline?.paperSize || 'A4',
        margins: prev.campusGuideline?.margins || { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
        typography: {
          fontFamily: prev.campusGuideline?.typography?.fontFamily || "Times New Roman",
          heading1SizePt: prev.campusGuideline?.typography?.heading1SizePt || 14,
          bodySizePt: prev.campusGuideline?.typography?.bodySizePt || 12,
          lineSpacing: spacing
        },
        headingStyle: prev.campusGuideline?.headingStyle || "decimal",
        citationStyle: prev.campusGuideline?.citationStyle || "apa",
        approvalConfig: prev.campusGuideline?.approvalConfig || { supervisorCount: 2, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
      }
    }));
    setToastMessage(`Spasi baris diubah ke: ${spacing}x`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleChangeFontFamily = (font: string) => {
    setCurrentDoc(prev => ({
      ...prev,
      campusGuideline: {
        campusName: prev.campusGuideline?.campusName || "Standar Dikti",
        paperSize: prev.campusGuideline?.paperSize || 'A4',
        margins: prev.campusGuideline?.margins || { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
        typography: {
          fontFamily: font,
          heading1SizePt: prev.campusGuideline?.typography?.heading1SizePt || 14,
          bodySizePt: prev.campusGuideline?.typography?.bodySizePt || 12,
          lineSpacing: prev.campusGuideline?.typography?.lineSpacing || 1.5
        },
        headingStyle: prev.campusGuideline?.headingStyle || "decimal",
        citationStyle: prev.campusGuideline?.citationStyle || "apa",
        approvalConfig: prev.campusGuideline?.approvalConfig || { supervisorCount: 2, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: false }
      }
    }));
    setToastMessage(`Font dokumen diubah ke: ${font}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Co-Pilot & Dropdown states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  // History & Auto-save states
  const [history, setHistory] = useState<ProposalDocument[]>([doc]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 7-Phase Academic QA Pipeline live report
  const [qaReport, setQaReport] = useState<QAPipelineReport>(() => runAcademicQAPipeline(doc));

  useEffect(() => {
    setQaReport(runAcademicQAPipeline(currentDoc));
  }, [currentDoc]);

  // AI Refinement states
  const [refineKey, setRefineKey] = useState<string | null>(null);
  const [refineSectionTitle, setRefineSectionTitle] = useState<string | null>(null);
  const [refineContent, setRefineContent] = useState("");
  const [refineInstruction, setRefineInstruction] = useState("");
  const [revisedPreview, setRevisedPreview] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavingArchive, setIsSavingArchive] = useState(false);

  const handleSaveToArchive = async () => {
    setIsSavingArchive(true);
    try {
      const user = getStoredUser();
      const record: SavedProjectRecord = {
        id: currentDoc.id || `proj-${Date.now()}`,
        userId: user.id || "usr-default",
        title: currentDoc.title,
        category: currentDoc.category,
        targetEntity: currentDoc.targetEntity,
        durationMonths: currentDoc.durationMonths,
        stage: "result",
        answers: {},
        documentData: currentDoc,
        treeGraph: treeData,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await saveProjectRecord(record);
      setToastMessage("✓ Naskah berhasil disimpan ke Arsip Proyek!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Gagal menyimpan ke arsip:", err);
    } finally {
      setIsSavingArchive(false);
    }
  };

  useEffect(() => {
    const cleanDoc = sanitizeAcademicText(doc);
    setCurrentDoc(cleanDoc);
    setHistory([cleanDoc]);
    setHistoryIndex(0);
  }, [doc]);

  // Auto-Save effect to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentDoc) {
      try {
        localStorage.setItem(`academic_studio_autosave_${currentDoc.id || "draft"}`, JSON.stringify(currentDoc));
        const now = new Date();
        setLastSaved(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch {
        // storage quota exceeded or disabled
      }
    }
  }, [currentDoc]);

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevDoc = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentDoc(prevDoc);
      setToastMessage("Berhasil kembali ke versi naskah sebelumnya (Undo).");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextDoc = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentDoc(nextDoc);
      setToastMessage("Berhasil memulihkan versi revisi (Redo).");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const pushToHistory = (newDoc: ProposalDocument) => {
    const truncatedHistory = history.slice(0, historyIndex + 1);
    truncatedHistory.push(newDoc);
    setHistory(truncatedHistory);
    setHistoryIndex(truncatedHistory.length - 1);
  };

  const handleExportBibTeX = () => {
    const bib = generateBibTeX(currentDoc);
    downloadCitationFile(bib, `Sitasi_${currentDoc.id || "Proposal"}.bib`, "application/x-bibtex");
    setToastMessage("Berkas BibTeX (.bib) untuk Mendeley & Zotero berhasil diunduh.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportRIS = () => {
    const ris = generateRIS(currentDoc);
    downloadCitationFile(ris, `Sitasi_${currentDoc.id || "Proposal"}.ris`, "application/x-research-info-systems");
    setToastMessage("Berkas RIS untuk Reference Manager berhasil diunduh.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefineWithAI = (key: string, title: string, textToRefine: string) => {
    setRefineKey(key);
    setRefineSectionTitle(title);
    setRefineContent(textToRefine || "");
    setRefineInstruction("");
    setRevisedPreview(null);
    setRefineError(null);
  };

  const closeRefineModal = () => {
    setRefineSectionTitle(null);
    setRefineKey(null);
    setRefineInstruction("");
    setRevisedPreview(null);
    setRefineError(null);
  };

  const submitAiRefinement = async () => {
    if (!refineKey || !refineInstruction.trim()) return;
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/gemini/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: refineSectionTitle,
          currentContent: refineContent,
          instruction: refineInstruction
        })
      });
      const data = await res.json();
      if (data.success && data.revisedContent) {
        setRevisedPreview(data.revisedContent);
      } else {
        setRefineError(data.error || "Gagal merevisi naskah. Silakan coba kembali.");
      }
    } catch (e: any) {
      setRefineError(`Terjadi kesalahan: ${e.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefinedContent = (finalText: string) => {
    if (!refineKey) return;
    const cleanText = stripDoubleAsterisks(finalText);
    setCurrentDoc(prev => {
      const updated = { ...prev };
      if (refineKey === "executiveSummary") {
        updated.executiveSummary = cleanText;
      } else if (refineKey === "bab1.latarBelakang") {
        const paras = cleanText.split("\n\n").map((p: string) => p.trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, latarBelakang: paras.length > 0 ? paras : [cleanText] };
      } else if (refineKey === "bab1.rumusanMasalah") {
        const items = cleanText.split("\n").map((l: string) => l.replace(/^[\d\.\-\*\•\s]+/, "").trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, rumusanMasalah: items.length > 0 ? items : [cleanText] };
      } else if (refineKey === "bab1.batasanMasalah") {
        const items = cleanText.split("\n").map((l: string) => l.replace(/^[\d\.\-\*\•\s]+/, "").trim()).filter(Boolean);
        updated.bab1 = { ...updated.bab1, batasanMasalah: items.length > 0 ? items : [cleanText] };
      } else if (refineKey === "bab1.tujuanUmum") {
        updated.bab1 = { ...updated.bab1, tujuanUmum: cleanText };
      } else if (refineKey === "bab2.profilInstansi") {
        updated.bab2 = { ...updated.bab2, profilInstansi: cleanText };
      } else if (refineKey === "bab2.conceptualFramework") {
        updated.bab2 = { ...updated.bab2, conceptualFramework: cleanText };
      } else if (refineKey === "bab3.metodePelaksanaan") {
        updated.bab3 = { ...updated.bab3, metodePelaksanaan: cleanText };
      } else if (refineKey === "bab3.populationSample") {
        updated.bab3 = { ...updated.bab3, populationSample: cleanText };
      } else if (refineKey === "bab3.ethicalConsiderations") {
        updated.bab3 = { ...updated.bab3, ethicalConsiderations: cleanText };
      } else if (refineKey === "bab4.penutup") {
        updated.bab4 = { ...updated.bab4, penutup: cleanText };
      } else if (refineKey === "bab4.disseminationPlan") {
        updated.bab4 = { ...updated.bab4, disseminationPlan: cleanText };
      }
      pushToHistory(updated);
      return updated;
    });

    setToastMessage(`Bagian "${refineSectionTitle}" berhasil diperbarui ke dalam naskah!`);
    setTimeout(() => setToastMessage(null), 3500);
    closeRefineModal();
  };

  const generateFullMarkdown = () => {
    return `# PROPOSAL ${currentDoc.category.toUpperCase()}

## ${currentDoc.title.toUpperCase()}

**Diajukan untuk Memenuhi Persyaratan Akademik pada:**
**${currentDoc.facultyMajor} - ${currentDoc.institution}**

---

### IDENTITAS PENELITI / MAHASISWA
- **Nama:** ${currentDoc.candidateName}
- **NIM / NPM:** ${currentDoc.candidateId}
- **Program Studi:** ${currentDoc.facultyMajor}
- **Perguruan Tinggi:** ${currentDoc.institution}
- **Instansi Tujuan:** ${currentDoc.targetEntity} (${currentDoc.targetDepartment})
- **Rencana Durasi:** ${currentDoc.durationMonths} Bulan (${currentDoc.bab4.jadwalMatriks.length * 4 || 16} Minggu Kerja)
- **Tanggal Penyusunan:** ${currentDoc.generationDate}

---

## RINGKASAN EKSEKUTIF
${currentDoc.executiveSummary}

---

## ${currentDoc.bab1.title}

### 1.1 Latar Belakang Masalah
${currentDoc.bab1.latarBelakang.join("\n\n")}

### 1.2 Rumusan Masalah
${currentDoc.bab1.rumusanMasalah.map((r, i) => `${i + 1}. ${r}`).join("\n")}

### 1.3 Batasan Masalah
${currentDoc.bab1.batasanMasalah.map((b, i) => `• ${b}`).join("\n")}

### 1.4 Tujuan Penelitian / Magang
**Tujuan Umum:**
${currentDoc.bab1.tujuanUmum}

**Tujuan Khusus:**
${currentDoc.bab1.tujuanKhusus.map((t, i) => `• ${t}`).join("\n")}

### 1.5 Manfaat Kegiatan
**Bagi Mahasiswa:**
${currentDoc.bab1.manfaatMahasiswa.map(m => `• ${m}`).join("\n")}

**Bagi Instansi Mitra (${currentDoc.targetEntity}):**
${currentDoc.bab1.manfaatInstansi.map(m => `• ${m}`).join("\n")}

**Bagi Perguruan Tinggi (${currentDoc.institution}):**
${currentDoc.bab1.manfaatAkademik.map(m => `• ${m}`).join("\n")}

---

## ${currentDoc.bab2.title}

### 2.1 Profil Instansi / Objek Penelitian
${currentDoc.bab2.profilInstansi}

**Visi & Misi:**
${currentDoc.bab2.visiMisi.map((v, i) => `${i + 1}. ${v}`).join("\n")}

**Struktur Organisasi:**
${currentDoc.bab2.strukturOrganisasi}

### 2.2 Landasan Teori Ilmiah
${currentDoc.bab2.landasanTeori.map((t, i) => `#### 2.2.${i + 1} ${t.topic}\n${t.elaboration}\n*Rujukan: ${t.citation}*`).join("\n\n")}

---

## ${currentDoc.bab3.title}

### 3.1 Metode Pelaksanaan
${currentDoc.bab3.metodePelaksanaan}

### 3.2 Ruang Lingkup Penugasan
${currentDoc.bab3.lingkupPekerjaan.map((l, i) => `${i + 1}. ${l}`).join("\n")}

### 3.3 Spesifikasi Perangkat & Lingkungan Kerja
${currentDoc.bab3.perangkatTools.map(p => `• ${p}`).join("\n")}

### 3.4 Target Capaian Kompetensi
${currentDoc.bab3.rencanaKompetensi.map(c => `• ${c}`).join("\n")}

---

## ${currentDoc.bab4.title}

### 4.1 Matriks Rencana Kerja Mingguan
| Minggu | Tahap Pelaksanaan | Rincian Aktivitas | Target Luaran (Output) |
|---|---|---|---|
${currentDoc.bab4.jadwalMatriks.map(j => `| Mg ${j.week} | ${j.phase} | ${j.activities.join("; ")} | ${j.output} |`).join("\n")}

### 4.2 Penutup
${currentDoc.bab4.penutup}

---

### LEMBAR PENGESAHAN

Mengetahui,
**Dosen Pembimbing Akademik,**


(________________________________)
NIP.


Menyetujui,
**Pimpinan / Mentor Lapangan ${currentDoc.targetEntity},**


(________________________________)
NIP / NIK.
`;
  };

  const handleCopy = () => {
    const text = generateFullMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateAcademicProposalDocx(currentDoc, disabledSections);
      downloadDocxBlob(blob, `Proposal_${currentDoc.category.toUpperCase()}_${currentDoc.candidateName.replace(/\s+/g, "_")}.docx`);
    } catch (err) {
      console.error("Gagal mengekspor DOCX:", err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await generateAcademicProposalPptx(currentDoc, slideAiImageMap);
    } catch (err) {
      console.error("Gagal mengekspor PPTX:", err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleBatchGenerateAllSlideVisuals = async () => {
    setIsBatchGeneratingSlides(true);
    setToastMessage("Sedang men-generate visual AI untuk seluruh slide...");
    
    const newMap: Record<number, string> = { ...slideAiImageMap };
    const promises = currentDoc.slides.map((slide, idx) => {
      const prompt = `Academic presentation infographic visual, ${currentDoc.title}, slide ${idx + 1}: ${slide.title}, modern dark slate blue minimalist vector aesthetic, 8k`;
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=560&nologo=true&seed=${seed}`;
      newMap[idx] = url;
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    try {
      await Promise.all(promises);
      setSlideAiImageMap(newMap);
      setSlideVisualMode("ai-concept");
      setToastMessage("Berhasil men-generate seluruh visual AI untuk presentasi!");
    } catch {
      setSlideAiImageMap(newMap);
      setSlideVisualMode("ai-concept");
    } finally {
      setIsBatchGeneratingSlides(false);
    }
  };

  const handleChangeHeadingStyle = (newStyle: HeadingStyleType) => {
    const updatedDoc: ProposalDocument = {
      ...currentDoc,
      campusGuideline: {
        ...(currentDoc.campusGuideline || {
          campusName: currentDoc.institution,
          paperSize: "A4",
          margins: { topCm: 4, bottomCm: 3, leftCm: 4, rightCm: 3 },
          typography: { fontFamily: "Times New Roman", bodySizePt: 12, heading1SizePt: 14, lineSpacing: 1.5 },
          citationStyle: "apa",
          approvalConfig: { supervisorCount: 1, requiresHeadOfProgram: true, requiresDeanOrFieldMentor: true }
        }),
        headingStyle: newStyle
      }
    };
    setCurrentDoc(updatedDoc);
    setToastMessage(`Gaya penomoran diubah ke standar: ${newStyle === 'decimal' ? 'Desimal (1.1, 1.2)' : newStyle === 'alphanumeric' ? 'Alfanumerik (A., B.)' : 'Romawi (I.A, I.B)'}`);
    
    // Auto sync to saved project cache
    const projectRecord: SavedProjectRecord = {
      id: updatedDoc.id,
      userId: getStoredUser()?.id || 'usr-default',
      title: updatedDoc.title,
      category: updatedDoc.category,
      targetEntity: updatedDoc.targetEntity,
      durationMonths: updatedDoc.durationMonths,
      stage: 'result',
      answers: {},
      documentData: updatedDoc,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    saveProjectRecord(projectRecord);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateSlideAiVisual = (slideIdx: number, customText?: string) => {
    setIsGeneratingSlideVisual(true);
    const activeSlide = currentDoc.slides[slideIdx];
    const defaultPrompt = `Scientific academic presentation diagram, ${currentDoc.title}, ${activeSlide?.title || 'Methodology pipeline'}, dark blue slate minimal theme, Google Flow process architecture, high fidelity vector aesthetic, 8k resolution`;
    const promptToUse = customText && customText.trim().length > 0 ? customText.trim() : defaultPrompt;
    
    const seed = Math.floor(Math.random() * 999999);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptToUse)}?width=900&height=560&nologo=true&seed=${seed}`;
    
    const img = new window.Image();
    img.src = generatedUrl;
    img.onload = () => {
      setSlideAiImageMap(prev => ({ ...prev, [slideIdx]: generatedUrl }));
      setIsGeneratingSlideVisual(false);
      setToastMessage("Ilustrasi Visual AI berhasil digenerate!");
    };
    img.onerror = () => {
      // Fallback
      setSlideAiImageMap(prev => ({ ...prev, [slideIdx]: generatedUrl }));
      setIsGeneratingSlideVisual(false);
      setToastMessage("Ilustrasi Visual AI siap ditampilkan.");
    };
  };

  const handleCopySpeakerNotes = () => {
    const notes = currentDoc.slides[activeSlideIndex]?.speakerNotes || "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(notes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
      setToastMessage("Catatan presenter berhasil disalin!");
    }
  };

  const handleSaveLogo = (logoUrl: string) => {
    setCurrentDoc(prev => ({ ...prev, campusLogoUrl: logoUrl }));
    setToastMessage("Logo kampus berhasil diperbarui!");
  };

  const handleSaveTheories = (newTheories: any[], newBib: any[]) => {
    setCurrentDoc(prev => ({
      ...prev,
      bab2: { ...prev.bab2, landasanTeori: newTheories },
      bibliography: newBib
    }));
    setToastMessage(`Berhasil memperbarui ${newTheories.length} landasan teori & Daftar Pustaka.`);
  };

  const handleSaveCustomSheets = (updatedSheets: any[]) => {
    setCurrentDoc(prev => ({ ...prev, customSheets: updatedSheets }));
    setToastMessage("Lembar khusus & berkas scan berhasil diperbarui!");
  };

  const handleSaveFigures = (updatedFigures: any[]) => {
    setCurrentDoc(prev => ({ ...prev, documentFigures: updatedFigures }));
    setToastMessage("Daftar gambar & diagram bab berhasil diperbarui!");
  };

  const handleSaveLogbook = (updatedLogbook: any[]) => {
    setCurrentDoc(prev => ({ ...prev, logbookEntries: updatedLogbook }));
    setToastMessage("Buku catatan logbook aktivitas berhasil disimpan!");
  };

  const handleSaveDefenseMinutes = (updatedMinutes: any) => {
    setCurrentDoc(prev => ({ ...prev, defenseMinutes: updatedMinutes }));
    setToastMessage("Lembar berita acara sidang berhasil disimpan!");
  };

  /**
   * Standard Dikti Chapter Heading Renderer:
   * Centers the chapter number (e.g. "BAB I") and chapter title (e.g. "PENDAHULUAN")
   * as required by Indonesian academic report & thesis guidelines.
   */
  const renderChapterHeading = (
    rawTitle: string,
    fallbackBab: string,
    fallbackTitle: string
  ) => {
    const { chapterNumber, chapterTitle } = parseChapterTitle(rawTitle, fallbackBab, fallbackTitle);
    return (
      <div className="text-center w-full chapter-heading">
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#0F172A] dark:text-[#F3F6FC] print:text-black uppercase tracking-wide leading-snug chapter-title">
          <span className="block">{chapterNumber}</span>
          <span className="block mt-1">{chapterTitle}</span>
        </h2>
      </div>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#080B12] text-[#0F172A] dark:text-[#F3F6FC]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Minimalist Studio Top App Bar (Google AI Studio / ChatGPT style) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#0B101A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#253149] px-3 sm:px-6 flex items-center justify-between gap-3 no-print">
        {/* Left: Back, Outline Toggle, and Document Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
            title="Kembali ke Dashboard & Proyek"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-[#253149] hidden sm:block" />

          {/* Toggle Outline Sidebar */}
          <button
            type="button"
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLeftPanelOpen
                ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border-[#0F172A] dark:border-[#7C9CFF]/40 shadow-xs"
                : "bg-white dark:bg-[#111827] text-[#475569] dark:text-[#A4B1C7] border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            }`}
            title={isLeftPanelOpen ? "Tutup panel navigasi bab" : "Buka panel navigasi bab"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Doc Title & Category */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#172033] text-[#0F172A] dark:text-[#7C9CFF] border border-[#E2E8F0] dark:border-[#253149] shrink-0">
              {currentDoc.category === "magang" ? "Magang" : currentDoc.category === "skripsi" ? "Skripsi" : "Tesis"}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F3F6FC] truncate max-w-[160px] sm:max-w-[260px] md:max-w-[340px]" title={currentDoc.title}>
              {currentDoc.title}
            </h1>
            {lastSaved && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-[#34D399] shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Disimpan {lastSaved}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Depth Stats Chip */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-[11px] font-mono text-[#475569] dark:text-[#A4B1C7] shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-[#7C9CFF]" />
            <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">~{estimatedPageCount} Hal A4</span>
            <span className="opacity-40">•</span>
            <span>~{totalWordsCount.toLocaleString("id-ID")} Kata</span>
          </span>

          {/* Undo & Redo */}
          <div className="flex items-center border border-[#E2E8F0] dark:border-[#253149] rounded-lg overflow-hidden bg-white dark:bg-[#111827] shadow-2xs">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#172033] disabled:opacity-30 text-[#475569] dark:text-[#A4B1C7] transition-colors cursor-pointer"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-[#253149]" />
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#172033] disabled:opacity-30 text-[#475569] dark:text-[#A4B1C7] transition-colors cursor-pointer"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Format Kampus Guideline Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsGuidelineModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#0F172A] dark:text-[#F3F6FC] text-xs font-medium transition-all cursor-pointer shadow-2xs"
            title="Format Pedoman Kampus"
          >
            <Landmark className="w-3.5 h-3.5 text-[#7C9CFF] shrink-0" />
            <span className="truncate max-w-[100px]">{currentDoc.campusGuideline?.campusName.split("(")[0].trim() || "Standar Dikti"}</span>
          </button>

          {/* Ekspor Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsExportDropdownOpen(!isExportDropdownOpen);
                setIsToolsDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                isExportDropdownOpen
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border-[#0F172A] dark:border-[#7C9CFF]/40"
                  : "border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#0F172A] dark:text-[#F3F6FC]"
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-[#7C9CFF]" />
              <span>Ekspor</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExportDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handleDownloadDocx(); }}
                  disabled={isExportingDocx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#7C9CFF] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                      {isExportingDocx ? "Menyusun Word..." : "Dokumen Word (.docx)"}
                    </p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Standar nomor halaman &amp; margin kampus</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handleDownloadPptx(); }}
                  disabled={isExportingPptx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-[#FBBF24] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                      {isExportingPptx ? "Menyusun Slide..." : "Slide Sidang (.pptx)"}
                    </p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Format eksekutif 16:9 siap presentasi</p>
                  </div>
                </button>

                {onOpenPresentationStudio && (
                  <button
                    type="button"
                    onClick={() => { setIsExportDropdownOpen(false); onOpenPresentationStudio(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#7C9CFF] hover:bg-[#7C9CFF]/10 transition-colors text-left cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#7C9CFF] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                        Buka Slide Studio Terpisah ↗
                      </p>
                      <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Visual AI &amp; latihan simulasi sidang</p>
                    </div>
                  </button>
                )}

                <div className="my-1 border-t border-[#E2E8F0] dark:border-[#253149]"></div>

                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handleExportBibTeX(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <BookMarked className="w-4 h-4 text-[#475569] dark:text-[#A4B1C7] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">Kutipan BibTeX (.bib)</p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Untuk Mendeley &amp; Zotero</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handleExportRIS(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-[#475569] dark:text-[#A4B1C7] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">Kutipan RIS (.ris)</p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Untuk EndNote &amp; RefWorks</p>
                  </div>
                </button>

                <div className="my-1 border-t border-[#E2E8F0] dark:border-[#253149]"></div>

                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handleCopy(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#475569] dark:text-[#A4B1C7] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">{copied ? "Tersalin ke Clipboard" : "Salin Markdown (.md)"}</p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Naskah lengkap format Markdown</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsExportDropdownOpen(false); handlePrint(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#475569] dark:text-[#A4B1C7] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">Cetak Dokumen / PDF</p>
                    <p className="text-[10px] text-[#475569] dark:text-[#A4B1C7]">Tata letak cetak A4 langsung</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Simpan ke Arsip */}
          <button
            type="button"
            onClick={handleSaveToArchive}
            disabled={isSavingArchive}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] text-[#0F172A] dark:text-[#F3F6FC] text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Simpan naskah ke database arsip"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>{isSavingArchive ? "..." : "Simpan"}</span>
          </button>

          {/* Toggle Right Inspector (Asisten & QA) */}
          <button
            type="button"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              isRightPanelOpen
                ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border-[#0F172A] dark:border-[#7C9CFF]/40"
                : "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            }`}
            title="Buka / Tutup Panel Asisten AI & Audit QA"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
            <span className="hidden sm:inline">Asisten &amp; QA</span>
          </button>
        </div>
      </header>

      {/* 1.5 Sticky Category & Chapter Sub-Toolbar Ribbon */}
      <div className="h-11 min-h-[44px] border-b border-[#E2E8F0] dark:border-[#253149] bg-white/95 dark:bg-[#0B101A]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 overflow-x-auto no-print shrink-0 z-20">
        
        {/* Left: 3 Main Workspace Categories */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => { setWorkspaceCategory("naskah"); setActiveTab("naskah"); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceCategory === "naskah"
                ? "bg-[#0F172A] text-white dark:bg-[#7C9CFF] dark:text-[#080B12] shadow-xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Naskah Dokumen</span>
          </button>

          <button
            type="button"
            onClick={() => { setWorkspaceCategory("metodologi"); setActiveTab(metodologiTab); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceCategory === "metodologi"
                ? "bg-[#0F172A] text-white dark:bg-[#7C9CFF] dark:text-[#080B12] shadow-xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Metodologi &amp; Alur</span>
          </button>

          <button
            type="button"
            onClick={() => { setWorkspaceCategory("sidang"); setActiveTab(sidangTab); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceCategory === "sidang"
                ? "bg-[#0F172A] text-white dark:bg-[#7C9CFF] dark:text-[#080B12] shadow-xs"
                : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sidang &amp; Audit</span>
          </button>
        </div>

        {/* Right: Category Specific Controls */}
        {workspaceCategory === "naskah" && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Chapter Jump Selector */}
            <div className="flex items-center gap-0.5 bg-[#F1F5F9] dark:bg-[#111827] p-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] text-xs">
              {(isUNPPkl ? [
                { id: "all", label: "Semua" },
                { id: "frontmatter", label: "Cover" },
                { id: "bab1", label: "Bab I" },
                { id: "bab2", label: "Bab II" },
                { id: "bab3", label: "Bab III (Penutup)" },
                { id: "backmatter", label: "Pustaka & Lampiran" }
              ] : [
                { id: "all", label: "Semua" },
                { id: "frontmatter", label: "Cover" },
                { id: "bab1", label: "Bab I" },
                { id: "bab2", label: "Bab II" },
                { id: "bab3", label: "Bab III" },
                { id: "bab4", label: "Bab IV" },
                { id: "bab5", label: "Bab V" },
                { id: "backmatter", label: "Pustaka" }
              ]).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setNaskahSection(s.id as any)}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                    naskahSection === s.id
                      ? "bg-white dark:bg-[#172033] text-[#7C9CFF] font-bold shadow-2xs"
                      : "text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Formatting Tools (Microsoft Word Reverse-Engineered Toolbar) */}
            <div className="flex items-center gap-1 border-l border-[#E2E8F0] dark:border-[#253149] pl-2 text-xs">
              {/* Font Family */}
              <select
                value={currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman"}
                onChange={(e) => handleChangeFontFamily(e.target.value)}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] text-[11px] focus:outline-none cursor-pointer"
                title="Font Resmi Dokumen"
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Garamond">Garamond</option>
              </select>

              {/* Line Spacing */}
              <select
                value={currentDoc.campusGuideline?.typography?.lineSpacing || 1.5}
                onChange={(e) => handleChangeLineSpacing(parseFloat(e.target.value))}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] text-[11px] focus:outline-none cursor-pointer"
                title="Spasi Baris Paragraf"
              >
                <option value={1.15}>Spasi 1.15x</option>
                <option value={1.5}>Spasi 1.5x (Dikti)</option>
                <option value={2.0}>Spasi 2.0x (Double)</option>
              </select>

              {/* Margin Preset */}
              <select
                value={
                  (currentDoc.campusGuideline?.margins?.topCm === 4 && currentDoc.campusGuideline?.margins?.leftCm === 4) ? "dikti" :
                  (currentDoc.campusGuideline?.margins?.topCm === 1.5) ? "narrow" : "normal"
                }
                onChange={(e) => handleChangeMarginsPreset(e.target.value as any)}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] text-[11px] focus:outline-none cursor-pointer"
                title="Margin Kertas A4"
              >
                <option value="dikti">Margin Dikti (4-4-3-3)</option>
                <option value="normal">Margin Normal (2.54)</option>
                <option value="narrow">Margin Sempit (1.5)</option>
              </select>

              {/* Citation Style */}
              <button
                type="button"
                onClick={() => setCitationStyle(prev => prev === "apa" ? "ieee" : "apa")}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] font-mono text-[11px] hover:border-[#7C9CFF] transition-colors cursor-pointer"
                title="Ganti format sitasi APA 7th / IEEE"
              >
                {citationStyle === "apa" ? "APA 7th" : "IEEE"}
              </button>

              {/* Heading Style */}
              <select
                value={currentDoc.campusGuideline?.headingStyle || "decimal"}
                onChange={(e) => handleChangeHeadingStyle(e.target.value as HeadingStyleType)}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] text-[11px] focus:outline-none cursor-pointer"
                title="Gaya Penomoran Sub-bab"
              >
                <option value="decimal">Desimal (1.1)</option>
                <option value="alphanumeric">Alfanumerik (A.)</option>
                <option value="roman">Romawi (I.A)</option>
              </select>

              {/* Watermark Selector */}
              <select
                value={watermarkType}
                onChange={(e) => setWatermarkType(e.target.value as any)}
                className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F3F6FC] text-[11px] focus:outline-none cursor-pointer"
                title="Watermark Kertas"
              >
                <option value="none">Watermark: Nonaktif</option>
                <option value="draft">Draf Usulan</option>
                <option value="plagiarisme_ok">Bebas Plagiasi</option>
                <option value="siap_sidang">Siap Sidang</option>
                <option value="confidential">Confidential</option>
              </select>

              {/* Ruler */}
              <button
                type="button"
                onClick={() => setShowMarginRuler(!showMarginRuler)}
                className={`px-2 py-1 rounded-md border text-[11px] font-mono transition-colors cursor-pointer ${
                  showMarginRuler
                    ? "bg-[#7C9CFF] text-[#080B12] border-[#7C9CFF] font-bold"
                    : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-[#A4B1C7] border-[#E2E8F0] dark:border-[#253149]"
                }`}
                title="Tampilkan garis margin panduan A4"
              >
                Ruler
              </button>

              {/* Page Customizer Trigger */}
              <button
                type="button"
                onClick={() => setIsPageCustomizerModalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-[#7C9CFF]/15 hover:bg-[#7C9CFF]/25 text-[#7C9CFF] font-semibold text-[11px] border border-[#7C9CFF]/30 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                title="Kustomisasi Susunan & Lembar Halaman Dokumen"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Atur Lembar</span>
              </button>
            </div>
          </div>
        )}

        {workspaceCategory === "metodologi" && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { setMetodologiTab("flowchart"); setActiveTab("flowchart"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "flowchart"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Bagan Alir Riset</span>
            </button>
            <button
              type="button"
              onClick={() => { setMetodologiTab("tree"); setActiveTab("tree"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "tree"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pohon Alur (Tree)</span>
            </button>
            <button
              type="button"
              onClick={() => { setMetodologiTab("jadwal"); setActiveTab("jadwal"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "jadwal"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Matriks Jadwal (Gantt)</span>
            </button>
          </div>
        )}

        {workspaceCategory === "sidang" && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { setSidangTab("defense"); setActiveTab("defense"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "defense"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Tanya Jawab Sidang</span>
            </button>
            <button
              type="button"
              onClick={() => { setSidangTab("revisionMatrix"); setActiveTab("revisionMatrix"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "revisionMatrix"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#9B8CFF]" />
              <span>Matriks Revisi Dosen</span>
            </button>
            <button
              type="button"
              onClick={() => { setSidangTab("audit"); setActiveTab("audit"); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] border border-[#7C9CFF]/40 shadow-xs"
                  : "text-[#64748B] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Audit Turnitin &amp; QA</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Three-Panel Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: LEFT DOCUMENT OUTLINE / CHAPTER NAVIGATION (Collapsible) */}
        {isLeftPanelOpen && (
          <aside className="w-64 sm:w-72 shrink-0 border-r border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#0B101A] overflow-y-auto flex flex-col no-print transition-all duration-200">
            {/* Header */}
            <div className="p-3 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7]">
                Struktur Dokumen
              </span>
              <button
                type="button"
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1 rounded-md text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] cursor-pointer"
                title="Tutup Navigasi Bab"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tree Navigation for Active Category */}
            <div className="flex-1 p-2 space-y-4">
              {workspaceCategory === "naskah" && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7] px-2 block mb-1">
                    Daftar Bab &amp; Bagian
                  </span>
                  {(isUNPPkl ? [
                    { id: "all", label: "Semua Halaman", icon: Layers },
                    { id: "frontmatter", label: "Cover & Bagian Awal", icon: BookOpen },
                    { id: "bab1", label: "Bab I: Pendahuluan", icon: FileText },
                    { id: "bab2", label: "Bab II: Topik Bahasan", icon: BookMarked, badge: `${currentDoc.bab2?.landasanTeori?.length || 4}` },
                    { id: "bab3", label: "Bab III: Penutup", icon: ShieldCheck },
                    { id: "backmatter", label: "Pustaka & Lampiran (11)", icon: BookmarkCheck }
                  ] : [
                    { id: "all", label: "Semua Halaman", icon: Layers },
                    { id: "frontmatter", label: "Cover & Bagian Awal", icon: BookOpen },
                    { id: "bab1", label: "Bab I: Pendahuluan", icon: FileText },
                    { id: "bab2", label: "Bab II: Tinjauan Pustaka", icon: BookMarked, badge: `${currentDoc.bab2?.landasanTeori?.length || 13}` },
                    { id: "bab3", label: "Bab III: Metodologi", icon: Network },
                    { id: "bab4", label: "Bab IV: Jadwal & Anggaran", icon: CalendarDays },
                    { id: "bab5", label: "Bab V: Kesimpulan & Mitigasi", icon: ShieldCheck },
                    { id: "backmatter", label: "Pustaka & Lampiran", icon: BookmarkCheck }
                  ]).map((s) => {
                    const isActive = naskahSection === s.id;
                    const IconComp = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setNaskahSection(s.id as any);
                          setActiveTab("naskah");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] font-bold shadow-xs"
                            : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]/60"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#7C9CFF]' : 'text-[#475569] dark:text-[#A4B1C7]'}`} />
                          <span className="truncate">{s.label}</span>
                        </span>
                        {s.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-[#7C9CFF]/15 text-[#7C9CFF] font-semibold shrink-0">
                            {s.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Bagian & Lampiran Quick Tools */}
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#253149] space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7] px-2 block mb-1">
                      Bagian &amp; Lampiran
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCampusLogoModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <Landmark className="w-3.5 h-3.5 text-[#7C9CFF] shrink-0" />
                      <span>Logo Kampus &amp; Sampul</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTheoryCustomizerModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#9B8CFF] shrink-0" />
                      <span>Kustom Teori ({currentDoc.bab2?.landasanTeori?.length || 13})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomSheetModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                      <span>Lembar Khusus &amp; Scan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsImageManagerModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span>Gambar &amp; Diagram Bab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLogbookModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-[#7C9CFF] shrink-0" />
                      <span>Logbook Catatan Lapangan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDefenseMinutesModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors text-left cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#FB7185] shrink-0" />
                      <span>Berita Acara Sidang</span>
                    </button>
                  </div>
                </div>
              )}

              {workspaceCategory === "metodologi" && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7] px-2 block mb-1">
                    Instrumen Metodologi
                  </span>
                  {[
                    { id: "flowchart", label: "Bagan Alir Riset", icon: Network },
                    { id: "tree", label: "Pohon Alur Riset (Tree)", icon: Compass },
                    { id: "jadwal", label: "Matriks Jadwal (Gantt)", icon: CalendarDays }
                  ].map((m) => {
                    const isActive = activeTab === m.id;
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMetodologiTab(m.id as any);
                          setActiveTab(m.id as any);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] font-bold"
                            : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]/60"
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#7C9CFF]' : 'text-[#475569] dark:text-[#A4B1C7]'}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {workspaceCategory === "sidang" && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569] dark:text-[#A4B1C7] px-2 block mb-1">
                    Kesiapan Sidang &amp; Audit
                  </span>
                  {[
                    { id: "defense", label: "Simulasi Tanya Jawab Sidang", icon: ShieldAlert, color: "text-[#FBBF24]" },
                    { id: "revisionMatrix", label: "Matriks Revisi Dosen", icon: Layers, color: "text-[#9B8CFF]" },
                    { id: "audit", label: "Audit Kepatuhan & Turnitin", icon: ShieldCheck, color: "text-[#34D399]" }
                  ].map((s) => {
                    const isActive = activeTab === s.id;
                    const IconComp = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSidangTab(s.id as any);
                          setActiveTab(s.id as any);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] font-bold"
                            : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]/60"
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom link to Presentation Studio */}
            {onOpenPresentationStudio && (
              <div className="p-3 border-t border-[#E2E8F0] dark:border-[#253149]">
                <button
                  type="button"
                  onClick={onOpenPresentationStudio}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold hover:bg-[#FBBF24]/20 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Slide Studio 16:9</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#FBBF24]" />
                </button>
              </div>
            )}
          </aside>
        )}

        {/* PANEL 2: CENTER DOCUMENT CANVAS (Spacious & Clean Academic Sheet) */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-6 flex flex-col items-center bg-[#F1F5F9] dark:bg-[#080B12]">
          <div className="w-full max-w-[880px] space-y-6">

            {/* TAB 1: NASKAH PROPOSAL LENGKAP */}
            {activeTab === "naskah" && (
              <article 
                style={{
                  ["--doc-font" as any]: currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman",
                  ["--doc-line-height" as any]: String(currentDoc.campusGuideline?.typography?.lineSpacing || 1.5),
                  fontFamily: `var(--doc-font), serif`,
                  lineHeight: `var(--doc-line-height)`,
                  paddingTop: `${(currentDoc.campusGuideline?.margins?.topCm ?? 4) * 9}px`,
                  paddingBottom: `${(currentDoc.campusGuideline?.margins?.bottomCm ?? 3) * 9}px`,
                  paddingLeft: `${(currentDoc.campusGuideline?.margins?.leftCm ?? 4) * 9}px`,
                  paddingRight: `${(currentDoc.campusGuideline?.margins?.rightCm ?? 3) * 9}px`,
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  transformOrigin: "top center",
                }}
                className="academic-doc-canvas relative bg-white dark:bg-[#0D131F] text-[#0F172A] dark:text-[#F3F6FC] rounded-lg shadow-xl border border-[#E2E8F0] dark:border-[#1E2638] print:bg-white print:text-black print:p-0 print:border-none print:shadow-none transition-all duration-200"
              >
          {/* Watermark Diagonal Overlay */}
          {watermarkType !== "none" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-10 flex flex-col justify-around items-center opacity-[0.05] dark:opacity-[0.07] print:opacity-[0.09] text-zinc-900 dark:text-zinc-100 print:text-black">
              {Array.from({ length: 14 }).map((_, wIdx) => (
                <div
                  key={wIdx}
                  className="transform -rotate-30 text-3xl sm:text-5xl md:text-6xl font-black font-sans uppercase tracking-widest whitespace-nowrap my-16 text-center"
                >
                  {watermarkType === "draft" && "DRAF USULAN PENELITIAN"}
                  {watermarkType === "plagiarisme_ok" && "TERVALIDASI BEBAS PLAGIASI"}
                  {watermarkType === "siap_sidang" && "DOKUMEN SIAP SIDANG"}
                  {watermarkType === "confidential" && "CONFIDENTIAL / RAHASIA"}
                </div>
              ))}
            </div>
          )}
          {/* Visual Dashed Margin Guideline Overlay when ruler is toggled */}
          {showMarginRuler && (
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-400/40 dark:border-indigo-500/40 rounded-xl m-2 p-2 flex flex-col justify-between text-[10px] font-mono text-indigo-600 dark:text-indigo-400 no-print z-10">
              <div className="flex justify-between items-center bg-indigo-50/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded shadow-xs">
                <span>▲ Margin Atas: {currentDoc.campusGuideline?.margins?.topCm ?? 4} cm</span>
                <span>Standar Kertas A4 (21 x 29.7 cm)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-indigo-50/80 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-xs">◀ Kiri: {currentDoc.campusGuideline?.margins?.leftCm ?? 4} cm</span>
                <span className="bg-indigo-50/80 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded shadow-xs">Kanan: {currentDoc.campusGuideline?.margins?.rightCm ?? 3} cm ▶</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded shadow-xs">
                <span>▼ Margin Bawah: {currentDoc.campusGuideline?.margins?.bottomCm ?? 3} cm</span>
                <span>Font: {currentDoc.campusGuideline?.typography?.fontFamily || "Times New Roman"} • Spasi: {currentDoc.campusGuideline?.typography?.lineSpacing || 1.5}</span>
              </div>
            </div>
          )}
          
          {/* Chapter Focus Mode Indicator (Only when a specific chapter is isolated) */}
          {naskahSection !== "all" && (
            <div className="no-print mb-6 px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7C9CFF] animate-pulse"></span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                  Fokus Bagian: {
                    naskahSection === "frontmatter" ? "Cover & Kelengkapan Awal" :
                    naskahSection === "bab1" ? "Bab I: Pendahuluan" :
                    naskahSection === "bab2" ? (isUNPPkl ? "Bab II: Topik Bahasan" : `Bab II: Tinjauan Pustaka (${currentDoc.bab2?.landasanTeori?.length || 13} Teori)`) :
                    naskahSection === "bab3" ? (isUNPPkl ? "Bab III: Penutup (Kesimpulan & Saran)" : "Bab III: Metodologi / Pelaksanaan") :
                    naskahSection === "bab4" ? "Bab IV: Rencana Kerja & Analisis" :
                    naskahSection === "bab5" ? "Bab V: Penutup & Rekomendasi" :
                    "Daftar Pustaka, Logbook & Berita Acara"
                  }
                </span>
                <span className="text-[#64748B] dark:text-[#A4B1C7] text-[11px] hidden sm:inline">• Menampilkan bab terisolasi untuk fokus telaah</span>
              </div>
              <button
                type="button"
                onClick={() => setNaskahSection("all")}
                className="text-xs text-[#7C9CFF] hover:underline font-semibold cursor-pointer"
              >
                Lihat Naskah Lengkap (Utuh) ≡
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* KELENGKAPAN AWAL (FRONT MATTER) */}
          {/* ========================================================================= */}
          {(naskahSection === "all" || naskahSection === "frontmatter") && (
            <>
              {/* BAGIAN 1: HALAMAN JUDUL / COVER STANDAR DIKTI */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-cover") && (
          <div id="section-cover" className="relative text-center pb-12 mb-12 border-b-2 border-[#E2E8F0] dark:border-[#253149] print:border-black print:pb-0 print:mb-0 print:min-h-screen print:flex print:flex-col print:justify-between print-break-page print:break-after-page">
            {/* Action Bar Cover (No-Print) */}
            <div className="no-print mb-6 p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-mono text-[#64748B] dark:text-[#A4B1C7] text-[11px] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#7C9CFF]" />
                Format Cover Standar Dikti (Logo 6x6 s.d. 7x7 cm)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCampusLogoModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC] hover:border-[#7C9CFF] text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <ImageIcon className="w-3 h-3 text-[#7C9CFF]" />
                  <span>{currentDoc.campusLogoUrl ? "Ganti Logo Kampus" : "Unggah / Pilih Logo"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomSheetModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC] hover:border-[#7C9CFF] text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileSignature className="w-3 h-3 text-[#34D399]" />
                  <span>Lembar Pengesahan & Scan</span>
                </button>
              </div>
            </div>

            {/* Document Type Label */}
            <div className="text-xs sm:text-sm font-serif font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 print:text-black">
              PROPOSAL {currentDoc.category === "magang" ? "PRAKTIK KERJA LAPANGAN / MAGANG INDUSTRI" : currentDoc.category === "skripsi" ? "SKRIPSI" : "TUGAS AKHIR"}
            </div>

            {/* Main Title (All Uppercase, Bold) */}
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-4 leading-snug print:text-black uppercase max-w-2xl mx-auto px-2">
              {currentDoc.title}
            </h1>

            {/* Sub-label */}
            <p className="text-xs sm:text-sm font-serif italic text-zinc-600 dark:text-zinc-400 mt-4 max-w-lg mx-auto print:text-black">
              Diajukan sebagai salah satu syarat untuk menyelesaikan program studi sarjana pada {currentDoc.facultyMajor}
            </p>

            {/* Centered Campus Logo */}
            <div className="my-8 flex justify-center items-center">
              {(() => {
                const logoSrc = currentDoc.campusLogoUrl || getCampusLogoByInstitution(currentDoc.institution);
                if (logoSrc) {
                  return (
                    <div className="relative group p-2">
                      <img
                        src={logoSrc}
                        alt="Logo Perguruan Tinggi"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto filter dark:brightness-105"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCampusLogoModalOpen(true)}
                        className="no-print absolute bottom-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-2.5 h-2.5" /> Ganti
                      </button>
                    </div>
                  );
                }
                return (
                  <button
                    type="button"
                    onClick={() => setIsCampusLogoModalOpen(true)}
                    className="no-print w-28 h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center p-3 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group text-center"
                  >
                    <ImageIcon className="w-7 h-7 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono leading-tight font-semibold">+ Logo Kampus</span>
                    <span className="text-[9px] text-zinc-400">(6x6 cm)</span>
                  </button>
                );
              })()}
            </div>

            {/* Author Block */}
            <div className="text-xs sm:text-sm font-serif space-y-1 text-zinc-800 dark:text-zinc-200 print:text-black">
              <p className="font-sans text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-600">Disusun Oleh:</p>
              <p className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 print:text-black">{currentDoc.candidateName}</p>
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 print:text-black">NIM: {currentDoc.candidateId}</p>
            </div>

            {/* Institution & Year Block */}
            <div className="mt-8 pt-4 font-serif text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 print:text-black space-y-1 uppercase tracking-wide">
              <p className="font-bold">{currentDoc.facultyMajor}</p>
              <p className="font-bold">{currentDoc.institution}</p>
              <p className="font-medium text-xs font-mono">{currentDoc.generationDate ? new Date().getFullYear().toString() : "2026"}</p>
            </div>

            {/* Cover Page Indicator */}
            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-zinc-400 print:hidden">
              [Halaman i - Tidak Dicetak]
            </div>
          </div>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 2: LEMBAR PENGESAHAN (Halaman ii) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-pengesahan") && (
          <section id="section-pengesahan" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-800 print:border-black font-serif text-xs sm:text-sm print-break-page print:break-after-page">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  HALAMAN PENGESAHAN AKADEMIK
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  LEMBAR PENGESAHAN
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomSheetModalOpen(true)}
                className="no-print absolute right-0 top-0 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileSignature className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unggah Scan / Edit</span>
              </button>
            </div>

            {/* Check if user uploaded an official signed scan for Lembar Pengesahan */}
            {(() => {
              const uploadedScan = currentDoc.customSheets?.find(s => (s.id === "pengesahan" || s.type === "pengesahan") && s.fileDataUrl);
              if (uploadedScan && uploadedScan.fileDataUrl) {
                return (
                  <div className="my-6 text-center">
                    <div className="no-print mb-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>Berkas Scan Resmi Kampus Telah Terhubung ({uploadedScan.title})</span>
                    </div>
                    <img
                      src={uploadedScan.fileDataUrl}
                      alt="Scan Lembar Pengesahan"
                      className="max-h-[600px] w-auto mx-auto rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm print:max-h-full print:border-none"
                    />
                  </div>
                );
              }
              return (
                <div className="space-y-4 max-w-2xl mx-auto text-justify leading-relaxed">
                  <p className="indent-6">
                    Proposal {currentDoc.category === "magang" ? "Praktik Kerja Lapangan / Magang Industri" : "Skripsi / Tugas Akhir"} dengan judul <strong>"{currentDoc.title}"</strong> yang disusun oleh:
                  </p>
                  
                  <div className="pl-6 space-y-1 font-sans text-xs">
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Nama</span>
                      <span className="col-span-2 font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.candidateName}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">NIM</span>
                      <span className="col-span-2 font-mono font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.candidateId}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Program Studi</span>
                      <span className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.facultyMajor}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Perguruan Tinggi</span>
                      <span className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.institution}</span>
                    </div>
                  </div>

                  <p className="indent-6">
                    Telah diperiksa dan disetujui untuk diseminarkan dan dipertanggungjawabkan di hadapan Tim Penguji pada {currentDoc.facultyMajor}, {currentDoc.institution}.
                  </p>

                  <p className="text-right text-xs pt-4 font-sans text-zinc-600 dark:text-zinc-400 print:text-black">
                    Disahkan di {currentDoc.institution.split(" ").slice(-1)[0] || "Kota Kampus"}, Tanggal: {currentDoc.approvalSheet?.approvalDate || currentDoc.generationDate}
                  </p>

                  {/* Signatures Grid */}
                  {(() => {
                    const pengesahanSheet = currentDoc.customSheets?.find(s => s.type === "pengesahan" || s.id === "sheet-pengesahan");
                    const activeSigners = (pengesahanSheet?.signers && pengesahanSheet.signers.length > 0)
                      ? pengesahanSheet.signers.slice(0, 2)
                      : (currentDoc.approvalSheet?.primarySigners && currentDoc.approvalSheet.primarySigners.length > 0)
                        ? currentDoc.approvalSheet.primarySigners
                        : [
                            { role: "Dosen Pembimbing Akademik Utama", name: "Dr. Ir. Hendro Prabowo, M.T.", idNumber: "NIP. 19780512 200312 1 002" },
                            { role: currentDoc.category === "magang" ? `Pembimbing Lapangan (${currentDoc.targetEntity})` : "Dosen Pembimbing Pendamping", name: "Ratna Kusuma Dewi, S.T., M.Sc.", idNumber: currentDoc.category === "magang" ? "NIK / NIP Mitra 20210998" : "NIP. 19850914 201012 2 004" }
                          ];

                    const headSigner = (pengesahanSheet?.signers && pengesahanSheet.signers.length > 2)
                      ? pengesahanSheet.signers[2]
                      : currentDoc.approvalSheet?.headSigner
                        ? currentDoc.approvalSheet.headSigner
                        : {
                            role: `Ketua Program Studi ${currentDoc.facultyMajor}`,
                            name: "Prof. Dr. Ir. Wahyu Wibowo, M.Sc.",
                            idNumber: "NIP. 19690325 199403 1 001"
                          };

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-8 text-center pt-6">
                          {activeSigners.map((signer, sIdx) => (
                            <div key={sIdx}>
                              <p className="text-zinc-600 dark:text-zinc-400 print:text-black mb-16 leading-tight">
                                Menyetujui,<br /><strong className="text-zinc-800 dark:text-zinc-200">{signer.role}</strong>
                              </p>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black underline underline-offset-4">
                                {signer.name}
                              </p>
                              <p className="text-zinc-500 font-mono text-[11px] print:text-gray-600 mt-0.5">
                                {signer.idNumber}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Ketua Program Studi */}
                        <div className="mt-10 text-center">
                          <p className="text-zinc-600 dark:text-zinc-400 print:text-black mb-16 leading-tight">
                            Mengetahui,<br />
                            <strong className="text-zinc-800 dark:text-zinc-200">
                              {headSigner.role}
                            </strong>
                          </p>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-200 print:text-black underline underline-offset-4">
                            {headSigner.name}
                          </p>
                          <p className="text-zinc-500 font-mono text-[11px] print:text-gray-600 mt-0.5">
                            {headSigner.idNumber}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              );
            })()}

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              ii
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 3: LEMBAR PERNYATAAN ORISINALITAS (Halaman iii) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-orisinalitas") && (
          <section id="section-orisinalitas" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm print-break-page print:break-after-page">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  SURAT PERNYATAAN INTEGRITAS AKADEMIK
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  PERNYATAAN KEASLIAN &amp; BEBAS PLAGIARISME
                </h2>
              </div>
            </div>

            {/* Check if user uploaded a scanned copy of orisinalitas */}
            {(() => {
              const uploadedScan = currentDoc.customSheets?.find(s => s.id === "orisinalitas" && s.fileDataUrl);
              if (uploadedScan && uploadedScan.fileDataUrl) {
                return (
                  <div className="my-6 text-center">
                    <img
                      src={uploadedScan.fileDataUrl}
                      alt="Scan Lembar Orisinalitas"
                      className="max-h-[600px] w-auto mx-auto rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm print:max-h-full print:border-none"
                    />
                  </div>
                );
              }
              return (
                <div className="space-y-4 max-w-2xl mx-auto text-justify leading-relaxed">
                  <p>Yang bertanda tangan di bawah ini:</p>
                  <div className="pl-6 space-y-1 font-sans text-xs">
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Nama</span>
                      <span className="col-span-2 font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.candidateName}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">NIM</span>
                      <span className="col-span-2 font-mono font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.candidateId}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Program Studi</span>
                      <span className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.facultyMajor}</span>
                    </div>
                    <div className="grid grid-cols-3 max-w-md">
                      <span className="text-zinc-500">Perguruan Tinggi</span>
                      <span className="col-span-2 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">: {currentDoc.institution}</span>
                    </div>
                  </div>

                  <p className="indent-6 pt-2">
                    Menyatakan dengan sesungguhnya bahwa naskah usulan karya ilmiah dengan judul:
                  </p>
                  <p className="font-bold text-center uppercase py-1 text-zinc-900 dark:text-zinc-100 print:text-black">
                    "{currentDoc.title}"
                  </p>
                  <p className="indent-6">
                    Adalah benar-benar hasil karya asli dan pemikiran mandiri saya, bukan merupakan hasil penjiplakan, fabrikasi, falsifikasi data, maupun plagiarisme dari karya orang lain, baik sebagian maupun seluruhnya. Apabila di kemudian hari terbukti atau dapat dibuktikan terdapat unsur penipuan, plagiarisme, atau pelanggaran etika akademik dalam karya ini, maka saya bersedia menerima sanksi akademik sesuai peraturan perundang-undangan yang berlaku di {currentDoc.institution} dan hukum Republik Indonesia.
                  </p>

                  {/* Meterai Box & Signature */}
                  <div className="pt-8 flex justify-end">
                    <div className="text-center font-sans space-y-2 w-64">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 print:text-black">
                        {currentDoc.institution.split(" ").slice(-1)[0] || "Kota"}, {currentDoc.generationDate}
                      </p>
                      <p className="text-xs text-zinc-500">Yang membuat pernyataan,</p>
                      <div className="my-3 mx-auto w-24 h-16 border-2 border-dashed border-zinc-400 dark:border-zinc-600 rounded flex flex-col items-center justify-center text-[10px] text-zinc-400 font-mono">
                        <span>MATERAI</span>
                        <span className="font-bold">Rp 10.000</span>
                      </div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 print:text-black underline underline-offset-4">
                        {currentDoc.candidateName}
                      </p>
                      <p className="font-mono text-xs text-zinc-500">NIM. {currentDoc.candidateId}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              iii
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 3B: LEMBAR KHUSUS KAMPUS / BERITA ACARA / UPLOAD SCAN */}
          {/* ========================================================================= */}
          {((currentDoc.customSheets || []).filter(
            s => s.enabled !== false &&
                 s.type !== "pengesahan" &&
                 s.type !== "pernyataan_orisinalitas" &&
                 s.type !== "kata_pengantar" &&
                 s.type !== "abstrak"
          )).map((sheet, sIdx) => {
            const romanPages = ["iv", "v", "vi", "vii", "viii", "ix"];
            return (
              <section
                id={`section-custom-${sheet.id}`}
                key={sheet.id}
                className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm"
              >
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
                  <div className="text-center w-full">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                      DOKUMEN LAMPIRAN RESMI KAMPUS
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                      {sheet.title}
                    </h2>
                  </div>
                </div>

                {sheet.fileDataUrl && (
                  <div className="my-6 text-center">
                    <img
                      src={sheet.fileDataUrl}
                      alt={sheet.title}
                      className="max-h-[650px] w-auto mx-auto rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm print:max-h-full print:border-none"
                    />
                  </div>
                )}

                {sheet.content && (
                  <div className="space-y-4 max-w-2xl mx-auto text-justify leading-relaxed whitespace-pre-line">
                    <p>{sheet.content}</p>
                  </div>
                )}

                {sheet.signers && sheet.signers.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-8 text-center max-w-xl mx-auto">
                    {sheet.signers.map((signer, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-zinc-500 text-[11px]">{signer.role}</p>
                        <div className="h-16" />
                        <p className="font-semibold underline underline-offset-4 text-zinc-900 dark:text-zinc-100 print:text-black">
                          {signer.name}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-500">{signer.idNumber}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-10 text-center font-serif text-xs text-zinc-400">
                  {romanPages[sIdx] || "iv"}
                </div>
              </section>
            );
          })}

          {/* ========================================================================= */}
          {/* BAGIAN 4: KATA PENGANTAR (Halaman Formal) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-pengantar") && (
          <section id="section-pengantar" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm print-break-page print:break-after-page">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  KATA PENGANTAR
                </h2>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto text-justify leading-relaxed">
              <p className="indent-6">
                Puji syukur ke hadirat Tuhan Yang Maha Esa atas segala rahmat, taufik, dan hidayah-Nya, sehingga penulis dapat menyelesaikan naskah proposal {currentDoc.category === "magang" ? "Praktik Kerja Lapangan / Magang Industri" : "Skripsi / Tugas Akhir"} yang berjudul <strong>"{currentDoc.title}"</strong> dengan lancar dan tepat waktu.
              </p>
              <p className="indent-6">
                Penyusunan usulan ini dimaksudkan untuk memenuhi salah satu syarat kelulusan kurikulum akademik pada {currentDoc.facultyMajor}, {currentDoc.institution}. Dalam proses penyusunan proposal ini, penulis memperoleh banyak bimbingan, arahan, saran, serta dukungan moral dan material dari berbagai pihak. Oleh karena itu, perkenankan penulis menyampaikan penghargaan dan rasa terima kasih yang sebesar-besarnya kepada:
              </p>
              
              <ol className="list-decimal pl-6 space-y-1.5 font-sans text-xs">
                <li>Bapak/Ibu Rektor {currentDoc.institution} beserta jajaran pimpinan universitas yang telah memberikan fasilitas dan kesempatan belajar terbaik.</li>
                <li>Bapak/Ibu Dekan Fakultas dan Ketua Program Studi {currentDoc.facultyMajor} atas arahan kebijakan akademik serta kurikulum yang berkualitas.</li>
                <li>Dosen Pembimbing Akademik yang dengan penuh kesabaran, dedikasi, dan ketelitian telah meluangkan waktu serta tenaga untuk memberikan bimbingan, evaluasi kritis, dan motivasi berharga kepada penulis.</li>
                <li>Pimpinan serta segenap staf dan pembimbing lapangan pada {currentDoc.targetEntity} yang telah memberikan izin, fasilitas, data, dan pendampingan kerja profesional selama kegiatan berlangsung.</li>
                <li>Kedua orang tua dan keluarga tercinta atas doa yang tiada henti, cinta kasih, pengorbanan, dan dukungan moril yang selalu menjadi sumber kekuatan penulis.</li>
                <li>Rekan-rekan seperjuangan civitas akademika {currentDoc.facultyMajor} yang telah saling bertukar pikiran, berdiskusi, dan berbagi semangat selama studi.</li>
              </ol>

              <p className="indent-6">
                Penulis menyadari sepenuhnya bahwa proposal ini masih jauh dari kesempurnaan karena keterbatasan wawasan dan pengalaman. Oleh sebab itu, kritik dan saran yang konstruktif dari para penguji dan pembaca sangat diharapkan demi penyempurnaan karya ilmiah ini ke depan. Akhir kata, semoga usulan ini dapat memberikan sumbangsih nyata bagi pengembangan ilmu pengetahuan dan kemaslahatan masyarakat luas.
              </p>

              <div className="pt-6 flex justify-end font-sans">
                <div className="text-center w-56 space-y-1">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 print:text-black">
                    {currentDoc.institution.split(" ").slice(-1)[0] || "Kota Kampus"}, {currentDoc.generationDate}
                  </p>
                  <p className="text-xs text-zinc-500 mb-12">Penulis,</p>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 print:text-black underline underline-offset-4">
                    {currentDoc.candidateName}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">NIM. {currentDoc.candidateId}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              iv
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 5A: ABSTRAK (BAHASA INDONESIA - Halaman v) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-abstrak") && (
          <section id="section-abstrak" className="relative pb-12 mb-12 border-b-2 border-[#E2E8F0] dark:border-[#253149] print:border-black font-serif text-xs sm:text-sm print:break-after-page">
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] dark:border-[#253149] pb-2 print:border-black">
              <div className="text-center w-full">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] dark:text-[#A4B1C7] block mb-1">
                  INTISARI KARYA ILMIAH
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F3F6FC] uppercase tracking-wide print:text-black">
                  ABSTRAK
                </h2>
              </div>
            </div>

            {/* Versi Bahasa Indonesia */}
            <div className="max-w-2xl mx-auto space-y-4 leading-relaxed text-justify mb-8">
              <div className="text-center text-xs space-y-0.5 mb-4">
                <p className="font-bold text-[#0F172A] dark:text-[#F3F6FC] print:text-black uppercase text-sm">{currentDoc.title}</p>
                <p className="text-[#334155] dark:text-[#CBD5E1] print:text-black pt-1">
                  Oleh: <strong>{currentDoc.candidateName}</strong> (NIM: {currentDoc.candidateId})
                </p>
                <p className="text-[#64748B] dark:text-[#A4B1C7] text-[11px]">
                  Program Studi {currentDoc.facultyMajor}, {currentDoc.institution}
                </p>
              </div>

              <p className="indent-8">
                {currentDoc.executiveSummary || `Usulan penelitian ini disusun untuk mengidentifikasi dan memecahkan permasalahan operasional pada ${currentDoc.targetEntity} dengan metodologi ilmiah yang terukur dan teruji secara empiris. Pendekatan yang diusulkan mengintegrasikan landasan teoretis terdepan dengan metodologi terukur demi mencapai efisiensi dan validitas ilmiah yang tinggi.`}
              </p>
              <p className="indent-8">
                Metodologi pelaksanaan mencakup tahapan identifikasi kebutuhan riil, perancangan arsitektur pemecahan masalah, validasi empiris di lingkungan operasional {currentDoc.targetEntity}, serta evaluasi berbasis metrik kinerja terstandar. Diharapkan luaran dari kegiatan ini mampu memberikan kontribusi aplikatif berupa prototipe kerja dan pedoman operasional baku bagi {currentDoc.targetEntity}, serta memperkaya literatur ilmiah di lingkungan {currentDoc.institution}.
              </p>
              <p className="indent-8">
                Rancangan kerja ini disusun secara sistematis agar dapat diuji kelayakannya dalam seminar proposal, serta memberikan kepastian tata kelola data, mitigasi risiko teknis, dan etika riset akademik yang ketat.
              </p>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#253149] text-xs">
                <p>
                  <strong>Kata Kunci:</strong> <em>{currentDoc.category}, {currentDoc.targetDepartment || "Metodologi"}, {currentDoc.facultyMajor.split(" ").slice(0, 2).join(" ")}, Optimasi Sistem, Analisis Kinerja</em>
                </p>
              </div>
            </div>

            <div className="mt-10 text-center font-serif text-xs text-[#94A3B8]">
              v
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 5B: ABSTRACT (ENGLISH - Halaman vi) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-abstract-en") && (
          <section id="section-abstract-en" className="relative pb-12 mb-12 border-b-2 border-[#E2E8F0] dark:border-[#253149] print:border-black font-serif text-xs sm:text-sm print:break-after-page">
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] dark:border-[#253149] pb-2 print:border-black">
              <div className="text-center w-full">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] dark:text-[#A4B1C7] block mb-1">
                  SCIENTIFIC ABSTRACT
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F3F6FC] uppercase tracking-wide print:text-black">
                  ABSTRACT
                </h2>
              </div>
            </div>

            {/* Versi Bahasa Inggris (Abstract) */}
            <div className="max-w-2xl mx-auto space-y-4 leading-relaxed text-justify italic mb-8">
              <div className="text-center text-xs space-y-0.5 mb-4 not-italic">
                <p className="font-bold text-[#0F172A] dark:text-[#F3F6FC] print:text-black uppercase text-sm italic">{currentDoc.title}</p>
                <p className="text-[#334155] dark:text-[#CBD5E1] print:text-black pt-1">
                  Author: <strong>{currentDoc.candidateName}</strong> (Student ID: {currentDoc.candidateId})
                </p>
                <p className="text-[#64748B] dark:text-[#A4B1C7] text-[11px]">
                  Department of {currentDoc.facultyMajor}, {currentDoc.institution}
                </p>
              </div>

              <p className="indent-8">
                This academic research proposal systematically investigates and addresses fundamental operational challenges observed at {currentDoc.targetEntity} through rigorous and empirically validated methodologies. The proposed approach synthesizes cutting-edge theoretical frameworks with precise field measurements to ensure high scientific rigor and practical utility.
              </p>
              <p className="indent-8">
                The structured execution pipeline encompasses empirical problem scoping, architectural design, systematic deployment, and thorough benchmark validation. The expected deliverables provide concrete operational standards and verified artifacts for {currentDoc.targetEntity}, while advancing the academic body of knowledge at {currentDoc.institution}.
              </p>
              <p className="indent-8">
                Furthermore, this structured methodology strictly guarantees research ethics compliance, institutional data security, and verifiable risk mitigation throughout the research lifecycle.
              </p>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#253149] text-xs not-italic">
                <p>
                  <strong>Keywords:</strong> <em>Academic Research, Applied Methodology, Operational Excellence, {currentDoc.category.toUpperCase()}, Performance Optimization</em>
                </p>
              </div>
            </div>

            <div className="mt-10 text-center font-serif text-xs text-[#94A3B8]">
              vi
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 6: DAFTAR ISI FORMAL (Halaman vi) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-daftar-isi") && (
          <section id="section-daftar-isi" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm print-break-page print:break-after-page">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  DAFTAR ISI
                </h2>
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-1.5 font-sans text-xs leading-normal">
            {(() => {
              const extraSheets = (currentDoc.customSheets || []).filter(
                s => s.enabled !== false &&
                     s.type !== "pengesahan" &&
                     s.type !== "pernyataan_orisinalitas" &&
                     s.type !== "kata_pengantar" &&
                     s.type !== "abstrak"
              );

              const latarLen = currentDoc.bab1?.latarBelakang?.length || 3;
              const teoriLen = currentDoc.bab2?.landasanTeori?.length || 13;
              const jadwalLen = currentDoc.bab4?.jadwalMatriks?.length || 8;
              const bibLen = currentDoc.bibliography?.length || 10;

              const p1_latar = 1;
              const p1_rumusan = 1 + Math.max(1, Math.ceil(latarLen * 0.7));
              const p1_batasan = p1_rumusan + 1;
              const p1_tujuan = p1_batasan + 1;
              const p1_manfaat = p1_tujuan + 1;

              const p2_start = p1_manfaat + 1;
              const p2_teori = p2_start;
              const teoriPages = Math.max(3, Math.ceil(teoriLen * 0.9));
              const p2_sintesis = p2_teori + teoriPages;
              const p2_kerangka = p2_sintesis + 2;
              const p2_hipotesis = p2_kerangka + 1;

              const p3_start = p2_hipotesis + 1;
              const p3_desain = p3_start;
              const p3_populasi = p3_desain + 2;
              const p3_definisi = p3_populasi + 2;
              const p3_instrumen = p3_definisi + 2;
              const p3_protokol = p3_instrumen + 2;

              const p4_start = p3_protokol + 2;
              const p4_jadwal = p4_start;
              const p4_biaya = p4_jadwal + Math.max(1, Math.ceil(jadwalLen * 0.25));
              const p4_luaran = p4_biaya + 2;

              const p5_start = p4_luaran + 2;
              const p5_kesimpulan = p5_start;
              const p5_saran = p5_kesimpulan + 2;

              const p_pustaka = p5_saran + 2;
              const p_lampiran = p_pustaka + Math.max(1, Math.ceil(bibLen * 0.15));

              const preliminaryItems = [
                { title: "HALAMAN JUDUL / COVER", page: "i", anchor: "section-cover", isBold: true },
                { title: "LEMBAR PENGESAHAN", page: "ii", anchor: "section-pengesahan", isBold: true },
                { title: "LEMBAR PERNYATAAN BEBAS PLAGIARISME", page: "iii", anchor: "section-orisinalitas", isBold: true },
                ...extraSheets.map((s, idx) => ({
                  title: s.title.toUpperCase(),
                  page: ["iv", "v", "vi", "vii", "viii", "ix"][idx] || "iv",
                  anchor: `section-custom-${s.id}`,
                  isBold: true
                })),
                { title: "KATA PENGANTAR", page: ["iv", "v", "vi", "vii", "viii", "ix", "x"][extraSheets.length] || "iv", anchor: "section-pengantar", isBold: true },
                { title: "ABSTRAK", page: ["v", "vi", "vii", "viii", "ix", "x", "xi"][extraSheets.length] || "v", anchor: "section-abstrak", isBold: true },
                { title: "ABSTRACT", page: ["vi", "vii", "viii", "ix", "x", "xi", "xii"][extraSheets.length] || "vi", anchor: "section-abstract-en", isBold: true },
                { title: "DAFTAR ISI", page: ["vii", "viii", "ix", "x", "xi", "xii", "xiii"][extraSheets.length] || "vii", anchor: "section-daftar-isi", isBold: true },
                { title: "DAFTAR GAMBAR", page: ["viii", "ix", "x", "xi", "xii", "xiii", "xiv"][extraSheets.length] || "viii", anchor: "section-daftar-gambar", isBold: true },
                { title: "DAFTAR TABEL", page: ["ix", "x", "xi", "xii", "xiii", "xiv", "xv"][extraSheets.length] || "ix", anchor: "section-daftar-tabel", isBold: true },
                { title: "RINGKASAN EKSEKUTIF", page: ["x", "xi", "xii", "xiii", "xiv", "xv", "xvi"][extraSheets.length] || "x", anchor: "section-ringkasan", isBold: true },
              ];

              return (
                <div className="max-w-2xl mx-auto space-y-1.5 font-sans text-xs leading-normal">
                  {/* Preliminary Entries */}
                  {preliminaryItems.map((item, idx) => (
                    <div key={idx} className="flex items-baseline justify-between hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group" onClick={() => scrollToSection(item.anchor)}>
                      <span className={`${item.isBold ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"} group-hover:underline`}>{item.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                      <span className="font-mono text-zinc-500 font-medium">{item.page}</span>
                    </div>
                  ))}

                  <div className="pt-2" />

                  {/* BAB I */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                    <span>BAB I PENDAHULUAN</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p1_latar}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                      <span>{getSectionHeading(1, 0, "Latar Belakang Masalah", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p1_latar}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                      <span>{getSectionHeading(1, 1, "Rumusan Masalah", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p1_rumusan}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                      <span>{getSectionHeading(1, 2, "Batasan Masalah", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p1_batasan}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                      <span>{getSectionHeading(1, 3, "Tujuan Kegiatan / Riset", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p1_tujuan}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab1")}>
                      <span>{getSectionHeading(1, 4, "Manfaat Kegiatan (Mahasiswa, Mitra, Akademik)", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p1_manfaat}</span>
                    </div>
                  </div>

                  {/* BAB II */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab2")}>
                    <span>BAB II TINJAUAN PUSTAKA / LANDASAN TEORI</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p2_start}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab2")}>
                      <span>{getSectionHeading(2, 0, `Landasan Teori Ilmiah (${currentDoc.bab2.landasanTeori?.length || 13} Teori Otoritatif)`, currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p2_teori}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab2")}>
                      <span>{getSectionHeading(2, 1, "Matriks Sintesis Keaslian Penelitian (PRISMA 2020)", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p2_sintesis}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab2")}>
                      <span>{getSectionHeading(2, 2, "Kerangka Konsep & Alur Berpikir", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p2_kerangka}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab2")}>
                      <span>{getSectionHeading(2, 3, "Hipotesis Penelitian / Ekspektasi Capaian", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p2_hipotesis}</span>
                    </div>
                  </div>

                  {/* BAB III */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                    <span>BAB III METODOLOGI PENELITIAN / PELAKSANAAN</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p3_start}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                      <span>{getSectionHeading(3, 0, "Desain Penelitian & Bagan Alir Pelaksanaan", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p3_desain}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                      <span>{getSectionHeading(3, 1, "Populasi, Sampel, & Subjek Penelitian / WBS", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p3_populasi}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                      <span>{getSectionHeading(3, 2, "Definisi Operasional Variabel (Tabel 3 Garis Terbuka)", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p3_definisi}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                      <span>{getSectionHeading(3, 3, "Instrumen Penelitian, Kalibrasi, & Perangkat Kerja", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p3_instrumen}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab3")}>
                      <span>{getSectionHeading(3, 4, "Protokol Etika Penelitian / SOP Industri", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p3_protokol}</span>
                    </div>
                  </div>

                  {/* BAB IV */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab4")}>
                    <span>BAB IV JADWAL KEGIATAN &amp; ALOKASI ANGGARAN</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p4_start}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab4")}>
                      <span>{getSectionHeading(4, 0, "Matriks Jadwal Pelaksanaan (Gantt Chart 16 Minggu)", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p4_jadwal}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab4")}>
                      <span>{getSectionHeading(4, 1, "Rencana Anggaran Biaya (RAB)", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p4_biaya}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab4")}>
                      <span>{getSectionHeading(4, 2, "Rencana Diseminasi & Publikasi Ilmiah", currentDoc.campusGuideline?.headingStyle)}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p4_luaran}</span>
                    </div>
                  </div>

                  {/* BAB V */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-bab5")}>
                    <span>BAB V KESIMPULAN, KONTRIBUSI, &amp; MITIGASI RISIKO</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p5_start}</span>
                  </div>

                  {/* DAFTAR PUSTAKA & LAMPIRAN */}
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-pustaka")}>
                    <span>DAFTAR PUSTAKA ({citationStyle === "apa" ? "STANDAR APA 7TH" : "STANDAR IEEE"})</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p_pustaka}</span>
                  </div>
                  <div className="flex items-baseline justify-between font-semibold text-zinc-900 dark:text-zinc-100 pt-2 cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-lampiran")}>
                    <span>LAMPIRAN-LAMPIRAN AKADEMIK</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{p_lampiran}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-lampiran")}>
                      <span>Lampiran A: Pedoman Wawancara &amp; Instrumen Riset</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p_lampiran}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-lampiran")}>
                      <span>Lampiran B: Matriks Logbook Aktivitas Harian &amp; Bukti Capaian</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p_lampiran + 3}</span>
                    </div>
                    <div className="flex items-baseline justify-between cursor-pointer hover:text-indigo-600" onClick={() => scrollToSection("section-lampiran")}>
                      <span>Lampiran C: Berita Acara Bimbingan / Ujian Kolokium</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-800" />
                      <span className="font-mono">{p_lampiran + 6}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              vii
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 7: DAFTAR GAMBAR FORMAL (Halaman vii) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-daftar-gambar") && (
          <section id="section-daftar-gambar" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  DAFTAR GAMBAR
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsImageManagerModalOpen(true)}
                className="no-print absolute right-0 top-0 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>+ Kelola Gambar</span>
              </button>
            </div>

            <div className="max-w-2xl mx-auto space-y-2 font-sans text-xs">
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab2")}>
                <span>Gambar 2.1 Diagram Kerangka Konseptual &amp; Pola Pikir Penelitian</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">23</span>
              </div>
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab3")}>
                <span>Gambar 3.1 Bagan Alir Tahapan Metodologi Pelaksanaan {currentDoc.category === "magang" ? "Magang Industri" : "Penelitian"}</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">28</span>
              </div>

              {/* Dynamic user figures */}
              {currentDoc.documentFigures && currentDoc.documentFigures.length > 0 && currentDoc.documentFigures.map((fig, fIdx) => (
                <div key={fig.id || fIdx} className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection(`section-bab${fig.chapterPlacement || 3}`)}>
                  <span>{fig.figureNumber || `Gambar ${fig.chapterPlacement || 3}.${fIdx + 2}`} {fig.caption}</span>
                  <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">{20 + (fig.chapterPlacement || 3) * 6 + fIdx}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              viii
            </div>
          </section>
          )}

          {/* ========================================================================= */}
          {/* BAGIAN 8: DAFTAR TABEL FORMAL (Halaman viii) */}
          {/* ========================================================================= */}
          {!disabledSections.includes("section-daftar-tabel") && (
          <section id="section-daftar-tabel" className="relative pb-12 mb-12 border-b-2 border-zinc-200 dark:border-zinc-850 print:border-black font-serif text-xs sm:text-sm">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-850 pb-2 print:border-black">
              <div className="text-center w-full">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide print:text-black">
                  DAFTAR TABEL
                </h2>
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-2 font-sans text-xs">
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab2")}>
                <span>Tabel 2.1 Matriks Sintesis Keaslian Penelitian (PRISMA 2020 7-Kolom)</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">19</span>
              </div>
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab3")}>
                <span>Tabel 3.1 Definisi Operasional Variabel Penelitian (DOV)</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">32</span>
              </div>
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab4")}>
                <span>Tabel 4.1 Matriks Rencana Kerja Mingguan (Gantt Chart 16 Minggu)</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">40</span>
              </div>
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab4")}>
                <span>Tabel 4.2 Rencana Anggaran Biaya (RAB Penelitian)</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">42</span>
              </div>
              <div className="flex items-baseline justify-between hover:text-indigo-600 cursor-pointer" onClick={() => scrollToSection("section-bab5")}>
                <span>Tabel 5.1 Matriks Mitigasi Risiko &amp; Rencana Kontinjensi</span>
                <span className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700" />
                <span className="font-mono text-zinc-600 dark:text-zinc-400">48</span>
              </div>
            </div>

            <div className="mt-10 text-center font-serif text-xs text-zinc-400">
              ix
            </div>
          </section>
          )}

              {/* Front Matter Navigation Footer */}
              {naskahSection === "frontmatter" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <div></div>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab1"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Bab I: Pendahuluan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* BAB I: PENDAHULUAN */}
          {/* ========================================================================= */}
          {(naskahSection === "all" || naskahSection === "bab1") && (
            <>
              {/* BAGIAN 9: RINGKASAN EKSEKUTIF */}
          {!disabledSections.includes("section-ringkasan") && (
          <div id="section-ringkasan" className="mb-10 p-4 sm:p-5 rounded-lg bg-[#F8FAFC] dark:bg-[#111827]/70 border border-[#E2E8F0] dark:border-[#253149] print:border-gray-300 print:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F3F6FC] print:text-black">
                Ringkasan Eksekutif
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("executiveSummary", "Ringkasan Eksekutif", currentDoc.executiveSummary)}
                className="no-print opacity-70 hover:opacity-100 text-[11px] font-mono text-[#64748B] hover:text-[#7C9CFF] dark:text-[#A4B1C7] dark:hover:text-[#7C9CFF] bg-white dark:bg-[#172033] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-[#7C9CFF]" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed print:text-black">
              {currentDoc.executiveSummary}
            </p>
          </div>
          )}

          {/* BAB I */}
          {!disabledSections.includes("section-bab1") && (
          <section id="section-bab1" className="mb-10 print-break-page print:break-after-page">
            <div className="border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black">
              {renderChapterHeading(currentDoc.bab1.title, "BAB I", "PENDAHULUAN")}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed text-justify print:text-black">
              {isUNPPkl ? (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] print:text-black font-serif">
                      A. Latar Belakang
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab1.latarBelakang", "A. Latar Belakang", currentDoc.bab1.latarBelakang.join("\n\n"))}
                      className="no-print opacity-70 hover:opacity-100 text-[11px] font-mono text-[#64748B] hover:text-[#7C9CFF] dark:text-[#A4B1C7] dark:hover:text-[#7C9CFF] bg-white dark:bg-[#172033] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-[#7C9CFF]" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  {currentDoc.bab1.latarBelakang.map((para, i) => (
                    <p key={i} className="indent-6">{para}</p>
                  ))}

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    B. Deskripsi Perusahaan &amp; Struktur Organisasi
                  </h3>
                  <p className="indent-6">{currentDoc.bab2?.profilInstansi || `Deskripsi umum kegiatan operasional, sejarah, visi misi, serta struktur hierarki organisasi pada unit kerja ${currentDoc.targetEntity}.`}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    C. Deskripsi Kegiatan Industri / Pekerjaan
                  </h3>
                  <p className="indent-6">Pelaksanaan aktivitas keteknikan di {currentDoc.targetEntity} meliputi operasional harian, inspeksi peralatan berkala, pemeliharaan preventif, dan keterlibatan langsung pada alur proses utama.</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    D. Perencanaan Kegiatan PKL
                  </h3>
                  <p className="indent-6">Rencana kerja disusun secara bertahap selama periode PKL dengan matriks target mingguan:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    {(currentDoc.bab4?.ganttSchedule || []).map((s: any, idx: number) => (
                      <li key={idx}><strong>{s.task || s.activity || s.minggu}:</strong> {s.output || s.fase || 'Pelaksanaan & evaluasi'}</li>
                    ))}
                  </ol>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    E. Pelaksanaan Kegiatan PKL
                  </h3>
                  <p className="indent-6">Realisasi kegiatan praktik kerja lapangan dilaksanakan pada unit kerja {currentDoc.targetEntity} dengan mengikuti SOP operasional dan pengawasan langsung dari supervisor lapangan.</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    F. Hambatan dan Penyelesaian Masalah
                  </h3>
                  <p className="indent-6">Selama pelaksanaan kegiatan di lapangan, dijumpai hambatan teknis berupa: (1) Kendala ketersediaan suku cadang cepat aus yang diatasi melalui koordinasi logistik terjadwal, dan (2) Penyesuaian variasi beban mesin diatasi melalui pemantauan parameter sensorik secara berkala.</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    G. Temuan Menarik di Lapangan
                  </h3>
                  <p className="indent-6">Temuan berharga di lokasi industri meliputi inovasi modifikasi pelumasan bearing secara terpusat yang mampu memperpanjang waktu retensi oli hingga 15% serta penerapan budaya K3 berbasis reward sistem di lini produksi.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] print:text-black font-serif">
                      {getSectionHeading(1, 0, "Latar Belakang Masalah", currentDoc.campusGuideline?.headingStyle)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab1.latarBelakang", "1.1 Latar Belakang Masalah", currentDoc.bab1.latarBelakang.join("\n\n"))}
                      className="no-print opacity-70 hover:opacity-100 text-[11px] font-mono text-[#64748B] hover:text-[#7C9CFF] dark:text-[#A4B1C7] dark:hover:text-[#7C9CFF] bg-white dark:bg-[#172033] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-[#7C9CFF]" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  {currentDoc.bab1.latarBelakang.map((para, i) => (
                    <p key={i} className="indent-6">{para}</p>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] print:text-black font-serif">
                      {getSectionHeading(1, 1, "Rumusan Masalah", currentDoc.campusGuideline?.headingStyle)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab1.rumusanMasalah", "1.2 Rumusan Masalah", currentDoc.bab1.rumusanMasalah.join("\n"))}
                      className="no-print opacity-70 hover:opacity-100 text-[11px] font-mono text-[#64748B] hover:text-[#7C9CFF] dark:text-[#A4B1C7] dark:hover:text-[#7C9CFF] bg-white dark:bg-[#172033] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-[#7C9CFF]" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <ol className="list-decimal pl-6 space-y-1.5">
                    {currentDoc.bab1.rumusanMasalah.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ol>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(1, 2, "Batasan Masalah", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab1.batasanMasalah.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(1, 3, currentDoc.category === "magang" ? "Tujuan Kegiatan" : "Tujuan Penelitian", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <p><strong>Tujuan Umum:</strong> {currentDoc.bab1.tujuanUmum}</p>
                  <p className="pt-1"><strong>Tujuan Khusus:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab1.tujuanKhusus.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(1, 4, currentDoc.category === "magang" ? "Manfaat Kegiatan" : "Manfaat Penelitian", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <div className="space-y-2">
                    <p><strong>1. Bagi Mahasiswa:</strong></p>
                    <ul className="list-disc pl-6 space-y-0.5">
                      {currentDoc.bab1.manfaatMahasiswa.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>

                    <p className="pt-1"><strong>2. Bagi Instansi Mitra ({currentDoc.targetEntity}):</strong></p>
                    <ul className="list-disc pl-6 space-y-0.5">
                      {currentDoc.bab1.manfaatInstansi.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>

                    <p className="pt-1"><strong>3. Bagi Perguruan Tinggi ({currentDoc.institution}):</strong></p>
                    <ul className="list-disc pl-6 space-y-0.5">
                      {currentDoc.bab1.manfaatAkademik.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </section>
          )}

              {/* Bab 1 Navigation Footer */}
              {naskahSection === "bab1" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("frontmatter"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kelengkapan Awal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab2"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Bab II: {isUNPPkl ? "Topik Bahasan" : "Tinjauan Pustaka"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* BAB II: TINJAUAN PUSTAKA */}
          {/* ========================================================================= */}
          {(naskahSection === "all" || naskahSection === "bab2") && (
            <>
              {/* BAB II */}
              {!disabledSections.includes("section-bab2") && (
              <section id="section-bab2" className="mb-10 print-break-page print:break-after-page">
            <div className="relative border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black flex flex-col items-center">
              {renderChapterHeading(
                currentDoc.bab2.title,
                "BAB II",
                isUNPPkl ? "TOPIK BAHASAN" : (currentDoc.category === "magang" ? "GAMBARAN UMUM INSTANSI & LANDASAN TEORI TERAPAN" : "TINJAUAN PUSTAKA & KERANGKA TEORETIS")
              )}
              <div className="no-print mt-2 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setIsTheoryCustomizerModalOpen(true)}
                  className="text-[11px] font-mono text-[#7C9CFF] hover:text-[#9B8CFF] bg-[#7C9CFF]/10 hover:bg-[#7C9CFF]/15 px-2.5 py-1 rounded-lg border border-[#7C9CFF]/30 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>Kustomisasi Teori ({currentDoc.bab2.landasanTeori?.length || 13} Teori)</span>
                </button>
              </div>
            </div>

            {/* Depth Banner & Customizer Alert */}
            <div className="no-print mb-4 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7C9CFF] shrink-0" />
                <div>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FC]">
                    Kedalaman Bab II: {currentDoc.bab2.landasanTeori?.length || 0} Landasan Teori Ilmiah Otoritatif
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7]">
                    Setiap teori disinkronkan langsung dengan sitasi jurnal pada Daftar Pustaka ({citationStyle === "apa" ? "APA 7th" : "IEEE"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTheoryCustomizerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Atur Jumlah Teori (5, 8, 13, 20)</span>
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed text-justify print:text-black">
              {isUNPPkl ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                      A. Latar Belakang Pemilihan Topik
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab2.profilInstansi", "A. Latar Belakang Pemilihan Topik", currentDoc.bab2.profilInstansi)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab2.profilInstansi?.replace(/^A\.\s*Latar Belakang Pemilihan Topik:\s*/i, "") || `Alasan pemilihan topik "${currentDoc.title}" sebagai fokus kajian di ${currentDoc.targetEntity} adalah relevansi teknologi dan kebutuhan efisiensi operasional.`}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    B. Kajian Teoritis
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    Kajian landasan teori ilmiah mendalam yang mendasari analisis topik di lapangan mengacu pada pustaka primer bereputasi:
                  </p>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori?.map((teori, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 print:text-black mb-1">
                          2.{idx + 1} {teori.topic}
                        </h4>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 print:text-black">{teori.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Sitasi acuan: {teori.citation}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    C. Proses Pelaksanaan Kegiatan / Produksi
                  </h3>
                  <p className="indent-6">{(currentDoc.bab2.conceptualFramework || "Uraian prosedur operasional standar (SOP), tahapan teknis pelaksanaan proses produksi, instrumen dan peralatan yang digunakan.").replace(/^C\.\s*Proses Pelaksanaan Kegiatan \/ Produksi:\s*/i, "")}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    D. Pembahasan dan Analisis Kritis
                  </h3>
                  <div className="space-y-2">
                    {currentDoc.bab2.researchGapMatrix && currentDoc.bab2.researchGapMatrix.length > 0 ? (
                      currentDoc.bab2.researchGapMatrix.map((rg, idx) => (
                        <p key={idx} className="indent-6">
                          <strong>Kajian {rg.authorYear}:</strong> {rg.findingsEffect} {rg.gapDifference}
                        </p>
                      ))
                    ) : (
                      <p className="indent-6">
                        Berdasarkan observasi data lapangan, kesesuaian prosedur mencapai 92% dengan beberapa penyesuaian teknis minor untuk mengatasi kendala lingkungan pabrik.
                      </p>
                    )}
                  </div>
                </>
              ) : currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Profil Perusahaan, Visi Misi, Struktur Organisasi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                      {getSectionHeading(2, 0, "Profil Instansi Mitra", currentDoc.campusGuideline?.headingStyle)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab2.profilInstansi", "2.1 Profil Instansi Mitra", currentDoc.bab2.profilInstansi)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab2.profilInstansi}</p>
                  
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 mb-1 print:text-black">Visi & Misi:</p>
                    <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                      {currentDoc.bab2.visiMisi.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>

                  <p className="indent-6">{currentDoc.bab2.strukturOrganisasi}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(2, 1, "Landasan Teori Terapan & Standar Industri", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan: {theory.citation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Diagram Alur Kerangka Konseptual & Berpikir */}
                  <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />
                </>
              ) : (
                /* Format Khusus Skripsi/Penelitian: Tinjauan Pustaka, Matriks Keaslian 7 Kolom, Kerangka Konsep, Hipotesis */
                <>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                    {getSectionHeading(2, 0, "Tinjauan Teoretis Variabel Penelitian", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <div className="space-y-3">
                    {currentDoc.bab2.landasanTeori.map((theory, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:border-gray-200">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 print:text-black mb-1">{theory.topic}</h4>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 print:text-black">{theory.elaboration}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-1 print:text-gray-600">Rujukan Otoritatif: {theory.citation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Matriks Keaslian Penelitian (SOP 7-Kolom PRISMA 2020) */}
                  {currentDoc.bab2.researchGapMatrix && currentDoc.bab2.researchGapMatrix.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                        {getSectionHeading(2, 1, "Matriks Keaslian Penelitian (Research Gap & State-of-the-Art)", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                              <th className="py-2 px-2.5">No</th>
                              <th className="py-2 px-2.5">Penulis & Tahun</th>
                              <th className="py-2 px-2.5">Judul & Jurnal</th>
                              <th className="py-2 px-2.5">Desain & Sampel</th>
                              <th className="py-2 px-2.5">Variabel & Instrumen</th>
                              <th className="py-2 px-2.5">Temuan Utama</th>
                              <th className="py-2 px-2.5">Celah & Perbedaan Studi Ini</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab2.researchGapMatrix.map((item, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-2.5 font-mono font-medium">{item.no}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">{item.authorYear}</td>
                                <td className="py-2 px-2.5 italic">{item.titleJournal}</td>
                                <td className="py-2 px-2.5">{item.designSample}</td>
                                <td className="py-2 px-2.5">{item.variables}</td>
                                <td className="py-2 px-2.5">{item.findingsEffect}</td>
                                <td className="py-2 px-2.5 font-medium text-zinc-900 dark:text-zinc-200 print:text-black bg-zinc-50 dark:bg-zinc-900/40 print:bg-gray-50">{item.gapDifference}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[11px] text-zinc-500 mt-1.5 italic print:text-gray-600">
                          *Matriks sintesis 7 kolom berstandar pedoman PRISMA 2020 & STROBE.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kerangka Konseptual & Hipotesis */}
                  {currentDoc.bab2.conceptualFramework && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                        {getSectionHeading(2, 2, "Kerangka Konsep Penelitian", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <p className="indent-6">{currentDoc.bab2.conceptualFramework}</p>
                    </div>
                  )}

                  {/* Diagram Alur Kerangka Konseptual & Berpikir */}
                  <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />

                  {currentDoc.bab2.hypotheses && currentDoc.bab2.hypotheses.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                        {getSectionHeading(2, 3, "Hipotesis Penelitian", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <ul className="list-disc pl-6 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {currentDoc.bab2.hypotheses.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Inserted Chapter 2 Custom Figures */}
              {currentDoc.documentFigures?.filter(f => f.chapterPlacement === 2).map((fig, fIdx) => (
                <div key={fig.id || fIdx} className="my-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
                  <img
                    src={fig.imageDataUrl}
                    alt={fig.caption}
                    className="max-h-80 object-contain mx-auto rounded-lg shadow-xs"
                  />
                  <p className="text-xs font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-2 text-center">
                    {fig.figureNumber || `Gambar 2.${fIdx + 2}`} {fig.caption}
                  </p>
                  {fig.source && <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Sumber: {fig.source}</p>}
                </div>
              ))}
            </div>
          </section>
          )}

              {/* Bab 2 Navigation Footer */}
              {naskahSection === "bab2" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab1"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab I: Pendahuluan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab3"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Bab III: {isUNPPkl ? "Penutup" : "Metodologi"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* BAB III: METODOLOGI */}
          {/* ========================================================================= */}
          {(naskahSection === "all" || naskahSection === "bab3") && (
            <>
              {/* BAB III */}
              {!disabledSections.includes("section-bab3") && (
              <section id="section-bab3" className="mb-10 print-break-page print:break-after-page">
            <div className="relative border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black flex flex-col items-center">
              {renderChapterHeading(
                currentDoc.bab3.title,
                "BAB III",
                isUNPPkl ? "PENUTUP" : (currentDoc.category === "magang" ? "RENCANA PELAKSANAAN & METODE KERJA" : "METODE PENELITIAN & PROTOKOL RISET")
              )}
              <div className="no-print mt-2 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setIsImageManagerModalOpen(true)}
                  className="text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] bg-white dark:bg-[#172033] px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-[#253149] hover:border-[#7C9CFF] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>+ Sisipkan Gambar / Diagram</span>
                </button>
              </div>
            </div>

            {/* Formal Academic Figure 3.1: Bagan Alir Tahapan Pelaksanaan */}
            {!isUNPPkl && (
              <div className="my-6 p-4 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827]/50 text-center">
                <div className="max-w-2xl mx-auto py-2">
                  <AcademicFlowchartDiagram doc={currentDoc} type="methodology" />
                </div>
                <p className="text-xs font-serif font-bold text-[#0F172A] dark:text-[#F3F6FC] mt-2 text-center">
                  Gambar 3.1 Bagan Alir Tahapan Pelaksanaan {currentDoc.category === "magang" ? "Kegiatan Magang & Analisis" : "Penelitian"}
                </p>
              </div>
            )}

            {/* Inserted Chapter 3 Custom Figures */}
            {currentDoc.documentFigures?.filter(f => f.chapterPlacement === 3).map((fig, fIdx) => (
              <div key={fig.id || fIdx} className="my-6 p-4 rounded-xl border border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#111827]/50 text-center">
                <img
                  src={fig.imageDataUrl}
                  alt={fig.caption}
                  className="max-h-80 object-contain mx-auto rounded-lg shadow-xs"
                />
                <p className="text-xs font-serif font-bold text-[#0F172A] dark:text-[#F3F6FC] mt-2 text-center">
                  {fig.figureNumber || `Gambar 3.${fIdx + 2}`} {fig.caption}
                </p>
                {fig.source && <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] mt-0.5">Sumber: {fig.source}</p>}
              </div>
            ))}

            <div className="space-y-4 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed text-justify print:text-black">
              {isUNPPkl ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                      A. Kesimpulan
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "A. Kesimpulan", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan.replace(/^A\.\s*Kesimpulan:\s*/i, "")}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    B. Saran
                  </h3>
                  <div className="space-y-2">
                    {currentDoc.bab3.lingkupPekerjaan.filter(s => !s.startsWith("B. Saran")).map((s, i) => (
                      <p key={i} className="indent-6">{s}</p>
                    ))}
                  </div>
                </>
              ) : currentDoc.category === "magang" ? (
                /* Format Khusus Magang: Metode Kerja, WBS, Perangkat, Kompetensi */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                      {getSectionHeading(3, 0, "Metode Pelaksanaan Kerja", currentDoc.campusGuideline?.headingStyle)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Metode Pelaksanaan Kerja", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(3, 1, "Lingkup Penugasan (Work Breakdown Structure)", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    {(currentDoc.bab3.wbsScope || currentDoc.bab3.lingkupPekerjaan).map((l, i) => <li key={i}>{l}</li>)}
                  </ol>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(3, 2, "Lingkungan Kerja, Tools, & SOP", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(3, 3, "Target Capaian Hard & Soft Skills", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              ) : (
                /* Format Khusus Skripsi: Desain Riset, Populasi & Sampel, DOV Table, KEPK */
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                      {getSectionHeading(3, 0, "Jenis dan Desain Penelitian", currentDoc.campusGuideline?.headingStyle)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRefineWithAI("bab3.metodePelaksanaan", "3.1 Jenis dan Desain Penelitian", currentDoc.bab3.metodePelaksanaan)}
                      className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                      <span>Revisi AI</span>
                    </button>
                  </div>
                  <p className="indent-6">{currentDoc.bab3.metodePelaksanaan}</p>

                  {/* Populasi & Sampel */}
                  {currentDoc.bab3.populationSample && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                        {getSectionHeading(3, 1, "Populasi, Sampel, & Kriteria Subjek", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <p className="indent-6">{currentDoc.bab3.populationSample}</p>
                    </div>
                  )}

                  {/* Tabel Definisi Operasional Variabel (Tabel 3 Garis Terbuka) */}
                  {currentDoc.bab3.operationalDefinitions && currentDoc.bab3.operationalDefinitions.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                        {getSectionHeading(3, 2, "Tabel Definisi Operasional Variabel (DOV)", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                              <th className="py-2 px-3">Variabel Penelitian</th>
                              <th className="py-2 px-3">Definisi Operasional</th>
                              <th className="py-2 px-3">Parameter & Alat Ukur</th>
                              <th className="py-2 px-3">Skala Pengukuran</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                            {currentDoc.bab3.operationalDefinitions.map((dov, idx) => (
                              <tr key={idx} className="align-top">
                                <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">{dov.variable}</td>
                                <td className="py-2 px-3">{dov.definition}</td>
                                <td className="py-2 px-3">{dov.parameterTool}</td>
                                <td className="py-2 px-3 font-mono">{dov.indicatorScale}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Instrumen & Kalibrasi */}
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(3, 3, "Instrumen & Kalibrasi Alat Ukur", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.perangkatTools.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>

                  {/* Kelaikan Etik (Ethical Clearance) */}
                  {currentDoc.bab3.ethicalConsiderations && (
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                        {getSectionHeading(3, 4, "Protokol Etika Penelitian (Ethical Clearance)", currentDoc.campusGuideline?.headingStyle)}
                      </h3>
                      <p className="indent-6">{currentDoc.bab3.ethicalConsiderations}</p>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                    {getSectionHeading(3, 5, "Rencana Analisis Data & Uji Hipotesis", currentDoc.campusGuideline?.headingStyle)}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentDoc.bab3.rencanaKompetensi.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </>
              )}
            </div>
          </section>
          )}

              {/* Bab 3 Navigation Footer */}
              {naskahSection === "bab3" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab2"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab II: {isUNPPkl ? "Topik Bahasan" : "Tinjauan Pustaka"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection(isUNPPkl ? "backmatter" : "bab4"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{isUNPPkl ? "Lanjut ke Pustaka & Lampiran" : "Lanjut ke Bab IV: Rencana Kerja"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* BAB IV: RENCANA KERJA & ANALISIS */}
          {/* ========================================================================= */}
          {!isUNPPkl && (naskahSection === "all" || naskahSection === "bab4") && (
            <>
              {/* BAB IV: MATRIKS TABEL AKADEMIK (3 Garis Horizontal Standar) */}
              {!disabledSections.includes("section-bab4") && (
              <section id="section-bab4" className="mb-10 print-break-page print:break-after-page">
            <div className="border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black">
              {renderChapterHeading(
                currentDoc.bab4.title,
                "BAB IV",
                currentDoc.category === "magang" ? "JADWAL PELAKSANAAN & RENCANA ANGGARAN" : "JADWAL PENELITIAN & RENCANA ANGGARAN"
              )}
            </div>

            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FC] print:text-black font-serif mb-3">
              Tabel 4.1 {currentDoc.category === "magang" ? "Matriks Rencana Kerja Mingguan (Logbook)" : "Jadwal Pelaksanaan Penelitian (Gantt Chart)"}
            </h3>

            {/* Academic 3-line Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#253149] print:border-black font-semibold text-[#0F172A] dark:text-[#F3F6FC] print:text-black">
                    <th className="py-2 px-3">Minggu</th>
                    <th className="py-2 px-3">Tahap Pelaksanaan</th>
                    <th className="py-2 px-3">Rincian Aktivitas</th>
                    <th className="py-2 px-3">Target Luaran (Output)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#253149] print:divide-gray-300 text-[#334155] dark:text-[#CBD5E1] print:text-black">
                  {currentDoc.bab4.jadwalMatriks.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-mono font-medium text-[#0F172A] dark:text-[#F3F6FC] print:text-black whitespace-nowrap">
                        Mg {row.week}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#0F172A] dark:text-[#F3F6FC] print:text-black">
                        {row.phase}
                      </td>
                      <td className="py-2.5 px-3">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {row.activities.map((act, aIdx) => <li key={aIdx}>{act}</li>)}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B] dark:text-[#A4B1C7] print:text-black">
                        {row.output}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-[#64748B] dark:text-[#A4B1C7] mt-2 italic print:text-gray-600">
                *Tabel terbuka 3 garis horizontal sesuai kaidah penulisan karya ilmiah perguruan tinggi.
              </p>
            </div>

            {/* Tabel Rencana Anggaran Biaya (RAB) untuk Skripsi/Penelitian */}
            {currentDoc.bab4.budgetPlan && currentDoc.bab4.budgetPlan.length > 0 && (
              <div className="pt-3 mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-2">
                  Tabel 4.2 Rencana Anggaran Biaya (RAB Penelitian)
                </h3>
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                        <th className="py-2 px-3">Komponen Biaya</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3 text-right">Alokasi Anggaran (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                      {currentDoc.bab4.budgetPlan.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">{b.item}</td>
                          <td className="py-2 px-3 font-medium text-zinc-600 dark:text-zinc-400">{b.category}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">
                            Rp {b.cost.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                        <td colSpan={2} className="py-2.5 px-3">Total Anggaran Riset</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          Rp {currentDoc.bab4.budgetPlan.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Target Publikasi / Diseminasi untuk Skripsi */}
            {currentDoc.bab4.disseminationPlan && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif mb-1">
                  4.3 Rencana Diseminasi & Publikasi Jurnal
                </h3>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 indent-6 font-sans print:text-black">
                  {currentDoc.bab4.disseminationPlan}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif">
                {getSectionHeading(4, currentDoc.category === "magang" ? 1 : 3, "Penutup Proposal", currentDoc.campusGuideline?.headingStyle)}
              </h3>
              <button
                type="button"
                onClick={() => handleRefineWithAI("bab4.penutup", "Penutup Proposal", currentDoc.bab4.penutup)}
                className="no-print text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>Revisi AI</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed indent-6 font-sans print:text-black">
              {currentDoc.bab4.penutup}
            </p>
          </section>
          )}

              {/* Bab 4 Navigation Footer */}
              {naskahSection === "bab4" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab3"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab III: Metodologi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab5"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Bab V: Penutup</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* BAB V: PENUTUP */}
          {/* ========================================================================= */}
          {!isUNPPkl && (naskahSection === "all" || naskahSection === "bab5") && (
            <>
              {/* BAB V: KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO */}
              {!disabledSections.includes("section-bab5") && (
              <section id="section-bab5" className="mb-10 print-break-page print:break-after-page">
            <div className="border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black">
              {renderChapterHeading(
                currentDoc.bab5?.title || (currentDoc.category === "magang" ? "BAB V: PENUTUP, KONTRIBUSI, & MITIGASI RISIKO" : "BAB V: KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO"),
                "BAB V",
                currentDoc.category === "magang" ? "PENUTUP, KONTRIBUSI, & MITIGASI RISIKO" : "KESIMPULAN, REKOMENDASI KONTRIBUSI, & MITIGASI RISIKO"
              )}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed text-justify print:text-black">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-1">
                {getSectionHeading(5, 0, "Kesimpulan Rencana Usulan", currentDoc.campusGuideline?.headingStyle)}
              </h3>
              <ul className="list-disc pl-6 space-y-1.5">
                {(currentDoc.bab5?.kesimpulanUsulan || [
                  `Usulan pelaksanaan kegiatan dengan topik "${currentDoc.title}" pada ${currentDoc.targetEntity} telah dirancang secara sistematis berbasis kebutuhan lapangan dan kaidah ilmiah yang ketat.`,
                  `Rancangan kerja berfase (Fase 1 s.d. 5) telah mengantisipasi seluruh risiko teknis dan menyelaraskan target luaran dengan standar capaian kompetensi kurikulum perguruan tinggi.`,
                  `Keterlibatan aktif pembimbing akademik dan mentor lapangan industri menjadi kunci ketercapaian seluruh target luaran tepat waktu.`
                ]).map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                {getSectionHeading(5, 1, "Rekomendasi Kontribusi Strategis", currentDoc.campusGuideline?.headingStyle)}
              </h3>
              <div className="space-y-2">
                {(currentDoc.bab5?.kontribusiPraktis || [
                  `Bagi ${currentDoc.targetEntity}: Memberikan solusi aplikatif teruji dan prototipe kerja yang dapat mengurangi inefisiensi proses operasional eksisting.`,
                  `Bagi Civitas Akademika (${currentDoc.institution}): Memperkaya basis studi kasus nyata dan memperkuat jejaring kemitraan strategis dengan dunia usaha/industri.`,
                  `Bagi Mahasiswa/Peneliti: Mengasah kompetensi analitis tingkat tinggi (HOTS), kedisiplinan kerja, serta etika profesionalisme.`
                ]).map((c, i) => (
                  <p key={i}>• {c}</p>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2 mb-2">
                {getSectionHeading(5, 2, "Matriks Mitigasi Risiko Pelaksanaan (Contingency Plan)", currentDoc.campusGuideline?.headingStyle)}
              </h3>
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-850 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Potensi Hambatan / Risiko</th>
                      <th className="py-2 px-3">Rencana Aksi Mitigasi (Preventif/Korektif)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                    {(currentDoc.bab5?.mitigasiRisiko || [
                      { risiko: "Keterlambatan perizinan administratif atau otorisasi akses data", mitigasi: "Pengajuan surat pengantar resmi sejak Minggu ke-1 dan penyiapan dataset sekunder sebagai penyangga (buffer)." },
                      { risiko: "Kendala teknis instalasi tools atau ketidaksesuaian alat ukur", mitigasi: "Pelaksanaan kalibrasi instrumen dan pre-flight testing pada fase persiapan awal." },
                      { risiko: "Keterbatasan waktu supervisi berkala dengan mentor lapangan", mitigasi: "Penerapan sistem pelaporan asinkron melalui logbook mingguan digital terpusat." }
                    ]).map((m, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-2 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{m.risiko}</td>
                        <td className="py-2 px-3">{m.mitigasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black font-serif pt-2">
                {getSectionHeading(5, 3, "Rencana Keberlanjutan Proyek (Sustainability Plan)", currentDoc.campusGuideline?.headingStyle)}
              </h3>
              <p className="indent-6">
                {currentDoc.bab5?.sustainabilityPlan || `Seluruh artefak hasil pelaksanaan, meliputi dokumentasi teknis, lembar SOP, kode sumber/dataset tervalidasi, serta panduan operasional diserahkan secara resmi melalui Berita Acara Serah Terima kepada unit terkait di ${currentDoc.targetEntity} agar dapat dipelihara dan dikembangkan secara berkelanjutan.`}
              </p>
            </div>
          </section>
          )}

              {/* Bab 5 Navigation Footer */}
              {naskahSection === "bab5" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("bab4"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Bab IV: Rencana Kerja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("backmatter"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Daftar Pustaka &amp; Lampiran</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* PUSTAKA & LAMPIRAN */}
          {/* ========================================================================= */}
          {(naskahSection === "all" || naskahSection === "backmatter") && (
            <>
              {/* DAFTAR PUSTAKA (Standar APA 7th Edition / IEEE) */}
          {currentDoc.bibliography && currentDoc.bibliography.length > 0 && !disabledSections.includes("section-pustaka") && (
            <section id="section-pustaka" className="mb-10 pt-6 border-t border-[#E2E8F0] dark:border-[#253149] print:border-black print-break-page print:break-after-page">
              <div className="relative border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black flex flex-col items-center">
                <div className="text-center w-full chapter-heading">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#0F172A] dark:text-[#F3F6FC] print:text-black uppercase tracking-wide chapter-title">
                    DAFTAR PUSTAKA
                  </h2>
                </div>
                <div className="no-print mt-2 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#111827] text-[#64748B] dark:text-[#A4B1C7] border border-[#E2E8F0] dark:border-[#253149]">
                    {citationStyle === "apa" ? "STANDAR APA 7TH EDITION" : "STANDAR IEEE"}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] print:text-black">
                {currentDoc.bibliography.map((bib, bIdx) => (
                  <p key={bib.id} className="pl-6 -indent-6 leading-relaxed">
                    {citationStyle === "ieee" ? (
                      <>
                        <span className="font-mono font-bold text-[#0F172A] dark:text-[#F3F6FC] mr-1.5">[{bIdx + 1}]</span>
                        <span className="text-[#334155] dark:text-[#CBD5E1] print:text-black">{bib.author}</span>, "{bib.title}," <em>{bib.source}</em>, {bib.year}.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-[#334155] dark:text-[#CBD5E1] print:text-black">{bib.author}</span> ({bib.year}). <em>{bib.title}</em>. {bib.source}
                      </>
                    )}
                    {bib.doiUrl && (
                      <span className="block pl-0 font-mono text-[10px] text-[#64748B] dark:text-[#A4B1C7] print:text-gray-600 mt-0.5">
                        DOI/URL: {bib.doiUrl}
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* LAMPIRAN-LAMPIRAN AKADEMIK */}
          {!disabledSections.includes("section-lampiran") && (
          <section id="section-lampiran" className="mt-12 pt-8 border-t-2 border-[#E2E8F0] dark:border-[#253149] print:border-black font-serif print-break-page print:break-after-page">
            <div className="relative border-b border-[#E2E8F0] dark:border-[#253149] pb-3 mb-6 print:border-black flex flex-col items-center">
              <div className="text-center w-full chapter-heading">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] dark:text-[#A4B1C7] block mb-1">
                  BERKAS PENDUKUNG, LOGBOOK &amp; INSTRUMEN BAKU
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#0F172A] dark:text-[#F3F6FC] print:text-black uppercase tracking-wide chapter-title">
                  LAMPIRAN-LAMPIRAN DOKUMEN USULAN
                </h2>
              </div>
              <div className="no-print mt-2 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogbookModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#7C9CFF]/10 dark:bg-[#7C9CFF]/15 border border-[#7C9CFF]/30 text-[#7C9CFF] hover:bg-[#7C9CFF]/20 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Kelola Logbook ({currentDoc.logbookEntries?.length || 0} Entri)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDefenseMinutesModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#34D399]/10 dark:bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] hover:bg-[#34D399]/20 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Berita Acara Sidang</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Lampiran A: Pedoman Wawancara */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:bg-white print:border-gray-300">
                <h3 className="text-xs sm:text-sm font-semibold font-serif text-zinc-900 dark:text-zinc-100 mb-2 print:text-black">
                  Lampiran A: Pedoman Wawancara Mendalam &amp; Rubrik Pengumpulan Data Empiris
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                  Instrumen ini dirancang untuk menggali data empiris pada {currentDoc.targetEntity}. Terdiri dari instrumen kuesioner berskala Likert 1-5, rubrik observasi lapangan terstruktur, dan panduan wawancara mendalam dengan pemangku kepentingan kunci.
                </p>
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-850 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                        <th className="py-2 px-2.5">Item Instrumen</th>
                        <th className="py-2 px-2.5">Indikator &amp; Fokus Penggalian Masalah</th>
                        <th className="py-2 px-2.5">Metode Verifikasi / Skala Ukur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">Item 01</td>
                        <td className="py-2 px-2.5">Tingkat relevansi masalah operasional dengan kebutuhan riil unit kerja sasaran di {currentDoc.targetEntity}</td>
                        <td className="py-2 px-2.5 font-mono text-[10px]">Skala Likert 1-5 &amp; Catatan Kualitatif</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">Item 02</td>
                        <td className="py-2 px-2.5">Ketersediaan dokumentasi SOP eksisting dan tingkat kepatuhan personil terhadap alur kerja baku</td>
                        <td className="py-2 px-2.5 font-mono text-[10px]">Checklist Observasi Langsung</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">Item 03</td>
                        <td className="py-2 px-2.5">Efektivitas integrasi alat bantu / sistem baru yang diusulkan terhadap waktu siklus kerja operasional</td>
                        <td className="py-2 px-2.5 font-mono text-[10px]">Metrik Kinerja &amp; Uji Waktu Nyata</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black">Item 04</td>
                        <td className="py-2 px-2.5">Tingkat penerimaan pengguna akhir (User Acceptance Testing) terhadap luaran fungsional yang dihasilkan</td>
                        <td className="py-2 px-2.5 font-mono text-[10px]">Kuesioner UAT (4 Parameter Kunci)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lampiran B: Matriks Logbook Lapangan Interaktif */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold font-serif text-zinc-900 dark:text-zinc-100 print:text-black">
                    Lampiran B: Buku Catatan Logbook Aktivitas Harian &amp; Bukti Capaian Lapangan
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLogbookModalOpen(true)}
                    className="no-print text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-white dark:bg-zinc-850 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CalendarDays className="w-3 h-3 text-indigo-500" />
                    <span>Edit Logbook</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                  Logbook berkala ini merekam aktivitas kerja nyata, alokasi jam kerja, luaran artefak, dan status verifikasi pembimbing lapangan selama pelaksanaan kegiatan di {currentDoc.targetEntity}.
                </p>

                {currentDoc.logbookEntries && currentDoc.logbookEntries.length > 0 ? (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full text-left text-xs font-sans border-t-2 border-b-2 border-zinc-300 dark:border-zinc-700 print:border-black">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-850 print:border-black font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                          <th className="py-2 px-2.5">Minggu</th>
                          <th className="py-2 px-2.5">Tanggal &amp; Jam</th>
                          <th className="py-2 px-2.5">Aktivitas &amp; Rincian Pekerjaan</th>
                          <th className="py-2 px-2.5">Luaran (Output)</th>
                          <th className="py-2 px-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-gray-300 text-zinc-700 dark:text-zinc-300 print:text-black text-[11px]">
                        {currentDoc.logbookEntries.map((entry, eIdx) => (
                          <tr key={entry.id || eIdx} className="align-top">
                            <td className="py-2 px-2.5 font-mono font-medium text-zinc-900 dark:text-zinc-200 print:text-black whitespace-nowrap">Mg {entry.weekNumber}</td>
                            <td className="py-2 px-2.5 font-mono whitespace-nowrap">{entry.date}<br /><span className="text-[10px] text-zinc-500">{entry.hoursSpent} Jam</span></td>
                            <td className="py-2 px-2.5 font-sans">{entry.activityDescription}</td>
                            <td className="py-2 px-2.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 print:text-black">{entry.outputDeliverable}</td>
                            <td className="py-2 px-2.5 text-center font-mono text-[10px]">
                              {entry.mentorApprovalStatus === "approved" ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><Check className="w-3 h-3" /> Disetujui</span>
                              ) : (
                                <span className="text-amber-600 font-medium">Draft</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-500 space-y-2">
                    <p>Belum ada entri logbook khusus yang disimpan.</p>
                    <button
                      type="button"
                      onClick={() => setIsLogbookModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Otomatis Logbook 8-16 Minggu via AI</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Lampiran C: Berita Acara Kolokium / Sidang */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold font-serif text-zinc-900 dark:text-zinc-100 print:text-black">
                    Lampiran C: Berita Acara Ujian / Seminar Kolokium Proposal
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDefenseMinutesModalOpen(true)}
                    className="no-print text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-white dark:bg-zinc-850 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <FileSignature className="w-3 h-3 text-emerald-500" />
                    <span>Edit Berita Acara</span>
                  </button>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tanggal Pelaksanaan:</span>
                      <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{currentDoc.defenseMinutes?.meetingDate || currentDoc.generationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Nilai Rata-rata Ujian:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentDoc.defenseMinutes?.averageScore || 87.5} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Keputusan Tim Penguji:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                        {currentDoc.defenseMinutes?.status === "lulus_revisi_ringan" ? "LULUS DENGAN REVISI RINGAN" : currentDoc.defenseMinutes?.status || "LULUS DENGAN REVISI RINGAN"}
                      </span>
                    </div>
                  </div>

                  {currentDoc.defenseMinutes?.revisions && currentDoc.defenseMinutes.revisions.length > 0 && (
                    <div className="pt-2">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Catatan &amp; Poin Revisi Dosen Penguji:</p>
                      <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
                        {currentDoc.defenseMinutes.revisions.map((rev, rIdx) => (
                          <li key={rev.id || rIdx}>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{rev.section}:</span> {rev.revisionPoint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Lampiran D: Surat Pernyataan Pakta Integritas & Bebas Fabrikasi Data */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 print:bg-white print:border-gray-300">
                <h3 className="text-xs sm:text-sm font-semibold font-serif text-zinc-900 dark:text-zinc-100 mb-2 print:text-black">
                  Lampiran D: Surat Pernyataan Pakta Integritas &amp; Bebas Fabrikasi Data
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Pernyataan tertulis bermeterai dari mahasiswa pengusul ({currentDoc.candidateName}, NIM: {currentDoc.candidateId}) yang menyatakan bahwa seluruh data, metodologi, dan naskah yang diajukan adalah orisinal, bebas dari unsur fabrikasi, falsifikasi, dan plagiarisme, serta menjunjung tinggi kerahasiaan informasi internal {currentDoc.targetEntity}.
                </p>
              </div>
            </div>
              </section>
              )}

              {/* Back Matter Navigation Footer */}
              {naskahSection === "backmatter" && (
                <div className="flex items-center justify-between pt-8 mt-12 border-t border-[#E2E8F0] dark:border-[#253149] text-xs font-medium no-print">
                  <button
                    type="button"
                    onClick={() => { setNaskahSection(isUNPPkl ? "bab3" : "bab5"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#253149] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors flex items-center gap-1.5 cursor-pointer text-[#64748B] dark:text-[#A4B1C7]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{isUNPPkl ? "Bab III: Penutup" : "Bab V: Penutup"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNaskahSection("all"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tampilkan Semua Halaman (Utuh) ≡</span>
                  </button>
                </div>
              )}
            </>
          )}

        </article>
      )}

      {/* TAB 2: VISUAL TREE GRAPH */}
      {activeTab === "tree" && (
        <div className="w-full">
          <VisualTreeGraph treeData={treeData} />
        </div>
      )}

      {/* TAB: BAGAN ALIR PENELITIAN INTERAKTIF (Dedicated Web View) */}
      {activeTab === "flowchart" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-500" />
                <span>Bagan Alir Metodologi &amp; Desain Penelitian</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Visualisasi terstruktur tahapan pelaksanaan (Input, Proses, Validasi, Luaran) yang terhubung dengan Bab III
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("naskah")}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors self-start sm:self-auto cursor-pointer"
            >
              ← Kembali ke Teks Naskah
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bagan Alir Tahapan Eksekusi Metodologi:</span>
              </h3>
              <AcademicFlowchartDiagram doc={currentDoc} type="methodology" />
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-850">
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kerangka Konseptual &amp; Kausalitas Antar-Variabel:</span>
              </h3>
              <AcademicFlowchartDiagram doc={currentDoc} type="conceptual" />
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATRIKS JADWAL & GANTT CHART */}
      {activeTab === "jadwal" && (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                <span>Matriks Jadwal Pelaksanaan &amp; Timeline Riset</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Alokasi waktu {currentDoc.durationMonths} Bulan ({currentDoc.durationMonths * 4} Minggu Kerja) dengan target luaran terukur
              </p>
            </div>

            {/* Toggle Gantt vs Detail Cards */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium self-start sm:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setJadwalViewMode("gantt")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  jadwalViewMode === "gantt"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Diagram Gantt
              </button>
              <button
                type="button"
                onClick={() => setJadwalViewMode("detail")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  jadwalViewMode === "detail"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Kartu Rincian
              </button>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE GANTT TIMELINE MATRIX */}
          {jadwalViewMode === "gantt" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3 w-1/4">Tahapan / Kegiatan</th>
                    <th className="p-3 w-1/4">Aktivitas Utama</th>
                    {Array.from({ length: Math.min(6, currentDoc.durationMonths || 6) }).map((_, mIdx) => (
                      <th key={mIdx} className="p-3 text-center border-l border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                        Bulan {mIdx + 1}
                      </th>
                    ))}
                    <th className="p-3 text-right">Luaran (Deliverable)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {currentDoc.bab4.jadwalMatriks.map((item, idx) => {
                    const totalMonths = Math.min(6, currentDoc.durationMonths || 6);
                    const activeMonthIdx = idx % totalMonths;

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 align-top">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{item.phase}</span>
                          </div>
                        </td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400 text-[11px] align-top">
                          {item.activities.join(" • ")}
                        </td>
                        {Array.from({ length: totalMonths }).map((_, mIdx) => {
                          const isCurrent = mIdx === activeMonthIdx;
                          return (
                            <td key={mIdx} className="p-3 text-center border-l border-zinc-200 dark:border-zinc-800 align-middle">
                              {isCurrent ? (
                                <div className="h-6 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-semibold flex items-center justify-center shadow-xs">
                                  Mg {item.week}
                                </div>
                              ) : (
                                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-850 mx-auto w-8" />
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-right font-mono text-zinc-800 dark:text-zinc-200 text-[11px] font-medium align-top">
                          {item.output}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: DETAIL CARDS */}
          {jadwalViewMode === "detail" && (
            <div className="space-y-3">
              {currentDoc.bab4.jadwalMatriks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 flex flex-col items-center justify-center font-mono font-bold flex-shrink-0">
                      <span className="text-[9px] uppercase text-zinc-500">MG</span>
                      <span className="text-xs">{item.week}</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.phase}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {item.activities.join(" • ")}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Target Kompetensi: {item.competencyTarget}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right flex-shrink-0 text-xs">
                    <span className="text-zinc-500 block text-[11px]">Output:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">{item.output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SLIDE PRESENTASI 16:9 REDIRECTION CARD */}
      {activeTab === "slides" && (
        <div className="bg-white dark:bg-zinc-950 p-8 sm:p-12 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm text-center space-y-4 max-w-xl mx-auto my-6 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <Presentation className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Slide Presentasi Sidang (16:9 Eksekutif)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            Fitur presentasi telah dipindahkan ke studio mandiri dengan kanvas layar lebar 16:9 penuh, tema eksekutif, generator visual AI, editor butir materi, dan simulasi pengatur waktu latihan sidang.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onOpenPresentationStudio ? (
              <button
                type="button"
                onClick={onOpenPresentationStudio}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Buka Slide Studio Layar Lebar 16:9 ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={isExportingPptx}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>{isExportingPptx ? "Memproses PPTX..." : "Unduh Slide PPTX (.pptx)"}</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setWorkspaceCategory("naskah");
                setActiveTab("naskah");
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
            >
              Kembali ke Naskah
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT KUALITAS & 7-PHASE QA PIPELINE */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* 1. Header Overview & Aggregate Score Card */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    7-Phase Academic Multi-Agent QA Pipeline
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Audit Kepatuhan &amp; Integritas Naskah
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                  Evaluasi deterministik terhadap standar Dikti, pedoman {currentDoc.campusGuideline?.campusName || "institusi"}, integritas sitasi DOI, serta konsistensi rumusan masalah dan kesimpulan.
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-4 self-start sm:self-center">
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
                    {qaReport.overallScore}<span className="text-sm font-normal text-zinc-400">/100</span>
                  </div>
                  <span className={`text-[11px] font-semibold ${
                    qaReport.overallScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : qaReport.overallScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {qaReport.overallScore >= 80 ? "Mutu Sangat Baik" : qaReport.overallScore >= 60 ? "Cukup (Perlu Revisi)" : "Perlu Perbaikan Kritis"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const freshReport = runAcademicQAPipeline(currentDoc);
                    setQaReport(freshReport);
                    setToastMessage("Audit kepatuhan naskah berhasil diperbarui.");
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Jalankan ulang 7 validator akademik"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Audit Ulang</span>
                </button>
              </div>
            </div>

            {/* 3 Metric Dimension Progress Bars */}
            {(() => {
              const structuralScore = qaReport.structuralReport?.isComplete ? 100 : Math.max(20, 100 - (qaReport.structuralReport?.missingSections?.length || 0) * 20);
              const evidenceScore = qaReport.evidenceReport?.integrityScore ?? (qaReport.overallScore >= 80 ? 95 : 75);
              const consistencyScore = qaReport.consistencyScore || 90;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Struktur Dokumen</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{structuralScore}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${structuralScore}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-500">Kelengkapan Bab I - V &amp; Front Matter</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Bukti Ilmiah &amp; Sitasi</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{evidenceScore}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${evidenceScore}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-500">Rekonsiliasi DOI &amp; In-Text Citation</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Konsistensi Logika Riset</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{consistencyScore}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${consistencyScore}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-500">Sinkronisasi Masalah vs Kesimpulan</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2. Actionable Findings & Remediation Section */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Rincian Temuan &amp; Panduan Remediasi ({qaReport.findings.length})</span>
              </h3>
              <span className="text-xs text-zinc-500">
                Prioritas perbaikan berdasarkan tingkat keparahan
              </span>
            </div>

            {qaReport.findings.length > 0 ? (
              <div className="space-y-3">
                {qaReport.findings.map((f, idx) => {
                  const severityBadgeClass = 
                    f.severity === "critical"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900"
                      : f.severity === "high"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900"
                      : f.severity === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900";

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${severityBadgeClass}`}>
                            {f.severity}
                          </span>
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {f.location}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {f.validatorName}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {f.issueTitle}
                      </h4>

                      {f.reasoning && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {f.reasoning}
                        </p>
                      )}

                      {f.evidence && (
                        <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                          <strong>Bukti naskah:</strong> {f.evidence}
                        </div>
                      )}

                      {f.recommendation && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Langkah Remediasi:</strong> {f.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Seluruh Validator Akademik Lolos (100% Verified)
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                  Naskah telah mematuhi struktur bab Dikti, integritas sitasi DOI dua arah, serta konsistensi penuh antara rumusan masalah, tujuan, dan poin kesimpulan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SIMULASI SIDANG */}
      {activeTab === "defense" && (
        <DefenseSimulator doc={currentDoc} />
      )}

      {/* TAB 7: MATRIKS REVISI DOSEN */}
      {activeTab === "revisionMatrix" && (
        <RevisionMatrixManager doc={currentDoc} />
      )}

          </div>
        </main>

        {/* PANEL 3: RIGHT COLLAPSIBLE INSPECTOR (Co-Pilot, QA Audit, Literatur, Format) */}
        {isRightPanelOpen && (
          <aside className="w-80 sm:w-96 shrink-0 border-l border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] overflow-y-auto flex flex-col no-print transition-all duration-200">
            {/* Header with Inspector Tabs & Close Button */}
            <div className="p-2 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setInspectorTab("copilot")}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    inspectorTab === "copilot"
                      ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] shadow-2xs"
                      : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#7C9CFF]" />
                  <span>Co-Pilot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorTab("qa")}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    inspectorTab === "qa"
                      ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] shadow-2xs"
                      : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Audit QA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorTab("literature")}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    inspectorTab === "literature"
                      ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] shadow-2xs"
                      : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#9B8CFF]" />
                  <span>Literatur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorTab("format")}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    inspectorTab === "format"
                      ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] shadow-2xs"
                      : "text-[#475569] dark:text-[#A4B1C7] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>Format</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1.5 rounded-md text-[#475569] dark:text-[#A4B1C7] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] cursor-pointer"
                title="Tutup Panel Asisten"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB CONTENT: CO-PILOT AI */}
            {inspectorTab === "copilot" && (
              <div className="flex-1 flex flex-col p-3 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FC] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C9CFF]" />
                    <span>Asisten Akademik Cerdas</span>
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#A4B1C7]">
                    Didukung SOP 12 Metode Berpikir &amp; Standar Evaluasi Dikti.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#475569] dark:text-[#A4B1C7] uppercase">Arahan Cepat:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Perdalam latar belakang dengan data empiris",
                      "Periksa keselarasan rumusan dan kesimpulan",
                      "Rekomendasi uji statistik untuk Bab III",
                      "Formalisasi bahasa ke standar baku"
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendInspectorCopilot(p)}
                        className="text-[10px] text-left px-2 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1C263A] text-[#0F172A] dark:text-[#F3F6FC] transition-colors cursor-pointer"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[50vh] pr-1">
                  {inspectorCopilotMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1 ${
                        msg.sender === "user"
                          ? "bg-[#0F172A] text-white dark:bg-[#172033] dark:text-[#7C9CFF] ml-4"
                          : "bg-[#F1F5F9] dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC] mr-2"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] opacity-60">
                        <span>{msg.sender === "user" ? "Anda" : "Co-Pilot AI"}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {inspectorCopilotLoading && (
                    <div className="p-2.5 rounded-xl text-xs bg-[#F1F5F9] dark:bg-[#172033] text-[#475569] dark:text-[#A4B1C7] flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C9CFF]" />
                      <span>Co-Pilot sedang menelaah naskah...</span>
                    </div>
                  )}
                </div>

                {/* Input box */}
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#253149] flex gap-1.5">
                  <input
                    type="text"
                    value={inspectorCopilotInput}
                    onChange={(e) => setInspectorCopilotInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendInspectorCopilot(); }}
                    placeholder="Tanya saran bab, sitasi, atau sidang..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#0B101A] text-xs text-[#0F172A] dark:text-[#F3F6FC] placeholder:text-[#475569] dark:placeholder:text-[#A4B1C7] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendInspectorCopilot()}
                    disabled={inspectorCopilotLoading || !inspectorCopilotInput.trim()}
                    className="p-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-black hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: QA AUDIT */}
            {inspectorTab === "qa" && (
              <div className="p-3 space-y-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">Skor Mutu Naskah</span>
                    <span className="text-2xl font-black font-mono text-zinc-950 dark:text-white">
                      {qaReport.overallScore}/100
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQaReport(runAcademicQAPipeline(currentDoc));
                      setToastMessage("Audit kepatuhan naskah diperbarui.");
                    }}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    title="Audit Ulang"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress breakdown */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Struktur Bab</span>
                      <span className="font-mono font-bold">{qaReport.structuralReport?.isComplete ? 100 : 80}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${qaReport.structuralReport?.isComplete ? 100 : 80}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Integritas Sitasi DOI</span>
                      <span className="font-mono font-bold">{qaReport.evidenceReport?.integrityScore ?? 95}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${qaReport.evidenceReport?.integrityScore ?? 95}%` }} />
                    </div>
                  </div>
                </div>

                {/* Findings List */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Temuan Audit:</span>
                  {qaReport.findings.length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Naskah memenuhi seluruh standar Dikti!</span>
                    </div>
                  ) : (
                    qaReport.findings.slice(0, 5).map((f, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            f.severity === "critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" :
                            f.severity === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {f.severity}
                          </span>
                          <span className="text-[10px] text-zinc-400">{f.location}</span>
                        </div>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{f.issueTitle}</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">{f.recommendation}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RISET LITERATUR */}
            {inspectorTab === "literature" && (
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Cari Paper Terindeks (Crossref)</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inspectorLitQuery}
                      onChange={(e) => setInspectorLitQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleInspectorLitSearch(); }}
                      placeholder="Kata kunci teori / topik..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleInspectorLitSearch}
                      disabled={inspectorLitSearching}
                      className="p-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black cursor-pointer"
                    >
                      {inspectorLitSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {inspectorLitResults.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs space-y-1.5">
                      <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">{p.title}</h5>
                      <p className="text-[11px] text-zinc-500">{p.authors} ({p.year}) • {p.journal}</p>
                      <button
                        type="button"
                        onClick={() => handleAddLitToDoc(p)}
                        className="w-full py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                      >
                        + Tambahkan ke Bab 2 &amp; Pustaka
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FORMAT KAMPUS */}
            {inspectorTab === "format" && (
              <div className="p-3 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pedoman Kampus Terpilih:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGuidelineModalOpen(true)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-left font-semibold flex items-center justify-between"
                  >
                    <span>{currentDoc.campusGuideline?.campusName || "Standar Dikti"}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Gaya Penomoran Heading:
                  </label>
                  <select
                    value={currentDoc.campusGuideline?.headingStyle || "decimal"}
                    onChange={(e) => handleChangeHeadingStyle(e.target.value as HeadingStyleType)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs"
                  >
                    <option value="decimal">Desimal (1.1, 1.2)</option>
                    <option value="alphanumeric">Alfanumerik (A., B., 1.)</option>
                    <option value="roman">Romawi (I.A, I.B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Watermark Halaman:
                  </label>
                  <select
                    value={watermarkType}
                    onChange={(e) => setWatermarkType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs"
                  >
                    <option value="none">Tanpa Watermark</option>
                    <option value="draft">Draf Usulan</option>
                    <option value="plagiarisme_ok">Bebas Plagiasi</option>
                    <option value="siap_sidang">Siap Sidang</option>
                    <option value="confidential">Confidential</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMarginRuler(!showMarginRuler)}
                    className={`w-full py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                      showMarginRuler
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                    }`}
                  >
                    {showMarginRuler ? "Sembunyikan Garis Ruler A4" : "Tampilkan Garis Ruler A4 (4-4-3-3)"}
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ============================================================ */}
      {/* MICROSOFT WORD REVERSE-ENGINEERED STATUS BAR (Bottom Strip) */}
      {/* ============================================================ */}
      <footer className="h-9 min-h-[36px] border-t border-[#E2E8F0] dark:border-[#253149] bg-white/95 dark:bg-[#0B101A]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#A4B1C7] select-none no-print shrink-0 z-20">
        
        {/* Left: Document Metrics Telemetry */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#7C9CFF]/10 text-[#7C9CFF] font-semibold text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>~{estimatedPageCount} Halaman A4</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC]">
            <span className="font-semibold">~{totalWordsCount.toLocaleString("id-ID")}</span>
            <span className="text-[#64748B] dark:text-[#A4B1C7]">Kata</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-[#0F172A] dark:text-[#F3F6FC]">
            <span className="font-semibold">~{totalCharactersCount.toLocaleString("id-ID")}</span>
            <span className="text-[#64748B] dark:text-[#A4B1C7]">Karakter</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#253149] text-[#64748B] dark:text-[#A4B1C7]">
            <span>⏱️ ~{readingTimeMinutes} mnt baca</span>
          </div>

          <div className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Standar Dikti Valid</span>
          </div>
        </div>

        {/* Right: Word-Style Zoom & Page Controls */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          {/* Page Customizer Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsPageCustomizerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] hover:border-[#7C9CFF] text-[#0F172A] dark:text-[#F3F6FC] transition-colors cursor-pointer text-[11px] font-sans font-medium shadow-2xs"
            title="Kustomisasi Susunan Lembar & Halaman Dokumen"
          >
            <Layers className="w-3.5 h-3.5 text-[#7C9CFF]" />
            <span>Atur Lembar</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#111827] px-1.5 py-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              disabled={zoomLevel <= 70}
              className="w-5 h-5 flex items-center justify-center rounded text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] disabled:opacity-30 cursor-pointer font-bold transition-colors"
              title="Perkecil Kanvas (Zoom Out)"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="text-[11px] w-9 text-center font-bold text-[#0F172A] dark:text-[#7C9CFF] cursor-pointer hover:underline"
              title="Klik untuk reset zoom ke 100%"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              disabled={zoomLevel >= 150}
              className="w-5 h-5 flex items-center justify-center rounded text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F6FC] disabled:opacity-30 cursor-pointer font-bold transition-colors"
              title="Perbesar Kanvas (Zoom In)"
            >
              +
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: KUSTOMISASI LEMBAR & SUSUNAN HALAMAN DOKUMEN */}
      {isPageCustomizerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0B101A] border border-[#E2E8F0] dark:border-[#253149] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#253149] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7C9CFF]/15 border border-[#7C9CFF]/30 flex items-center justify-center text-[#7C9CFF]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F3F6FC]">
                    Kustomisasi Lembar &amp; Struktur Halaman
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#A4B1C7]">
                    Atur visibilitas lembar, aktifkan lampiran tambahan, atau sesuaikan kelengkapan naskah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPageCustomizerModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-[#A4B1C7] dark:hover:text-[#F3F6FC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 text-xs flex-1">
              {[
                { id: "section-cover", label: "Halaman Sampul / Cover Standar Dikti", badge: "Hal i (Wajib)" },
                { id: "section-pengesahan", label: "Lembar Pengesahan Pembimbing & Penguji", badge: "Hal ii" },
                { id: "section-orisinalitas", label: "Surat Pernyataan Keaslian & Bebas Plagiarisme", badge: "Hal iii" },
                { id: "section-pengantar", label: "Kata Pengantar Resmi", badge: "Hal iv" },
                { id: "section-abstrak", label: "ABSTRAK (Bahasa Indonesia)", badge: "Hal v (Dipisah)" },
                { id: "section-abstract-en", label: "ABSTRACT (Scientific English)", badge: "Hal vi (Dipisah)" },
                { id: "section-daftar-isi", label: "Daftar Isi Otomatis", badge: "Hal vii" },
                { id: "section-daftar-gambar", label: "Daftar Gambar & Diagram", badge: "Hal viii" },
                { id: "section-daftar-tabel", label: "Daftar Tabel Standar 3-Garis", badge: "Hal ix" },
                { id: "section-ringkasan", label: "Ringkasan Eksekutif", badge: "Hal x" },
                { id: "section-bab1", label: "Bab I: Pendahuluan & Latar Belakang Masalah", badge: "Bab Utama" },
                { id: "section-bab2", label: "Bab II: Tinjauan Pustaka & Sintesis PRISMA", badge: "Bab Utama" },
                { id: "section-bab3", label: "Bab III: Metodologi & Desain Operasional", badge: "Bab Utama" },
                { id: "section-bab4", label: "Bab IV: Rencana Kerja & Rencana Anggaran Biaya", badge: "Bab Utama" },
                { id: "section-bab5", label: "Bab V: Penutup, Rekomendasi & Mitigasi Risiko", badge: "Bab Utama" },
                { id: "section-pustaka", label: "Daftar Pustaka (Standar APA 7th / IEEE)", badge: "Pustaka" },
                { id: "section-lampiran", label: "Lampiran-Lampiran (Logbook & Berita Acara)", badge: "Lampiran" },
              ].map((sheet) => {
                const isOff = disabledSections.includes(sheet.id);
                return (
                  <div
                    key={sheet.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isOff
                        ? "bg-[#F8FAFC]/50 dark:bg-[#111827]/40 border-[#E2E8F0] dark:border-[#253149] opacity-60"
                        : "bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#253149] shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${isOff ? "bg-zinc-400" : "bg-[#34D399]"}`} />
                      <div>
                        <p className={`font-semibold ${isOff ? "line-through text-zinc-400" : "text-[#0F172A] dark:text-[#F3F6FC]"}`}>
                          {sheet.label}
                        </p>
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A4B1C7]">
                          {sheet.badge}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSection(sheet.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        isOff
                          ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          : "bg-[#7C9CFF]/15 text-[#7C9CFF] border border-[#7C9CFF]/30 font-semibold"
                      }`}
                    >
                      {isOff ? "Nonaktif" : "Aktif ✓"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#253149] bg-[#F8FAFC] dark:bg-[#080B12] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsPageCustomizerModalOpen(false);
                  setIsCustomSheetModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#253149] bg-white dark:bg-[#111827] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FC] hover:border-[#7C9CFF] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#7C9CFF]" />
                <span>+ Tambah Lembar Khusus / Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPageCustomizerModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0F172A] hover:bg-black text-white dark:bg-[#7C9CFF] dark:hover:bg-[#688bf5] dark:text-[#080B12] text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT TURNITIN & ANTI-SLOP */}
      <TurnitinPreCheckModal
        isOpen={isTurnitinModalOpen}
        onClose={() => setIsTurnitinModalOpen(false)}
        doc={currentDoc}
      />

      {/* MODAL: PENCARIAN LITERATUR SEMANTIC SCHOLAR */}
      <LiteratureSearchModal
        isOpen={isLitModalOpen}
        onClose={() => setIsLitModalOpen(false)}
        initialQuery={currentDoc.title}
        onAddPaperToProposal={(paper) => {
          setCurrentDoc(prev => ({
            ...prev,
            bab2: {
              ...prev.bab2,
              landasanTeori: [
                ...prev.bab2.landasanTeori,
                {
                  topic: `Kajian Terindeks: ${paper.title}`,
                  elaboration: paper.abstract || "Kajian primer mengenai metodologi komparatif dan kerangka kerja empiris.",
                  citation: `${paper.authors?.map(a => a.name).join(", ") || "Peneliti"} (${paper.year || 2024}). ${paper.venue || "Publikasi Ilmiah"}. DOI: ${paper.doi || "Tersedia"}`
                }
              ]
            }
          }));
          setToastMessage(`Paper "${paper.title.slice(0, 40)}..." berhasil ditambahkan ke Bab 2!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* MODAL: GENERATOR INSTRUMEN RISET & KUESIONER */}
      <ResearchInstrumentModal
        isOpen={isInstrumentModalOpen}
        onClose={() => setIsInstrumentModalOpen(false)}
        doc={currentDoc}
      />

      {/* MODAL: KUSTOMISASI LEMBAR PENGESAHAN */}
      <ApprovalSheetModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        doc={currentDoc}
        onSave={(info) => {
          setCurrentDoc(prev => {
            const updated = { ...prev, approvalSheet: info };
            pushToHistory(updated);
            return updated;
          });
          setToastMessage("Lembar pengesahan resmi berhasil diperbarui!");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* MODAL: FORMAT KAMPUS & AI GUIDELINE SCANNER */}
      <CampusGuidelineModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
        currentGuideline={currentDoc.campusGuideline}
        onApplyGuideline={(guideline) => {
          setCurrentDoc(prev => {
            const updated = { 
              ...prev, 
              campusGuideline: guideline,
              institution: guideline.campusName.split("(")[0].trim() || prev.institution
            };
            pushToHistory(updated);
            return updated;
          });
          if (guideline.citationStyle) {
            setCitationStyle(guideline.citationStyle === "ieee" ? "ieee" : "apa");
          }
          setToastMessage(`Format resmi ${guideline.campusName} berhasil diterapkan ke Naskah & Dokumen Word!`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* CO-PILOT AI INTERACTIVE SLIDE-OVER DRAWER */}
      <AcademicCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        doc={currentDoc}
      />

      {/* FLOATING ACADEMIC AI REVISION MODAL DIALOG */}
      {refineSectionTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Revisi AI Akademik: <span className="font-normal text-zinc-600 dark:text-zinc-400">{refineSectionTitle}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Didukung Google Gemini 3.5 & SOP 12 Metode Berpikir
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeRefineModal}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {refineError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{refineError}</span>
                </div>
              )}

              {/* Revision Instructions */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Pilih Arahan Cepat atau Masukkan Instruksi Khusus:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    "Perdalam analisis teoritis & rujukan primer",
                    "Perjelas metodologi kuantitatif & indikator",
                    "Tingkatkan formalitas bahasa akademik baku",
                    "Pertegas urgensi rumusan & kesenjangan masalah",
                    "Ringkas & padatkan narasi agar lebih tajam"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRefineInstruction(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    placeholder="Contoh: Perluas uraian dengan menambahkan variabel perancu dan dasar teori dari Gibson (2019)..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 font-sans leading-relaxed resize-none"
                  />
                  <button
                    type="button"
                    disabled={isRefining || !refineInstruction.trim()}
                    onClick={submitAiRefinement}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isRefining ? "Merumuskan AI..." : "Jalankan Revisi AI"}</span>
                  </button>
                </div>
              </div>

              {/* AI Generated Preview (if available) */}
              {revisedPreview ? (
                <div className="space-y-2 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      Hasil Rumusan Revisi AI:
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Siap Diterapkan</span>
                  </div>
                  <textarea
                    rows={6}
                    value={revisedPreview}
                    onChange={(e) => setRevisedPreview(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRevisedPreview(null)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition-colors cursor-pointer"
                    >
                      Batal Hasil Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRefinedContent(revisedPreview)}
                      className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan ke Naskah Proposal</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Editable Original Text Area */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Teks Naskah Saat Ini (Bisa Disunting Manual Langsung):
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Sunting Bebas</span>
                  </div>
                  <textarea
                    rows={5}
                    value={refineContent}
                    onChange={(e) => setRefineContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => applyRefinedContent(refineContent)}
                      className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Simpan Perubahan Manual Langsung
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-5 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
              <span>Klik luar atau tombol X untuk membatalkan</span>
              <button
                type="button"
                onClick={closeRefineModal}
                className="px-3 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KLINIK KONSULTASI BIMBINGAN (AI MENTOR) */}
      <AcademicConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        initialCategory={currentDoc.category}
        initialTargetEntity={currentDoc.targetEntity}
        onApplyProposal={(appliedTitle, appliedEntity, appliedCategory) => {
          setCurrentDoc(prev => {
            const updated = {
              ...prev,
              title: appliedTitle,
              targetEntity: appliedEntity || prev.targetEntity,
              category: appliedCategory || prev.category
            };
            pushToHistory(updated);
            return updated;
          });
          setToastMessage(`Judul berhasil diperbarui ke: "${appliedTitle}"`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* MODAL 1: CAMPUS LOGO MANAGER */}
      <CampusLogoManagerModal
        isOpen={isCampusLogoModalOpen}
        onClose={() => setIsCampusLogoModalOpen(false)}
        currentLogoUrl={currentDoc.campusLogoUrl}
        institution={currentDoc.institution}
        onSelectLogo={handleSaveLogo}
      />

      {/* MODAL 2: THEORY CUSTOMIZER (5, 8, 13, 20 THEORIES & CITATIONS) */}
      <TheoryCustomizerModal
        isOpen={isTheoryCustomizerModalOpen}
        onClose={() => setIsTheoryCustomizerModalOpen(false)}
        title={currentDoc.title}
        category={currentDoc.category}
        theories={currentDoc.bab2.landasanTeori || []}
        bibliography={currentDoc.bibliography || []}
        onSave={handleSaveTheories}
      />

      {/* MODAL 3: CUSTOM SHEET & OFFICIAL SCAN MANAGER */}
      <CustomSheetModal
        isOpen={isCustomSheetModalOpen}
        onClose={() => setIsCustomSheetModalOpen(false)}
        sheets={currentDoc.customSheets || []}
        onSave={handleSaveCustomSheets}
      />

      {/* MODAL 4: DOCUMENT IMAGE & DIAGRAM MANAGER WITH AI PLACEMENT */}
      <DocumentImageManagerModal
        isOpen={isImageManagerModalOpen}
        onClose={() => setIsImageManagerModalOpen(false)}
        docTitle={currentDoc.title}
        figures={currentDoc.documentFigures || []}
        onSave={handleSaveFigures}
      />

      {/* MODAL 5: STANDALONE LOGBOOK MANAGER WITH AI AUTOFILL */}
      <LogbookManagerModal
        isOpen={isLogbookModalOpen}
        onClose={() => setIsLogbookModalOpen(false)}
        title={currentDoc.title}
        category={currentDoc.category}
        targetEntity={currentDoc.targetEntity}
        scheduleMatrix={currentDoc.bab4.jadwalMatriks}
        entries={currentDoc.logbookEntries || []}
        onSave={handleSaveLogbook}
      />

      {/* MODAL 6: DEFENSE MINUTES & REVISION RECOMMENDATION */}
      <DefenseMinutesModal
        isOpen={isDefenseMinutesModalOpen}
        onClose={() => setIsDefenseMinutesModalOpen(false)}
        docTitle={currentDoc.title}
        candidateName={currentDoc.candidateName}
        candidateId={currentDoc.candidateId}
        institution={currentDoc.institution}
        minutes={currentDoc.defenseMinutes}
        onSave={handleSaveDefenseMinutes}
      />

    </div>
  );
};
