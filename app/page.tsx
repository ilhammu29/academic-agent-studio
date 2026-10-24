"use client";

import React, { useState, useEffect } from "react";
import { ProposalCategory, ReportType, StudioStage, DiagnosticQuestion, ProposalDocument, TreeNode, CampusGuideline } from "@/types/studio";
import AppShell from "@/components/AppShell";
import { HeroInputView } from "@/components/HeroInputView";
import { DiagnosticInterview } from "@/components/DiagnosticInterview";
import { AgentExecutionMonitor } from "@/components/AgentExecutionMonitor";
import { DocumentStudio } from "@/components/DocumentStudio";
import { TwelveModesModal } from "@/components/TwelveModesModal";
import { CampusGuidelineModal } from "@/components/CampusGuidelineModal";
import { AcademicConsultationModal } from "@/components/AcademicConsultationModal";
import { ConsultationStudio } from "@/components/ConsultationStudio";
import { PresentationStudio } from "@/components/PresentationStudio";
import { CAMPUS_PRESETS } from "@/lib/campusPresets";
import ScreenLoader from "@/components/ScreenLoader";
import AuthModal from "@/components/AuthModal";
import DatabaseDrawer from "@/components/DatabaseDrawer";
import DriveFileManager from "@/components/DriveFileManager";
import { Presentation, ArrowRight } from "lucide-react";
import { generateDiagnosticQuestions } from "@/lib/questions";
import { getAdaptiveDiagnosticQuestions } from "@/lib/diagnosticInterviewEngine.ts";
import { buildGeneratedDocument, buildVisualTreeGraph } from "@/lib/agentEngine";
import { 
  UserProfile, 
  getStoredUser, 
  saveStoredUser, 
  getSupabaseClient, 
  saveProjectRecord, 
  SavedProjectRecord 
} from "@/lib/supabase";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredUser());
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // App & Workflow Stage
  const [stage, setStage] = useState<StudioStage>("input");
  const [category, setCategory] = useState<ProposalCategory>("skripsi");
  const [reportType, setReportType] = useState<ReportType | undefined>("skripsi");

  // Input Stage State
  const [title, setTitle] = useState("");
  const [targetEntity, setTargetEntity] = useState("");
  const [institution, setInstitution] = useState(currentUser.institution || "Universitas Sebelas Maret (UNS)");
  const [facultyMajor, setFacultyMajor] = useState("Informatika & Sains Data");
  const [candidateName, setCandidateName] = useState(currentUser.name || "Ilham Maulana");
  const [candidateId, setCandidateId] = useState("NIM-2026-AKAD");
  const [durationMonths, setDurationMonths] = useState<number>(6);

  // Interview Stage State
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Generated Result State
  const [generatedDoc, setGeneratedDoc] = useState<ProposalDocument | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  // Modals & Drawers
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDatabaseDrawerOpen, setIsDatabaseDrawerOpen] = useState(false);

  // Campus Guideline & Formatting State
  const [campusGuideline, setCampusGuideline] = useState<CampusGuideline>(CAMPUS_PRESETS[0]);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Check Supabase status on mount
  useEffect(() => {
    const client = getSupabaseClient();
    setIsSupabaseConfigured(!!client);
    if (currentUser?.name) {
      setCandidateName(currentUser.name);
    }
    if (currentUser?.institution) {
      setInstitution(currentUser.institution);
    }
  }, [currentUser]);

  // Start Diagnostic Interview
  const handleStartInterview = async () => {
    if (!title.trim()) {
      alert("Harap tentukan judul proposal terlebih dahulu.");
      return;
    }
    const adaptiveList = getAdaptiveDiagnosticQuestions(title, category, targetEntity, reportType);
    setQuestions(adaptiveList);
    setStage("interview");

    // Fetch dynamic questions from Gemini in background to upgrade suggestions
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          targetEntity,
          reportType
        })
      });
      const data = await res.json();
      if (data.success && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.warn("Interview questions fetch error, using domain questions:", err);
    }
  };

  // Launch Multi-Agent Orchestrator (Only after interview questions answered!)
  const handleLaunchAgents = () => {
    if (Object.keys(answers).length === 0) {
      alert("Sesi wawancara diagnostik harus diisi sebelum agen AI dapat menganalisis.");
      setStage("interview");
      return;
    }

    setStage("orchestration");

    // Build initial formal proposal document & tree graph purely based on user's real input
    const doc = buildGeneratedDocument(
      title,
      category,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity
    );
    doc.campusGuideline = campusGuideline;
    const tree = buildVisualTreeGraph(doc);
    setGeneratedDoc(doc);
    setTreeData(tree);
  };

  const handleAgentsFinished = (doc?: ProposalDocument) => {
    if (doc) {
      if (!doc.campusGuideline) {
        doc.campusGuideline = campusGuideline;
      }
      setGeneratedDoc(doc);
      setTreeData(buildVisualTreeGraph(doc));
    }
    setStage("result");
  };

  const handleResetSession = () => {
    setStage("input");
    setAnswers({});
    setGeneratedDoc(null);
    setTreeData(null);
  };

  const handleNavigateStage = (targetStage: StudioStage) => {
    if (targetStage === "drive") {
      setStage("drive");
      return;
    }

    if (targetStage === "slides") {
      setStage("slides");
      return;
    }

    if (targetStage === "consultation") {
      setStage("consultation");
      return;
    }

    if (targetStage === "input") {
      setStage("input");
      return;
    }

    if (targetStage === "interview") {
      if (!title.trim()) {
        alert("Pilih atau ketikkan judul usulan terlebih dahulu.");
        setStage("input");
        return;
      }
      if (!questions.length) {
        const qList = generateDiagnosticQuestions(title, category, targetEntity);
        setQuestions(qList);
      }
      setStage("interview");
      return;
    }

    if (targetStage === "orchestration") {
      // Must have answered interview!
      if (!title.trim() || Object.keys(answers).length === 0) {
        alert("Agen AI bekerja hanya setelah Tab Topik dan Tab Wawancara selesai dituntaskan.");
        if (!title.trim()) setStage("input");
        else setStage("interview");
        return;
      }
      if (!generatedDoc) {
        handleLaunchAgents();
      } else {
        setStage("orchestration");
      }
      return;
    }

    if (targetStage === "result") {
      if (!generatedDoc) {
        if (!title.trim() || Object.keys(answers).length === 0) {
          alert("Silakan lengkapi Topik dan Wawancara agar dokumen dapat disusun oleh Agen AI.");
          setStage("input");
          return;
        }
        handleLaunchAgents();
        return;
      }
      setStage("result");
    }
  };

  // Save current proposal into database (Supabase / Local)
  const handleSaveCurrentProject = async () => {
    const docToSave = generatedDoc || buildGeneratedDocument(
      title,
      category,
      answers,
      candidateName,
      candidateId,
      institution,
      facultyMajor,
      targetEntity
    );
    if (!docToSave.campusGuideline && campusGuideline) {
      docToSave.campusGuideline = campusGuideline;
    }
    const treeToSave = treeData || buildVisualTreeGraph(docToSave);

    const record: SavedProjectRecord = {
      id: `proj-${Date.now()}`,
      userId: currentUser.id,
      title,
      category,
      targetEntity,
      durationMonths,
      stage,
      answers,
      documentData: docToSave,
      treeGraph: treeToSave,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await saveProjectRecord(record);
  };

  // Load a saved project from Drive or Database drawer
  const handleLoadProject = (project: SavedProjectRecord) => {
    setTitle(project.title);
    setCategory(project.category);
    setTargetEntity(project.targetEntity || "");
    setDurationMonths(project.durationMonths || 6);
    setAnswers(project.answers || {});

    if (project.documentData) {
      setGeneratedDoc(project.documentData);
      setCandidateName(project.documentData.candidateName);
      setCandidateId(project.documentData.candidateId);
      setInstitution(project.documentData.institution);
      setFacultyMajor(project.documentData.facultyMajor);
      if (project.documentData.campusGuideline) {
        setCampusGuideline(project.documentData.campusGuideline);
      }
    } else {
      const doc = buildGeneratedDocument(
        project.title,
        project.category,
        project.answers || {},
        candidateName,
        candidateId,
        institution,
        facultyMajor,
        project.targetEntity || ""
      );
      doc.campusGuideline = campusGuideline;
      setGeneratedDoc(doc);
    }

    if (project.treeGraph && !Array.isArray(project.treeGraph)) {
      setTreeData(project.treeGraph);
    } else if (project.documentData) {
      setTreeData(buildVisualTreeGraph(project.documentData));
    }

    setStage(project.stage === "drive" ? "result" : project.stage || "result");
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);
    setCandidateName(updatedUser.name);
    setInstitution(updatedUser.institution);
  };

  return (
    <>
      {/* 1. Cinematic Screen Loader Animation on Initial Mount */}
      {showSplash && (
        <ScreenLoader onComplete={() => setShowSplash(false)} />
      )}

      {/* 2. Full-Bleed Desktop & Mobile Responsive App Shell (Matching ui-referensi.png) */}
      <AppShell
        currentStage={stage}
        onNavigateStage={handleNavigateStage}
        onOpenTwelveModes={() => setIsThinkingModalOpen(true)}
        onOpenDatabase={() => setIsDatabaseDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenConsultation={() => setStage("consultation")}
        onOpenGuidelines={() => setIsGuidelineModalOpen(true)}
        onResetSession={handleResetSession}
        activeCategory={category}
        activeTitle={title}
        currentUser={currentUser}
        isSupabaseConfigured={isSupabaseConfigured}
      >
        {/* Stage 1: Hero & Command Capsule Input */}
        {stage === "input" && (
          <HeroInputView
            category={category}
            setCategory={setCategory}
            reportType={reportType}
            setReportType={setReportType}
            title={title}
            setTitle={setTitle}
            targetEntity={targetEntity}
            setTargetEntity={setTargetEntity}
            durationMonths={durationMonths}
            setDurationMonths={setDurationMonths}
            candidateName={candidateName}
            setCandidateName={setCandidateName}
            candidateId={candidateId}
            setCandidateId={setCandidateId}
            onSubmit={handleStartInterview}
            onOpenDatabase={() => setIsDatabaseDrawerOpen(true)}
            onOpenDrive={() => setStage("drive")}
            onOpenGuidelineModal={() => setIsGuidelineModalOpen(true)}
            onOpenConsultation={() => setStage("consultation")}
            activeCampusName={campusGuideline?.campusName}
            activeDoc={generatedDoc}
            onNavigateStage={(target) => setStage(target)}
            onLoadProject={handleLoadProject}
          />
        )}

        {/* Stage: Dedicated Full-Page AI Consultation Chatbot & Workbench */}
        {stage === "consultation" && (
          <ConsultationStudio
            category={category}
            setCategory={setCategory}
            targetEntity={targetEntity}
            setTargetEntity={setTargetEntity}
            currentTitle={title}
            setTitle={setTitle}
            durationMonths={durationMonths}
            setDurationMonths={setDurationMonths}
            onBackToHero={() => setStage("input")}
            onProceedWithTitle={(newTitle, newEntity, newCat, newDur) => {
              setTitle(newTitle);
              if (newEntity) setTargetEntity(newEntity);
              if (newCat) setCategory(newCat);
              if (newDur) setDurationMonths(newDur);
              setStage("input");
            }}
          />
        )}

        {/* Stage 2: Diagnostic Interview */}
        {stage === "interview" && (
          <DiagnosticInterview
            category={category}
            title={title}
            targetEntity={targetEntity}
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setStage("input")}
            onSubmit={handleLaunchAgents}
          />
        )}

        {/* Stage 3: Multi-Agent Orchestration Hub */}
        {stage === "orchestration" && (
          <AgentExecutionMonitor
            title={title}
            category={category}
            answers={answers}
            targetEntity={targetEntity}
            candidateName={candidateName}
            candidateId={candidateId}
            institution={institution}
            facultyMajor={facultyMajor}
            campusGuideline={campusGuideline}
            onComplete={handleAgentsFinished}
          />
        )}

        {/* Stage 4: Document Studio & Visual Tree Graph */}
        {stage === "result" && generatedDoc && (
          <DocumentStudio
            doc={generatedDoc}
            treeData={treeData || buildVisualTreeGraph(generatedDoc)}
            onReset={handleResetSession}
            onOpenPresentationStudio={() => setStage("slides")}
          />
        )}

        {/* Stage 5: Dedicated Standalone Slide Presentation Studio (PPTX 16:9) */}
        {stage === "slides" && (
          generatedDoc ? (
            <PresentationStudio
              doc={generatedDoc}
              onBackToDocument={() => setStage("result")}
              onUpdateDoc={(updatedDoc) => setGeneratedDoc(updatedDoc)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                <Presentation className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Belum Ada Proposal Aktif
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-2">
                Slide presentasi disusun otomatis berdasarkan naskah proposal akademik Anda. Silakan susun naskah terlebih dahulu melalui menu Topik atau buka dari Arsip Proyek.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStage("input")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Susun Topik Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDatabaseDrawerOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
                >
                  Buka Dari Arsip
                </button>
              </div>
            </div>
          )
        )}

        {/* Stage 6: Google Drive Style File Storage Manager */}
        {stage === "drive" && (
          <DriveFileManager
            onLoadProject={handleLoadProject}
            onNewProposal={() => {
              handleResetSession();
              setStage("input");
            }}
          />
        )}
      </AppShell>

      {/* 3. 12 Thinking Modes Slide-over Drawer */}
      <TwelveModesModal
        isOpen={isThinkingModalOpen}
        onClose={() => setIsThinkingModalOpen(false)}
      />

      {/* 4. Auth & Supabase Database Configuration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />

      {/* 5. Database & Proposals History Drawer */}
      <DatabaseDrawer
        isOpen={isDatabaseDrawerOpen}
        onClose={() => setIsDatabaseDrawerOpen(false)}
        onLoadProject={handleLoadProject}
        onSaveCurrentProject={handleSaveCurrentProject}
      />

      {/* 6. Campus Formatting & Guidelines Scanner Modal */}
      <CampusGuidelineModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
        currentGuideline={campusGuideline}
        onApplyGuideline={(guideline) => {
          setCampusGuideline(guideline);
          if (generatedDoc) {
            setGeneratedDoc({
              ...generatedDoc,
              campusGuideline: guideline
            });
          }
        }}
      />

      {/* 7. Academic Consultation & Problem Discovery Modal */}
      <AcademicConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        initialCategory={category}
        initialTargetEntity={targetEntity}
        onApplyProposal={(appliedTitle, appliedEntity, appliedCategory) => {
          setTitle(appliedTitle);
          if (appliedEntity) setTargetEntity(appliedEntity);
          if (appliedCategory) setCategory(appliedCategory);
        }}
      />
    </>
  );
}
