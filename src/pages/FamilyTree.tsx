
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileUp, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberNode from '@/components/FamilyMemberNode';
import AddMemberModal from '@/components/AddMemberModal';

// Register custom node types
const nodeTypes: NodeTypes = {
  familyMember: FamilyMemberNode,
};

// Initial empty state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Helper functions
const calculateNodePosition = (
  relatedNode: Node | undefined, 
  relationship: string,
  existingNodes: Node[]
) => {
  if (!relatedNode) {
    return { x: 0, y: 0 }; // Center for the first node
  }

  // Default spacing
  const horizontalSpacing = 250;
  const verticalSpacing = 150;

  // Base position is the related node's position
  const baseX = relatedNode.position.x;
  const baseY = relatedNode.position.y;

  switch (relationship) {
    case 'parent':
      return { x: baseX, y: baseY - verticalSpacing };
    case 'child':
      return { x: baseX, y: baseY + verticalSpacing };
    case 'spouse':
      return { x: baseX + horizontalSpacing, y: baseY };
    case 'sibling':
      return { x: baseX + horizontalSpacing, y: baseY };
    default:
      return { x: baseX, y: baseY };
  }
};

const FamilyTree = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366F1' } }, eds));
  }, [setEdges]);

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleAddMemberSubmit = (values: any) => {
    const { name, relationship, relatedTo } = values;
    
    // Generate a unique ID for the new node
    const newId = `member-${Date.now()}`;
    
    // If this is the first member (root)
    if (nodes.length === 0) {
      const newNode: Node = {
        id: newId,
        type: 'familyMember',
        data: {
          name,
          relationship: 'Root',
          onEdit: () => handleEditMember(newId),
          onDelete: () => handleDeleteMember(newId),
        },
        position: { x: 0, y: 0 }
      };
      
      setNodes([newNode]);
      toast({
        title: 'Root member added',
        description: `${name} has been added as the root of your family tree.`
      });
      setIsAddModalOpen(false);
      return;
    }
    
    // Find the related node
    const relatedNode = nodes.find(node => node.id === relatedTo);
    if (!relatedNode && relationship !== 'root') {
      toast({
        title: 'Error',
        description: 'Could not find the related family member.',
        variant: 'destructive'
      });
      return;
    }
    
    // Calculate position based on relationship
    const position = calculateNodePosition(relatedNode, relationship, nodes);
    
    // Create new node
    const newNode: Node = {
      id: newId,
      type: 'familyMember',
      data: {
        name,
        relationship: relationship.charAt(0).toUpperCase() + relationship.slice(1),
        onEdit: () => handleEditMember(newId),
        onDelete: () => handleDeleteMember(newId),
      },
      position
    };
    
    // Create edge between related node and new node
    let newEdge: Edge | null = null;
    if (relatedNode) {
      newEdge = {
        id: `e-${relatedNode.id}-${newId}`,
        source: relationship === 'child' ? relatedTo : newId,
        target: relationship === 'child' ? newId : relatedTo,
        animated: true,
        style: { stroke: '#6366F1' }
      };
    }
    
    setNodes(nds => [...nds, newNode]);
    if (newEdge) {
      setEdges(eds => [...eds, newEdge!]);
    }
    
    toast({
      title: 'Member added',
      description: `${name} has been added to your family tree.`
    });
    
    setIsAddModalOpen(false);
  };

  const handleEditMember = (id: string) => {
    // To be implemented: Edit functionality
    toast({
      title: 'Edit not implemented',
      description: 'Edit functionality will be added soon.',
    });
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      // Remove the node
      setNodes(nodes.filter(node => node.id !== id));
      
      // Remove any connected edges
      setEdges(edges.filter(edge => edge.source !== id && edge.target !== id));
      
      toast({
        title: 'Member deleted',
        description: 'Family member has been removed from the tree.'
      });
    }
  };

  const handleImport = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            if (importedData.nodes && importedData.edges) {
              // Add interaction callbacks to nodes
              const processedNodes = importedData.nodes.map((node: Node) => ({
                ...node,
                data: {
                  ...node.data,
                  onEdit: () => handleEditMember(node.id),
                  onDelete: () => handleDeleteMember(node.id),
                }
              }));
              
              setNodes(processedNodes);
              setEdges(importedData.edges);
              toast({
                title: 'Import successful',
                description: 'Family tree has been imported.'
              });
            }
          } catch (error) {
            toast({
              title: 'Import failed',
              description: 'The file format is not valid.',
              variant: 'destructive'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  const handleExport = () => {
    if (nodes.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'Your family tree is empty.',
        variant: 'destructive'
      });
      return;
    }
    
    // Clean up node data for export (remove callbacks)
    const cleanNodes = nodes.map(node => ({
      ...node,
      data: {
        name: node.data.name,
        relationship: node.data.relationship,
      }
    }));
    
    const data = { nodes: cleanNodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-tree.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export successful',
      description: 'Family tree has been exported as JSON.'
    });
  };

  const handleReset = () => {
    if (nodes.length > 0) {
      if (window.confirm('Are you sure you want to reset the family tree?')) {
        setNodes([]);
        setEdges([]);
        toast({
          title: 'Reset complete',
          description: 'Your family tree has been reset.'
        });
      }
    } else {
      toast({
        title: 'Nothing to reset',
        description: 'Your family tree is already empty.'
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Family Tree</h1>
        <div className="flex flex-wrap gap-2 mt-4">
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
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
      
      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddMemberSubmit}
        existingNodes={nodes}
        isFirstMember={nodes.length === 0}
      />
    </div>
  );
};

export default FamilyTree;
