import React, { useState, useCallback, useRef, useMemo } from 'react';
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
import { Plus, FileDown, FileUp, RotateCcw, ZoomIn, ZoomOut, MoveHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberNode from '@/components/FamilyMemberNode';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal, { EditMemberFormValues } from '@/components/EditMemberModal';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

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
    relationship?: string;
  } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [hiddenChildren, setHiddenChildren] = useState<{[nodeId: string]: boolean}>({});
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
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

  // Get children nodes for a parent node
  const getChildNodesIds = useCallback((parentId: string) => {
    const childIds: string[] = [];
    edges.forEach(edge => {
      // Child edges are when the parent is the source
      if (edge.source === parentId) {
        childIds.push(edge.target);
      }
    });
    return childIds;
  }, [edges]);

  // Get parent nodes for a child node
  const getParentNodesIds = useCallback((childId: string) => {
    const parentIds: string[] = [];
    edges.forEach(edge => {
      // Parent edges are when the child is the target
      if (edge.target === childId) {
        parentIds.push(edge.source);
      }
    });
    return parentIds;
  }, [edges]);

  // Get grandparent nodes for a child node
  const getGrandparentNodesIds = useCallback((childId: string) => {
    const parentIds = getParentNodesIds(childId);
    const grandparentIds: string[] = [];
    
    parentIds.forEach(parentId => {
      const grandparents = getParentNodesIds(parentId);
      grandparentIds.push(...grandparents);
    });
    
    return grandparentIds;
  }, [getParentNodesIds]);

  // Find related members for a given node ID with expanded hierarchy
  const findRelatedMembers = useCallback((nodeId: string) => {
    const relatedMembers = {
      parents: [] as {id: string, name: string}[],
      children: [] as {id: string, name: string}[],
      spouses: [] as {id: string, name: string}[],
      siblings: [] as {id: string, name: string}[],
      grandparents: [] as {id: string, name: string}[],
      grandchildren: [] as {id: string, name: string}[]
    };
    
    // Get direct parents
    const parentIds = getParentNodesIds(nodeId);
    parentIds.forEach(parentId => {
      const parentNode = nodes.find(node => node.id === parentId);
      if (parentNode) {
        relatedMembers.parents.push({ id: parentNode.id, name: parentNode.data.name });
      }
    });
    
    // Get direct children
    const childIds = getChildNodesIds(nodeId);
    childIds.forEach(childId => {
      const childNode = nodes.find(node => node.id === childId);
      if (childNode) {
        relatedMembers.children.push({ id: childNode.id, name: childNode.data.name });
      }
    });
    
    // Get grandparents
    const grandparentIds = getGrandparentNodesIds(nodeId);
    grandparentIds.forEach(grandparentId => {
      const grandparentNode = nodes.find(node => node.id === grandparentId);
      if (grandparentNode) {
        relatedMembers.grandparents.push({ id: grandparentNode.id, name: grandparentNode.data.name });
      }
    });
    
    // Get grandchildren
    childIds.forEach(childId => {
      const grandchildIds = getChildNodesIds(childId);
      grandchildIds.forEach(grandchildId => {
        const grandchildNode = nodes.find(node => node.id === grandchildId);
        if (grandchildNode) {
          relatedMembers.grandchildren.push({ id: grandchildNode.id, name: grandchildNode.data.name });
        }
      });
    });
    
    // Get spouses and siblings
    edges.forEach(edge => {
      const currentNode = nodes.find(node => node.id === nodeId);
      if (!currentNode) return;
      
      if (edge.target === nodeId) { // The other node points to this node
        const sourceNode = nodes.find(node => node.id === edge.source);
        if (sourceNode && sourceNode.data.relationship) {
          const relation = sourceNode.data.relationship.toLowerCase();
          
          if (relation === 'spouse' || relation === 'husband' || relation === 'wife') {
            relatedMembers.spouses.push({ id: sourceNode.id, name: sourceNode.data.name });
          } else if (relation === 'sibling' || relation === 'brother' || relation === 'sister') {
            relatedMembers.siblings.push({ id: sourceNode.id, name: sourceNode.data.name });
          }
        }
      }
      
      if (edge.source === nodeId) { // This node points to another node
        const targetNode = nodes.find(node => node.id === edge.target);
        if (targetNode && targetNode.data.relationship) {
          const relation = targetNode.data.relationship.toLowerCase();
          
          if (relation === 'spouse' || relation === 'husband' || relation === 'wife') {
            relatedMembers.spouses.push({ id: targetNode.id, name: targetNode.data.name });
          } else if (relation === 'sibling' || relation === 'brother' || relation === 'sister') {
            relatedMembers.siblings.push({ id: targetNode.id, name: targetNode.data.name });
          }
        }
      }
    });
    
    return relatedMembers;
  }, [nodes, edges, getParentNodesIds, getChildNodesIds, getGrandparentNodesIds]);

  // Generate contextual relation description with improved formatting and hierarchy
  const generateRelationContext = useCallback((nodeId: string, relationship: string) => {
    if (relationship.toLowerCase() === 'root') return 'Root Member';
    
    const relatedMembers = findRelatedMembers(nodeId);
    const relationship_lc = relationship.toLowerCase();
    const relationContexts: string[] = [];
    
    // Handle child relationship with parents
    if (relationship_lc === 'child' || relationship_lc === 'son' || relationship_lc === 'daughter') {
      if (relatedMembers.parents.length > 0) {
        const parentNames = relatedMembers.parents.map(p => p.name).join(' & ');
        relationContexts.push(`Child of ${parentNames}`);
      }
      
      // Add grandparent relation
      if (relatedMembers.grandparents.length > 0) {
        const grandparentNames = relatedMembers.grandparents.map(p => p.name).join(' & ');
        relationContexts.push(`Grandchild of ${grandparentNames}`);
      }
    } 
    // Handle parent relationship with children
    else if (relationship_lc === 'parent' || relationship_lc === 'father' || relationship_lc === 'mother') {
      if (relatedMembers.children.length > 0) {
        const childNames = relatedMembers.children.map(c => c.name);
        if (childNames.length === 1) {
          relationContexts.push(`Parent of ${childNames[0]}`);
        } else if (childNames.length > 1) {
          const lastChild = childNames.pop();
          relationContexts.push(`Parent of ${childNames.join(', ')} & ${lastChild}`);
        }
      }
      
      // Add grandchildren relation
      if (relatedMembers.grandchildren.length > 0) {
        const grandchildNames = relatedMembers.grandchildren.map(c => c.name);
        if (grandchildNames.length === 1) {
          relationContexts.push(`Grandparent of ${grandchildNames[0]}`);
        } else if (grandchildNames.length > 1) {
          const lastGrandchild = grandchildNames.pop();
          relationContexts.push(`Grandparent of ${grandchildNames.join(', ')} & ${lastGrandchild}`);
        }
      }
    } 
    // Handle spouse relationship 
    else if (relationship_lc === 'spouse' || relationship_lc === 'husband' || relationship_lc === 'wife') {
      if (relatedMembers.spouses.length > 0) {
        const spouseNames = relatedMembers.spouses.map(s => s.name).join(' & ');
        relationContexts.push(`Spouse of ${spouseNames}`);
      }
    } 
    // Handle sibling relationship
    else if (relationship_lc === 'sibling' || relationship_lc === 'brother' || relationship_lc === 'sister') {
      if (relatedMembers.siblings.length > 0) {
        const siblingNames = relatedMembers.siblings.map(s => s.name);
        if (siblingNames.length === 1) {
          relationContexts.push(`Sibling of ${siblingNames[0]}`);
        } else if (siblingNames.length > 1) {
          const lastSibling = siblingNames.pop();
          relationContexts.push(`Sibling of ${siblingNames.join(', ')} & ${lastSibling}`);
        }
      }
    }
    // Handle grandparent relationships
    else if (relationship_lc === 'grandfather' || relationship_lc === 'grandmother') {
      if (relatedMembers.children.length > 0) {
        const grandchildNames = relatedMembers.children.map(c => c.name);
        if (grandchildNames.length === 1) {
          relationContexts.push(`${relationship} of ${grandchildNames[0]}`);
        } else if (grandchildNames.length > 1) {
          const lastGrandchild = grandchildNames.pop();
          relationContexts.push(`${relationship} of ${grandchildNames.join(', ')} & ${lastGrandchild}`);
        }
      }
    }
    // Handle grandchild relationships
    else if (relationship_lc === 'grandchild' || relationship_lc === 'grandson' || relationship_lc === 'granddaughter') {
      if (relatedMembers.parents.length > 0) {
        const grandparentNames = relatedMembers.parents.map(p => p.name).join(' & ');
        relationContexts.push(`${relationship} of ${grandparentNames}`);
      }
    }
    
    return relationContexts.join('; ') || relationship;
  }, [findRelatedMembers]);

  // Handle hiding/showing children nodes
  const handleToggleChildren = useCallback((nodeId: string, isCollapsed: boolean) => {
    // Update hidden children state
    setHiddenChildren(prev => ({
      ...prev,
      [nodeId]: isCollapsed
    }));
    
    // Get all child node IDs for this parent
    const childIds = getChildNodesIds(nodeId);
    
    // Update node visibility
    setNodes(currentNodes => 
      currentNodes.map(node => {
        if (childIds.includes(node.id)) {
          return {
            ...node,
            hidden: isCollapsed
          };
        }
        return node;
      })
    );
    
    // After a brief delay to allow state updates, fit view to adjust
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    }, 100);
    
    toast({
      title: isCollapsed ? 'Children hidden' : 'Children shown',
      description: `${isCollapsed ? 'Hidden' : 'Showing'} children nodes for this family member.`
    });
  }, [getChildNodesIds, setNodes, reactFlowInstance, toast]);

  // Update node relation contexts and hasChildren property
  const updateAllNodeProperties = useCallback(() => {
    setNodes(currentNodes => currentNodes.map(node => {
      const childIds = getChildNodesIds(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          relationContext: generateRelationContext(node.id, node.data.relationship),
          hasChildren: childIds.length > 0,
          onToggleChildren: handleToggleChildren
        }
      };
    }));
  }, [setNodes, generateRelationContext, getChildNodesIds, handleToggleChildren]);

  // Update contexts whenever nodes or edges change
  React.useEffect(() => {
    if (nodes.length > 0) {
      updateAllNodeProperties();
    }
  }, [nodes.length, edges.length, updateAllNodeProperties]);

  // Handle adding a new member
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
          relationContext: 'Root Member',
          gender,
          image,
          title,
          id: newId,
          onEdit: (id: string) => handleEditMember(id),
          onDelete: (id: string) => handleDeleteMember(id),
          onToggleChildren: handleToggleChildren,
          hasChildren: false
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
        onToggleChildren: handleToggleChildren,
        hasChildren: false
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
    
    // Update relation contexts after a small delay to ensure nodes and edges are updated
    setTimeout(() => {
      updateAllNodeProperties();
    }, 100);
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
      toast({
        title: 'Error',
        description: 'Could not find the family member to edit.',
        variant: 'destructive'
      });
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
          console.log("Updating node:", node.id);
          return {
            ...node,
            data: {
              ...node.data,
              name: values.name,
              gender: values.gender,
              image: values.image,
              title: values.title,
              id: node.data.id,
              onEdit: node.data.onEdit,
              onDelete: node.data.onDelete,
              onToggleChildren: handleToggleChildren,
              hasChildren: node.data.hasChildren
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
      
      // Update relation contexts after editing
      setTimeout(() => {
        updateAllNodeProperties();
      }, 100);
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
      setNodes(nodes.filter(node => node.data.id !== id));
      setEdges(edges.filter(edge => edge.source !== id && edge.target !== id));
      toast({
        title: 'Member deleted',
        description: 'Family member has been removed from the tree.'
      });
      
      // Update relation contexts after deletion
      setTimeout(() => {
        updateAllNodeProperties();
      }, 100);
    }
  };

  const handleImport = () => {
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
              const processedNodes = importedData.nodes.map((node: Node) => ({
                ...node,
                data: {
                  ...node.data,
                  id: node.id,
                  onEdit: (id: string) => handleEditMember(id),
                  onDelete: (id: string) => handleDeleteMember(id),
                  onToggleChildren: handleToggleChildren,
                }
              }));
              
              setNodes(processedNodes);
              setEdges(importedData.edges);
              
              // Update all node properties including hasChildren
              setTimeout(() => {
                updateAllNodeProperties();
              }, 100);
              
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
    
    const cleanNodes = nodes.map(node => ({
      ...node,
      data: {
        name: node.data.name,
        relationship: node.data.relationship,
        gender: node.data.gender,
        image: node.data.image,
        title: node.data.title,
        id: node.data.id,
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
        setHiddenChildren({});
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prophet Family Tree</h1>
          <LanguageSelector />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={handleAddMember} className="flex gap-1 items-center">
            <Plus size={16} />
            {t.addMember}
          </Button>
          <Button onClick={handleImport} variant="outline" className="flex gap-1 items-center">
            <FileUp size={16} />
            {t.import}
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex gap-1 items-center">
            <FileDown size={16} />
            {t.export}
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex gap-1 items-center">
            <RotateCcw size={16} />
            {t.reset}
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
          minZoom={0.01}
          maxZoom={16}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          attributionPosition="bottom-right"
          className="w-full h-full"
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          selectionOnDrag={false}
          style={{overflow: 'auto'}}
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
