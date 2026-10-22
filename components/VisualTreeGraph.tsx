"use client";

import React, { useState } from "react";
import { TreeNode } from "@/types/studio";
import { Network, ZoomIn, ZoomOut, RotateCcw, Check, Brain, FileText } from "lucide-react";

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
    <div className="w-full flex flex-col lg:flex-row rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-xl">
      
      {/* Main Canvas Viewport */}
      <div className="flex-1 flex flex-col relative min-h-[480px] border-b lg:border-b-0 lg:border-r border-zinc-900">
        
        {/* Canvas Toolbar */}
        <div className="px-4 py-2.5 bg-black border-b border-zinc-900 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Network className="w-4 h-4 text-zinc-400" />
            <span>Struktur Hierarki Naskah</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              title="Perbesar"
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              title="Perkecil"
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              title="Reset Tampilan"
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[10px] font-mono text-zinc-500">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center gap-6 w-full max-w-3xl"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Root Node */}
            <div
              onClick={() => setSelectedNode(treeData)}
              className={`p-4 rounded-xl border text-center max-w-md w-full cursor-pointer transition-all ${
                selectedNode?.id === treeData.id
                  ? "bg-zinc-900 border-zinc-400 text-white"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {treeData.category} &bull; Induk Naskah
              </span>
              <h3 className="text-xs sm:text-sm font-semibold mt-1 leading-snug">
                {treeData.label}
              </h3>
            </div>

            {/* Downward Line */}
            <div className="w-px h-6 bg-zinc-800"></div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {treeData.children?.map((chapter) => {
                const isSelected = selectedNode?.id === chapter.id;
                const isCollapsed = !!collapsedNodes[chapter.id];

                return (
                  <div key={chapter.id} className="flex flex-col items-center gap-2">
                    {/* Chapter Card */}
                    <div
                      onClick={() => setSelectedNode(chapter)}
                      className={`p-3 rounded-lg border w-full cursor-pointer transition-all ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-400 text-white"
                          : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-400">
                          {chapter.category}
                        </span>
                        {chapter.children && chapter.children.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleCollapse(chapter.id, e)}
                            className="p-0.5 hover:bg-zinc-800 rounded text-zinc-400 text-[10px]"
                          >
                            {isCollapsed ? "+" : "−"}
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-medium line-clamp-2">
                        {chapter.label}
                      </h4>
                    </div>

                    {/* Section Children */}
                    {!isCollapsed && chapter.children && (
                      <div className="w-full flex flex-col gap-1.5 pl-2 border-l border-zinc-800">
                        {chapter.children.map((section) => {
                          const isSecSelected = selectedNode?.id === section.id;
                          return (
                            <div
                              key={section.id}
                              onClick={() => setSelectedNode(section)}
                              className={`p-2 rounded border text-left cursor-pointer transition-all text-xs ${
                                isSecSelected
                                  ? "bg-zinc-800 border-zinc-500 text-white"
                                  : "bg-zinc-900/20 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <div className="font-mono text-[11px] truncate">
                                {section.label}
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
      </div>

      {/* Side Inspector Drawer */}
      <div className="w-full lg:w-80 bg-zinc-950 p-4 sm:p-5 flex flex-col justify-between">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Inspektor Simpul
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {selectedNode.type}
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
              {selectedNode.label}
            </h3>

            <div>
              <span className="text-[11px] text-zinc-500 block mb-0.5">Metode Berpikir:</span>
              <p className="text-xs text-zinc-300 font-medium">
                {selectedNode.thinkingMode}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 block mb-0.5">Deskripsi:</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 block mb-0.5">Pratinjau Draf:</span>
              <div className="p-2.5 rounded bg-black border border-zinc-900 text-xs text-zinc-300 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line">
                {selectedNode.contentSnippet || "Konten tersedia pada Naskah Utuh."}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-500 py-12">
            Pilih simpul pada diagram untuk melihat rincian.
          </div>
        )}
      </div>

    </div>
  );
};
