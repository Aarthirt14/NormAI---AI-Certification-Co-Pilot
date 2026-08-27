'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen,
  Info,
  AlertCircle
} from 'lucide-react';
import { LanguageCode } from '@/types';
import { CitationBadge } from '@/components/common/CitationBadge';
import { standardsApi, GraphNode, GraphEdge } from '@/lib/api';

interface StandardsGraphViewProps {
  language: LanguageCode;
  onOpenClause: (code: string, clause?: string) => void;
  selectedRootCode?: string;
}

// Fallback nodes for offline/demo reference
const FALLBACK_NODES: GraphNode[] = [
  {
    id: 'is-302-2-14',
    code: 'IS 302-2-14',
    title: 'Kitchen Machines Safety Particulars',
    type: 'PRIMARY',
    year: '2009 (Rev. 1)',
    effectiveDate: 'Mandatory QCO 2023',
    desc: 'Primary product standard specifying domestic mixer grinder, blender, and food processor electrical safety requirements.',
    x: 450,
    y: 260
  },
  {
    id: 'is-302-1',
    code: 'IS 302-1',
    title: 'Household Appliances — General Safety',
    type: 'ACTIVE',
    year: '2008',
    effectiveDate: 'Parent Baseline Standard',
    desc: 'Parent general safety foundation specifying electric strength, earthing, creepage distances, and plastic flammability tests.',
    x: 180,
    y: 120
  },
  {
    id: 'amd-1-2022',
    code: 'Amendment No. 1 (2022)',
    title: 'Thermal Overload Trip Protocol',
    type: 'AMENDMENT',
    year: '2022',
    effectiveDate: 'Enforced 2023',
    desc: 'Mandates locked-rotor 30-second endurance trip test and cycling longevity verification for thermal cutout devices.',
    x: 720,
    y: 130
  },
  {
    id: 'amd-2-2024',
    code: 'Amendment No. 2 (2024)',
    title: 'Dual-Stage Mechanical Lid Interlock',
    type: 'AMENDMENT',
    year: '2024',
    effectiveDate: 'Enforced Oct 2024',
    desc: 'Mandates mechanical interlock stopping blade rotation within 1.5 seconds if jar lid is detached.',
    x: 740,
    y: 380
  },
  {
    id: 'is-694',
    code: 'IS 694',
    title: 'PVC Insulated Cables up to 1100V',
    type: 'REFERENCED',
    year: '2010 (Rev. 4)',
    effectiveDate: 'Quality Order',
    desc: 'Referenced by Clause 25.7 for copper conductor cross-section (min 0.75 mm²) and insulation flame retardancy.',
    x: 180,
    y: 390
  },
  {
    id: 'is-1293',
    code: 'IS 1293',
    title: 'Plugs & Socket-Outlets up to 250V',
    type: 'REFERENCED',
    year: '2019 (Rev. 5)',
    effectiveDate: 'Mandatory Sleeves',
    desc: 'Referenced for 6A 3-pin molded power plug with insulated live pin sleeves to protect consumers.',
    x: 450,
    y: 470
  }
];

const FALLBACK_EDGES: GraphEdge[] = [
  { source: 'is-302-2-14', target: 'is-302-1', type: 'derived-from', label: 'Part of Family' },
  { source: 'is-302-2-14', target: 'amd-1-2022', type: 'amended-by', label: 'TOP Trip Test' },
  { source: 'is-302-2-14', target: 'amd-2-2024', type: 'amended-by', label: 'Mechanical Interlock' },
  { source: 'is-302-2-14', target: 'is-694', type: 'references', label: 'Supply Cord spec' },
  { source: 'is-302-2-14', target: 'is-1293', type: 'references', label: 'Plug Sleeves spec' }
];

export const StandardsGraphView: React.FC<StandardsGraphViewProps> = ({
  language,
  onOpenClause,
  selectedRootCode = 'IS 302-2-14'
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('is-302-2-14');
  const [nodes, setNodes] = useState<GraphNode[]>(FALLBACK_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(FALLBACK_EDGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await standardsApi.getGraph(selectedRootCode);
        setNodes(response.nodes || []);
        setEdges(response.edges || []);
        // Set first node as selected
        if (response.nodes && response.nodes.length > 0) {
          const rootNode = response.nodes.find(n => n.type === 'PRIMARY') || response.nodes[0];
          setSelectedNodeId(rootNode.id);
        }
      } catch (err: any) {
        setApiError(err.message || 'Failed to fetch standards relationship topology.');
        setNodes(FALLBACK_NODES);
        setEdges(FALLBACK_EDGES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, [selectedRootCode]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="space-y-2 border-b border-border-ui pb-6">
        <h1 className="text-3xl font-bold text-text-dark tracking-tight flex items-center gap-2">
          <GitBranch className="w-7 h-7 text-brand-blue" />
          Standards Amendment & Relationship Graph
        </h1>
        <p className="text-sm text-text-muted max-w-3xl">
          Visualizing active Indian Standard amendments, parent specifications, and mandatory cross-referenced standards dynamically.
        </p>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-control flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error: {apiError}. (Using offline backup dataset)</span>
        </div>
      )}

      {/* Main split dashboard: Left 65% Interactive SVG Graph + Right 35% Node Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: SVG RELATIONSHIP CANVAS (8 Cols ~ 65%) */}
        <div className="lg:col-span-8 bg-white rounded-container border border-border-ui shadow-card overflow-hidden">
          <div className="p-4 border-b border-border-ui bg-slate-50/50 flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-text-dark flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              Interactive Topology Map: {selectedRootCode}
            </span>
            <span>Click any node to inspect regulatory context</span>
          </div>

          {isLoading ? (
            <div className="h-[480px] flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
              <span className="text-xs text-text-muted font-medium">Resolving amendment timeline linkages...</span>
            </div>
          ) : (
            <div className="relative overflow-x-auto p-4 flex justify-center">
              <svg className="w-[900px] h-[520px] shrink-0" viewBox="0 0 900 520">
                {/* SVG Definitions for directional arrow markers */}
                <defs>
                  <marker id="arrow-derived" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#CBD5E1" />
                  </marker>
                  <marker id="arrow-amendment" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FBBF24" />
                  </marker>
                  <marker id="arrow-reference" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                  </marker>
                </defs>

                {/* Graph Edges / Relationship Lines */}
                {edges.map((edge, idx) => {
                  const srcNode = nodes.find(n => n.id === edge.source);
                  const tgtNode = nodes.find(n => n.id === edge.target);
                  if (!srcNode || !tgtNode) return null;

                  const isAmd = edge.type === 'amended-by' || edge.type === 'AMENDED_BY' || edge.type === 'AMENDS';
                  const isRef = edge.type === 'references' || edge.type === 'REFERENCES' || edge.type === 'PART_OF';

                  let strokeColor = '#E2E8F0';
                  let strokeDash = undefined;
                  let marker = 'url(#arrow-derived)';

                  if (isAmd) {
                    strokeColor = '#F59E0B'; // Amber for amendments
                    strokeDash = '4,4';
                    marker = 'url(#arrow-amendment)';
                  } else if (isRef) {
                    strokeColor = '#3B82F6'; // Blue for mandatory references
                    marker = 'url(#arrow-reference)';
                  }

                  return (
                    <g key={idx}>
                      <line 
                        x1={srcNode.x} 
                        y1={srcNode.y} 
                        x2={tgtNode.x} 
                        y2={tgtNode.y} 
                        stroke={strokeColor} 
                        strokeWidth="2.5"
                        strokeDasharray={strokeDash}
                        markerEnd={marker}
                      />
                      {/* Edge Label text details */}
                      <text 
                        x={(srcNode.x + tgtNode.x) / 2} 
                        y={(srcNode.y + tgtNode.y) / 2 - 8} 
                        fill={isAmd ? '#B45309' : (isRef ? '#1D4ED8' : '#64748B')}
                        fontSize="9" 
                        fontWeight="700"
                        textAnchor="middle"
                        className="bg-white px-1 font-sans"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {/* Graph Nodes / Circle Buttons */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  
                  let fill = '#FFFFFF';
                  let stroke = '#94A3B8';
                  let textCol = '#0F172A';

                  if (node.type === 'PRIMARY') {
                    fill = '#EFF6FF';
                    stroke = '#2563EB'; // Thick blue ring for target standard
                  } else if (node.type === 'AMENDMENT') {
                    fill = '#FFFBEB';
                    stroke = '#D97706'; // Amber ring for amendments
                  } else if (node.type === 'SUPERSEDED') {
                    fill = '#F8FAFC';
                    stroke = '#CBD5E1';
                    textCol = '#94A3B8';
                  }

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x},${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer select-none group"
                    >
                      {/* Circle Background */}
                      <circle 
                        r="26" 
                        fill={fill} 
                        stroke={isSelected ? '#10B981' : stroke} 
                        strokeWidth={isSelected ? '3.5' : '2'}
                        className="transition-all duration-200 group-hover:scale-105"
                      />
                      {/* Standard Code Label inside Node */}
                      <text 
                        textAnchor="middle" 
                        dy=".3em" 
                        fontSize="8.5" 
                        fontWeight="800" 
                        fill={textCol}
                        className="font-mono"
                      >
                        {node.code.length > 12 ? node.code.slice(0, 10) + '..' : node.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Color Key Legends */}
          <div className="p-4 border-t border-border-ui bg-slate-50/50 flex flex-wrap gap-4 items-center justify-center text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-50 border border-blue-500" />
              <span className="font-semibold text-text-dark">Primary standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 border border-amber-600" />
              <span className="font-semibold text-text-dark">Active Amendment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400" />
              <span className="font-semibold text-text-dark">Referenced standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-50 border border-slate-200" />
              <span className="font-semibold text-text-muted">Superseded</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED NODE DETAIL CARD (4 Cols ~ 35%) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-container border border-border-ui shadow-card p-5 sm:p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                  selectedNode?.type === 'PRIMARY' 
                    ? 'bg-blue-100 text-blue-800' 
                    : (selectedNode?.type === 'AMENDMENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-text-muted')
                }`}>
                  {selectedNode?.type} Node
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-status-success px-2 py-0.5 rounded">
                  Status: Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-dark font-mono">
                {selectedNode?.code}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-text-muted uppercase tracking-wider text-[10px]">Title</div>
                <div className="font-semibold text-text-dark text-sm">
                  {selectedNode?.title}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-text-muted uppercase tracking-wider text-[10px]">Effective Enforcement</div>
                <div className="font-semibold text-text-body">
                  {selectedNode?.effectiveDate}
                </div>
              </div>

              <div className="space-y-1 border-t border-border-ui-light pt-3">
                <div className="font-bold text-text-muted uppercase tracking-wider text-[10px] mb-1">Regulatory Context</div>
                <p className="text-xs text-text-body leading-relaxed font-medium">
                  {selectedNode?.desc}
                </p>
              </div>

              {selectedNode?.type !== 'AMENDMENT' && selectedNode?.code && (
                <div className="pt-2">
                  <CitationBadge
                    code={selectedNode.code}
                    clause="Clause 1.1"
                    onClick={() => onOpenClause(selectedNode.code, 'Clause 1.1')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
