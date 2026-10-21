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

  // Input Stage State
  const [title, setTitle] = useState("Implementasi Pipeline MLOps & RAG untuk Knowledge Retrieval Internal");
  const [targetEntity, setTargetEntity] = useState("PT Telkom Indonesia (Persero) Tbk");
  const [institution, setInstitution] = useState("Universitas Sebelas Maret (UNS)");
  const [facultyMajor, setFacultyMajor] = useState("Informatika & Sains Komputasi");
  const [candidateName, setCandidateName] = useState(currentUser.name);
  const [candidateId, setCandidateId] = useState("M0522041");
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
    setCandidateName(currentUser.name);
    setInstitution(currentUser.institution);
  }, [currentUser]);

  // Start Diagnostic Interview
  const handleStartInterview = () => {
    const qList = generateDiagnosticQuestions(title, category, targetEntity);
    setQuestions(qList);
    setStage("interview");
  };

  // Launch Multi-Agent Orchestrator
  const handleLaunchAgents = () => {
    setStage("orchestration");

    // Build formal proposal document & tree graph
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
    if (targetStage === "input") {
      setStage("input");
    } else if (targetStage === "interview") {
      if (!questions.length) {
        const qList = generateDiagnosticQuestions(title, category, targetEntity);
        setQuestions(qList);
      }
      setStage("interview");
    } else if (targetStage === "orchestration") {
      if (!generatedDoc) {
        handleLaunchAgents();
      } else {
        setStage("orchestration");
      }
    } else if (targetStage === "result") {
      if (!generatedDoc) {
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

  // Load a saved project from database drawer
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

    setStage(project.stage || "result");
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

      {/* 2. Full-Bleed Desktop & Mobile Responsive App Shell */}
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
