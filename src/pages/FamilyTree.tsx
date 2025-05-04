
import React, { useState, useCallback, useRef } from 'react';
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
  NodeTypes,
  Panel,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileUp, RotateCcw, ZoomIn, ZoomOut, MoveHorizontal, MoveVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberNode from '@/components/FamilyMemberNode';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal, { EditMemberFormValues } from '@/components/EditMemberModal';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  // Increased spacing for better readability in large trees
  const horizontalSpacing = 300;
  const verticalSpacing = 200;

  // Base position is the related node's position
  const baseX = relatedNode.position.x;
  const baseY = relatedNode.position.y;

  switch (relationship) {
    // Basic relationships
    case 'parent':
      return { x: baseX, y: baseY - verticalSpacing };
    case 'child':
      return { x: baseX, y: baseY + verticalSpacing };
    case 'spouse':
      return { x: baseX + horizontalSpacing, y: baseY };
    case 'sibling':
      return { x: baseX + horizontalSpacing, y: baseY };
    
    // Extended family relationships
    case 'grandfather':
    case 'grandmother':
      return { x: baseX, y: baseY - (verticalSpacing * 2) };
    case 'uncle':
    case 'aunt':
      return { x: baseX + horizontalSpacing, y: baseY - verticalSpacing };
    case 'cousin':
      return { x: baseX + horizontalSpacing, y: baseY };
    case 'nephew':
    case 'niece':
      return { x: baseX + horizontalSpacing, y: baseY + verticalSpacing };
    case 'grandchild':
      return { x: baseX, y: baseY + (verticalSpacing * 2) };
    default:
      return { x: baseX, y: baseY };
  }
};

const FamilyTree = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | undefined>(undefined);
  const [currentEditNode, setCurrentEditNode] = useState<{
    id: string;
    name: string;
    gender?: 'male' | 'female' | 'other';
    image?: string;
    title?: string;
    relationship?: string; // Add relationship field
  } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366F1', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  // Handle zoom in action with enhanced zooming
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      const currentZoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(currentZoom * 1.2);
    }
  }, [reactFlowInstance]);

  // Handle zoom out action with enhanced zooming
  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      const currentZoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(currentZoom * 0.8);
    }
  }, [reactFlowInstance]);

  // Handle fit view
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
    }
  }, [reactFlowInstance]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleAddMemberSubmit = (values: any) => {
    const { name, relationship, relatedTo, gender, image, title } = values;
    
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
          gender,
          image,
          title,
          id: newId,
          onEdit: (id: string) => handleEditMember(id),
          onDelete: (id: string) => handleDeleteMember(id),
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
        gender,
        image,
        title,
        id: newId,
        onEdit: (id: string) => handleEditMember(id),
        onDelete: (id: string) => handleDeleteMember(id),
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
        style: { stroke: '#6366F1', strokeWidth: 2 }
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
    console.log("Edit requested for ID:", id);
    console.log("Available nodes:", nodes.map(n => ({ id: n.id, nodeDataId: n.data.id, name: n.data.name })));
    
    // Clear any previous errors
    setEditError(undefined);
    
    const node = nodes.find(node => node.data.id === id);
    if (node) {
      console.log("Found node to edit:", node);
      setCurrentEditNode({
        id: node.data.id,
        name: node.data.name,
        gender: node.data.gender,
        image: node.data.image,
        title: node.data.title,
        relationship: node.data.relationship
      });
      setIsEditModalOpen(true);
    } else {
      console.log("Node not found for id:", id);
      setEditError("Could not find the member to edit.");
      // Show error in toast and also set it for the modal if it's opened
      toast({
        title: 'Error',
        description: 'Could not find the family member to edit.',
        variant: 'destructive'
      });
      // Still open the modal with error state to show the error in context
      setIsEditModalOpen(true);
    }
  };

  const handleEditMemberSubmit = (values: EditMemberFormValues) => {
    if (!currentEditNode) {
      setEditError("No member selected for editing.");
      toast({
        title: 'Error',
        description: 'No member selected for editing.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log("Updating node with ID:", currentEditNode.id, "Values:", values);
    
    try {
      setNodes(nodes.map(node => {
        if (node.data.id === currentEditNode.id) {
          // Update the node data while preserving other properties
          console.log("Updating node:", node.id);
          return {
            ...node,
            data: {
              ...node.data,
              name: values.name,
              gender: values.gender,
              image: values.image,
              title: values.title,
              // Do not update relationship as it should be read-only
              // Preserve the callbacks and id
              id: node.data.id,
              onEdit: node.data.onEdit,
              onDelete: node.data.onDelete,
            }
          };
        }
        return node;
      }));
      
      toast({
        title: 'Member updated',
        description: `${values.name} has been updated in your family tree.`
      });
      
      setIsEditModalOpen(false);
      setCurrentEditNode(null);
      setEditError(undefined);
    } catch (error) {
      console.error("Error updating member:", error);
      setEditError("Failed to update member. Please try again.");
      toast({
        title: 'Update failed',
        description: 'Failed to update family member. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      // Remove the node
      setNodes(nodes.filter(node => node.data.id !== id));
      
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
                  id: node.id, // Ensure the id is set on the data object
                  onEdit: (id: string) => handleEditMember(id),
                  onDelete: (id: string) => handleDeleteMember(id),
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
        gender: node.data.gender,
        image: node.data.image,
        title: node.data.title,
        id: node.data.id, // Preserve the id in data for reimporting
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
        <h1 className="text-2xl font-bold">Prophet Family Tree</h1>
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
      <div className="flex-grow relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          minZoom={0.01}  // Enhanced minimum zoom for extensive zoom-out capabilities
          maxZoom={16}    // Enhanced maximum zoom for closer inspection
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          attributionPosition="bottom-right"
          className="w-full h-full"
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          selectionOnDrag={false}
          style={{overflow: 'auto'}} // Enable scrollbars when content exceeds view
        >
          <Controls showInteractive={true} />
          <Panel position="top-right" className="bg-white p-2 rounded-md shadow-md flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitView} title="Fit View">
              <MoveHorizontal size={16} />
            </Button>
          </Panel>
          <MiniMap 
            nodeStrokeColor={(n) => {
              return n.data.gender === 'male' ? '#93c5fd' : n.data.gender === 'female' ? '#fbcfe8' : '#d1d5db';
            }}
            nodeColor={(n) => {
              return n.data.gender === 'male' ? '#dbeafe' : n.data.gender === 'female' ? '#fce7f3' : '#f3f4f6';
            }}
            maskColor="rgba(240, 240, 240, 0.6)"
          />
          <Background color="#aaa" gap={16} size={1} />
        </ReactFlow>
      </div>
      
      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddMemberSubmit}
        existingNodes={nodes}
        isFirstMember={nodes.length === 0}
      />
      
      <EditMemberModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            // Clear error state when closing the modal
            setEditError(undefined);
          }
        }}
        onSubmit={handleEditMemberSubmit}
        initialValues={currentEditNode || {
          name: '',
          gender: 'other',
          relationship: ''
        }}
        error={editError}
      />
    </div>
  );
};

export default FamilyTree;
