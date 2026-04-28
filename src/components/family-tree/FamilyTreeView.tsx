'use client';

import { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import type { Person, Relationship } from '@/types/family';
import { AnimatePresence } from 'framer-motion';
import PersonNode from './PersonNode';
import PersonDetailPanel from './PersonDetailPanel';

const nodeTypes = { person: PersonNode };

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

function getLayoutedElements(
  people: Person[],
  relationships: Relationship[],
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  // Add nodes
  people.forEach((person) => {
    g.setNode(person.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges (only parent->child for tree layout)
  const edges: Edge[] = [];
  relationships.forEach((rel) => {
    if (rel.relationship_type === 'parent') {
      g.setEdge(rel.person_id, rel.related_person_id);
      edges.push({
        id: rel.id,
        source: rel.person_id,
        target: rel.related_person_id,
        type: 'smoothstep',
        style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
      });
    } else if (rel.relationship_type === 'spouse') {
      edges.push({
        id: rel.id,
        source: rel.person_id,
        target: rel.related_person_id,
        type: 'smoothstep',
        style: { stroke: 'var(--color-accent)', strokeWidth: 2, strokeDasharray: '5 5' },
        animated: false,
      });
    }
  });

  dagre.layout(g);

  const nodes: Node[] = people.map((person) => {
    const nodeWithPosition = g.node(person.id);
    return {
      id: person.id,
      type: 'person',
      data: person,
      position: {
        x: (nodeWithPosition?.x ?? 0) - NODE_WIDTH / 2,
        y: (nodeWithPosition?.y ?? 0) - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes, edges };
}

interface Props {
  people: Person[];
  relationships: Relationship[];
}

export default function FamilyTreeView({ people, relationships }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(people, relationships),
    [people, relationships],
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedPerson(node.data as Person);
  }, []);

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-6xl mb-4">🌳</div>
        <h2 className="font-heading text-2xl font-bold mb-2">No family members yet</h2>
        <p className="text-muted max-w-md">
          The family tree is empty. Add people and relationships through the Supabase dashboard
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={20} />
        <Controls
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
          }}
        />
        <MiniMap
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
          }}
          nodeColor="var(--color-primary)"
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>

      <AnimatePresence>
        {selectedPerson && (
          <PersonDetailPanel
            key={selectedPerson.id}
            person={selectedPerson}
            onClose={() => setSelectedPerson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
