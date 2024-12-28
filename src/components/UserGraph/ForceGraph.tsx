import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Report } from '../../types/report';

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

interface ForceGraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
  onNodeClick: (node: Node) => void;
}

export default function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Create the simulation
    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.radius + 10));

    // Create the links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#4B5563")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Create the nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(drag(simulation) as any)
      .on("click", (event, d) => onNodeClick(d));

    // Add circles to nodes
    node.append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => `hsl(${d.reports.length * 20}, 70%, 50%)`)
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2);

    // Add labels to nodes
    node.append("text")
      .text((d) => d.username)
      .attr("x", 0)
      .attr("y", (d) => -d.radius - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px");

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  // Implement drag behavior
  function drag(simulation: d3.Simulation<any, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
}