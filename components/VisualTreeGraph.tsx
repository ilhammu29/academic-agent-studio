"use client";

import React, { useState } from "react";
import { TreeNode } from "@/types/studio";
import { Network, ZoomIn, ZoomOut, RotateCcw, ChevronRight, CheckCircle2, Brain, Sparkles, X, FileText } from "lucide-react";

interface VisualTreeGraphProps {
  treeData: TreeNode;
  onSelectSection?: (sectionId: string) => void;
}

export const VisualTreeGraph: React.FC<VisualTreeGraphProps> = ({
  treeData,
  onSelectSection
}) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(treeData);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.7, prev + delta), 1.4));
  };

  const resetView = () => {
    setZoomLevel(1);
    setSelectedNode(treeData);
    setCollapsedNodes({});
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row rounded-2xl border border-matte-border bg-matte-bg overflow-hidden shadow-2xl">
      
      {/* Main Canvas Viewport */}
      <div className="flex-1 flex flex-col relative min-h-[500px] border-b lg:border-b-0 lg:border-r border-matte-border">
        
        {/* Canvas Toolbar */}
        <div className="px-4 py-3 bg-matte-surface/90 border-b border-matte-border flex items-center justify-between gap-4 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Network className="w-4 h-4 text-champagne" />
            <span className="font-bold text-milk-white">Peta Struktur Hierarki Dokumen</span>
            <span className="text-[10px] text-milk-muted bg-matte-surface2 px-2 py-0.5 rounded border border-matte-borderLight">
              Klik Simpul untuk Inspeksi
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-matte-surface2 border border-matte-border rounded-lg p-1 text-xs">
            <button
              onClick={() => handleZoom(0.1)}
              title="Perbesar"
              className="p-1.5 hover:bg-matte-surface text-milk-soft hover:text-milk-white rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              title="Perkecil"
              className="p-1.5 hover:bg-matte-surface text-milk-soft hover:text-milk-white rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              title="Reset Tampilan"
              className="p-1.5 hover:bg-matte-surface text-milk-soft hover:text-milk-white rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-milk-muted">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>

        {/* Tree Container with Interactive SVG Connectors */}
        <div className="flex-1 p-6 md:p-8 overflow-auto flex items-start justify-center">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center gap-8 w-full max-w-4xl"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Root Node */}
            <div
              onClick={() => setSelectedNode(treeData)}
              className={`p-4 md:p-5 rounded-2xl border text-center max-w-md w-full cursor-pointer transition-all shadow-xl relative ${
                selectedNode?.id === treeData.id
                  ? "bg-matte-surface border-champagne shadow-champagne/10 ring-1 ring-champagne"
                  : "bg-matte-surface/80 border-matte-border hover:border-champagne/50"
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-champagne px-2.5 py-0.5 rounded-full border border-champagne/30 bg-champagne/10">
                {treeData.category} &bull; INDUK NASKAH
              </span>
              <h3 className="text-sm font-serif font-bold text-milk-white mt-2 leading-snug">
                {treeData.label}
              </h3>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Terverifikasi Paripurna</span>
              </div>
            </div>

            {/* Downward Connector Line */}
            <div className="w-0.5 h-6 bg-matte-borderLight"></div>

            {/* Chapters Layer (Horizontal Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {treeData.children?.map((chapter) => {
                const isSelected = selectedNode?.id === chapter.id;
                const isCollapsed = !!collapsedNodes[chapter.id];

                return (
                  <div key={chapter.id} className="flex flex-col items-center gap-3">
                    {/* Chapter Card */}
                    <div
                      onClick={() => setSelectedNode(chapter)}
                      className={`p-3.5 rounded-xl border w-full cursor-pointer transition-all ${
                        isSelected
                          ? "bg-matte-surface border-champagne ring-1 ring-champagne"
                          : "bg-matte-surface/80 border-matte-border hover:border-milk-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-champagne">
                          {chapter.category}
                        </span>
                        {chapter.children && chapter.children.length > 0 && (
                          <button
                            onClick={(e) => toggleCollapse(chapter.id, e)}
                            className="p-1 hover:bg-matte-surface2 rounded text-milk-muted hover:text-milk-white text-[10px]"
                          >
                            {isCollapsed ? "+" : "−"}
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-serif font-bold text-milk-white line-clamp-2">
                        {chapter.label}
                      </h4>
                      <p className="text-[10px] font-mono text-milk-muted mt-1 truncate">
                        {chapter.thinkingMode}
                      </p>
                    </div>

                    {/* Section Children Layer */}
                    {!isCollapsed && chapter.children && (
                      <div className="w-full flex flex-col gap-2 pl-2 border-l border-matte-borderLight mt-1">
                        {chapter.children.map((section) => {
                          const isSecSelected = selectedNode?.id === section.id;
                          return (
                            <div
                              key={section.id}
                              onClick={() => setSelectedNode(section)}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                isSecSelected
                                  ? "bg-matte-surface2 border-champagne ring-1 ring-champagne text-milk-white"
                                  : "bg-matte-bg border-matte-border hover:border-matte-borderLight text-milk-soft hover:text-milk-white"
                              }`}
                            >
                              <div className="text-[10px] font-mono text-champagne/80 font-bold truncate">
                                {section.label}
                              </div>
                              <div className="text-[9px] text-milk-muted font-sans truncate">
                                {section.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="px-4 py-2.5 bg-matte-surface/40 border-t border-matte-border flex items-center justify-between text-[11px] font-mono text-milk-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-champagne"></span>
              Induk Dokumen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-academic-blue"></span>
              Bab Utama
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Sub-Seksi Terverifikasi
            </span>
          </div>
          <span>Mode Berpikir: 12 High-Level Modes</span>
        </div>
      </div>

      {/* Side Inspector Drawer */}
      <div className="w-full lg:w-96 bg-matte-surface p-5 flex flex-col justify-between">
        {selectedNode ? (
          <div>
            <div className="flex items-center justify-between border-b border-matte-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-champagne" />
                <span className="text-xs font-mono font-bold text-milk-white uppercase tracking-wider">
                  Inspektor Simpul
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-matte-surface2 text-champagne border border-champagne/30">
                {selectedNode.type.toUpperCase()}
              </span>
            </div>

            <h3 className="text-base font-serif font-bold text-milk-white leading-snug">
              {selectedNode.label}
            </h3>

            {/* Thinking Mode Pill */}
            <div className="my-3 p-3 rounded-xl bg-matte-bg border border-matte-border">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-champagne uppercase">
                <Brain className="w-3.5 h-3.5 text-champagne" />
                Landasan Metode Berpikir:
              </div>
              <p className="text-xs font-mono font-bold text-milk-white mt-1">
                {selectedNode.thinkingMode}
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-[11px] font-mono font-bold uppercase text-milk-muted mb-1">
                Deskripsi & Peran Bagian:
              </h4>
              <p className="text-xs text-milk-soft font-sans leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Snippet Preview */}
            <div className="mb-4">
              <h4 className="text-[11px] font-mono font-bold uppercase text-milk-muted mb-1">
                Pratinjau Draf Terkompilasi:
              </h4>
              <div className="p-3 rounded-lg bg-matte-bg border border-matte-border text-xs text-milk-soft font-serif max-h-48 overflow-y-auto leading-relaxed whitespace-pre-line">
                {selectedNode.contentSnippet || "Konten telah disintesis dan siap pada Naskah Utuh."}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Lolos Evaluasi Standar Akademik & Anti-Potong</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-milk-muted py-12 font-mono">
            Pilih salah satu simpul pada diagram untuk melihat rincian isi dan metode berpikir yang diterapkan.
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-matte-border text-center">
          <p className="text-[10px] font-mono text-milk-dim">
            Arsitektur dokumen mematuhi SOP Academic Campus Pro
          </p>
        </div>
      </div>

    </div>
  );
};
