"use client";

import React, { useState, useEffect } from "react";
import { ProposalCategory, StudioStage, DiagnosticQuestion, ProposalDocument, TreeNode } from "@/types/studio";
import AppShell from "@/components/AppShell";
import { HeroInputView } from "@/components/HeroInputView";
import { DiagnosticInterview } from "@/components/DiagnosticInterview";
import { AgentExecutionMonitor } from "@/components/AgentExecutionMonitor";
import { DocumentStudio } from "@/components/DocumentStudio";
import { TwelveModesModal } from "@/components/TwelveModesModal";
import ScreenLoader from "@/components/ScreenLoader";
import AuthModal from "@/components/AuthModal";
import DatabaseDrawer from "@/components/DatabaseDrawer";
import DriveFileManager from "@/components/DriveFileManager";
import { generateDiagnosticQuestions } from "@/lib/questions";
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
  const [category, setCategory] = useState<ProposalCategory>("magang");

  // Input Stage State (Cleaned of any arbitrary dummy strings)
  const [title, setTitle] = useState("Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal");
  const [targetEntity, setTargetEntity] = useState("PT Telkom Indonesia (Persero) Tbk");
  const [institution, setInstitution] = useState(currentUser.institution || "Universitas Sebelas Maret (UNS)");
  const [facultyMajor, setFacultyMajor] = useState("Informatika & Sains Data");
  const [candidateName, setCandidateName] = useState(currentUser.name || "Muhammad Ilham");
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
  const handleStartInterview = () => {
    if (!title.trim()) {
      alert("Harap tentukan judul proposal terlebih dahulu.");
      return;
    }
    const qList = generateDiagnosticQuestions(title, category, targetEntity);
    setQuestions(qList);
    setStage("interview");
  };

  // Launch Multi-Agent Orchestrator (Only after interview questions answered!)
  const handleLaunchAgents = () => {
    if (Object.keys(answers).length === 0) {
      alert("Sesi wawancara diagnostik harus diisi sebelum agen AI dapat menganalisis.");
      setStage("interview");
      return;
    }

    setStage("orchestration");

    // Build formal proposal document & tree graph purely based on user's real input
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
    const tree = buildVisualTreeGraph(doc);
    setGeneratedDoc(doc);
    setTreeData(tree);
  };

  const handleAgentsFinished = () => {
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

      {/* 2. Full-Bleed Desktop & Mobile Responsive App Shell (Monochrome) */}
      <AppShell
        currentStage={stage}
        onNavigateStage={handleNavigateStage}
        onOpenTwelveModes={() => setIsThinkingModalOpen(true)}
        onOpenDatabase={() => setIsDatabaseDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
          />
        )}

        {/* Stage 2: Diagnostic Interview */}
        {stage === "interview" && (
          <DiagnosticInterview
            category={category}
            title={title}
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
            onComplete={handleAgentsFinished}
          />
        )}

        {/* Stage 4: Document Studio & Visual Tree Graph */}
        {stage === "result" && generatedDoc && (
          <DocumentStudio
            doc={generatedDoc}
            treeData={treeData || buildVisualTreeGraph(generatedDoc)}
            onReset={handleResetSession}
          />
        )}

        {/* Stage 5: Google Drive Style File Storage Manager */}
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
    </>
  );
}
