"use client";

import React, { useState } from "react";
import { ProposalCategory, StudioStage, DiagnosticQuestion, ProposalDocument, TreeNode } from "@/types/studio";
import { AppShell } from "@/components/AppShell";
import { HeroInputView } from "@/components/HeroInputView";
import { DiagnosticInterview } from "@/components/DiagnosticInterview";
import { AgentExecutionMonitor } from "@/components/AgentExecutionMonitor";
import { DocumentStudio } from "@/components/DocumentStudio";
import { TwelveModesModal } from "@/components/TwelveModesModal";
import { generateDiagnosticQuestions } from "@/lib/questions";
import { buildGeneratedDocument, buildVisualTreeGraph } from "@/lib/agentEngine";

export default function Home() {
  const [category, setCategory] = useState<ProposalCategory>("magang");
  const [stage, setStage] = useState<StudioStage>("input");

  // Input Stage State
  const [title, setTitle] = useState("Penerapan Pipeline Otomatisasi Data & Visualisasi Analitik pada Divisi Big Data Enterprise");
  const [targetEntity, setTargetEntity] = useState("PT Telkom Indonesia (Persero) Tbk");
  const [institution, setInstitution] = useState("Universitas Gadjah Mada (UGM)");
  const [facultyMajor, setFacultyMajor] = useState("Teknologi Informasi & Sains Data");
  const [candidateName, setCandidateName] = useState("Heswipa Alamanda Budi Saputri");
  const [candidateId, setCandidateId] = useState("22/502810/KU/24144");
  const [durationMonths, setDurationMonths] = useState<number>(4);

  // Interview Stage State
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Generated Result State
  const [generatedDoc, setGeneratedDoc] = useState<ProposalDocument | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  // Modals
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);

  // Start Diagnostic Interview
  const handleStartInterview = () => {
    const qList = generateDiagnosticQuestions(title, category, targetEntity);
    setQuestions(qList);
    setStage("interview");
  };

  // Launch Multi-Agent Orchestrator
  const handleLaunchAgents = () => {
    setStage("orchestration");

    // Pre-build document in background
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

  const handleReset = () => {
    setStage("input");
    setAnswers({});
    setGeneratedDoc(null);
    setTreeData(null);
  };

  const canNavigateTo = (targetStage: StudioStage) => {
    if (targetStage === "input") return true;
    if (targetStage === "interview") return !!title.trim();
    if (targetStage === "orchestration") return Object.keys(answers).length > 0;
    if (targetStage === "result") return !!generatedDoc;
    return false;
  };

  return (
    <>
      <AppShell
        currentStage={stage}
        setStage={setStage}
        canNavigateTo={canNavigateTo}
        onOpenThinkingModes={() => setIsThinkingModalOpen(true)}
        onReset={handleReset}
        candidateName={candidateName}
        category={category}
      >
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
          />
        )}

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

        {stage === "orchestration" && (
          <AgentExecutionMonitor
            title={title}
            onComplete={handleAgentsFinished}
          />
        )}

        {stage === "result" && generatedDoc && treeData && (
          <DocumentStudio
            doc={generatedDoc}
            treeData={treeData}
            onReset={handleReset}
          />
        )}
      </AppShell>

      {/* 12 Thinking Modes Modal Drawer */}
      <TwelveModesModal
        isOpen={isThinkingModalOpen}
        onClose={() => setIsThinkingModalOpen(false)}
      />
    </>
  );
}
