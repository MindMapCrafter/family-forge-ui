
import React, { useState } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileUp, RotateCcw } from 'lucide-react';

// Initial empty state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const FamilyTree = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366F1' } }, eds));
  };

  const handleAddMember = () => {
    // To be implemented: Show modal for adding a member
    console.log('Add member clicked');
  };

  const handleImport = () => {
    // To be implemented: Import JSON functionality
    console.log('Import clicked');
  };

  const handleExport = () => {
    // To be implemented: Export functionality
    if (nodes.length === 0) {
      alert('No family tree to export');
      return;
    }
    
    const data = { nodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-tree.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (nodes.length > 0) {
      if (window.confirm('Are you sure you want to reset the family tree?')) {
        setNodes([]);
        setEdges([]);
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Family Tree</h1>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleAddMember} className="flex gap-1 items-center">
            <Plus size={16} />
            Add Member
          </Button>
          <Button onClick={handleImport} variant="outline" className="flex gap-1 items-center">
            <FileUp size={16} />
            Import
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex gap-1 items-center">
            <FileDown size={16} />
            Export
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex gap-1 items-center">
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>
      </div>
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FamilyTree;
