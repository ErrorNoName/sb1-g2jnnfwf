import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useRealtimeReports } from '../../../hooks/useRealtimeReports';
import ForceGraph from '../../../components/UserGraph/ForceGraph';
import UserDetails from '../../../components/UserGraph/UserDetails';
import type { Report } from '../../../types/report';

interface Node {
  id: string;
  username: string;
  reports: Report[];
  radius: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export default function UserGraph() {
  const { reports } = useRealtimeReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const graphData = useMemo(() => {
    // Group reports by username
    const userReports = reports.reduce((acc, report) => {
      if (!acc[report.username]) {
        acc[report.username] = [];
      }
      acc[report.username].push(report);
      return acc;
    }, {} as Record<string, Report[]>);

    // Create nodes
    const nodes: Node[] = Object.entries(userReports).map(([username, reports]) => ({
      id: username,
      username,
      reports,
      radius: Math.max(20, Math.sqrt(reports.length) * 10)
    }));

    // Create links between users who have been reported in the same time period
    const links: Link[] = [];
    nodes.forEach((node1) => {
      nodes.forEach((node2) => {
        if (node1.id !== node2.id) {
          const commonReports = node1.reports.some(r1 => 
            node2.reports.some(r2 => 
              Math.abs(new Date(r1.created_at).getTime() - new Date(r2.created_at).getTime()) < 86400000 // 24h
            )
          );
          if (commonReports) {
            links.push({
              source: node1.id,
              target: node2.id,
              value: 1
            });
          }
        }
      });
    });

    return { nodes, links };
  }, [reports]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return graphData;

    const filteredNodes = graphData.nodes.filter(node =>
      node.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link =>
      filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchTerm]);

  return (
    <div className="animate-fade-in h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Graphique Utilisateurs</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 rounded-lg border-0 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-lg" style={{ height: '700px' }}>
          <ForceGraph
            data={filteredData}
            onNodeClick={setSelectedNode}
          />
        </div>
        <div className="lg:col-span-1">
          {selectedNode ? (
            <UserDetails
              username={selectedNode.username}
              reports={selectedNode.reports}
              onClose={() => setSelectedNode(null)}
            />
          ) : (
            <div className="glass p-6 rounded-lg">
              <p className="text-gray-400">
                Sélectionnez un utilisateur pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}