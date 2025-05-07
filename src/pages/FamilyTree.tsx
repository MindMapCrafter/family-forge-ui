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

  // Increased spacing for better readability
  const horizontalSpacing = 300;
  const verticalSpacing = 200;

  // Base position is the related node's position
  const baseX = relatedNode.position.x;
  const baseY = relatedNode.position.y;

  // Check relationship type to determine positioning logic
  const relationshipLower = relationship.toLowerCase();
  
  // Updated positioning logic to improve layout
  // Spouse and sibling relationships (side by side)
  const sideByRelations = ['spouse', 'husband', 'wife', 'sibling', 'brother', 'sister'];
  if (sideByRelations.includes(relationshipLower)) {
    // Find existing siblings/spouses to place new node properly
    const existingSideBySide = existingNodes.filter(node => 
      node.data.relationship && 
      sideByRelations.includes(node.data.relationship.toLowerCase()) &&
      Math.abs(node.position.y - baseY) < 50 // nodes roughly at the same level
    );
    
    // Place horizontally with progressive offset
    return { 
      x: baseX + horizontalSpacing + (existingSideBySide.length * 75), 
      y: baseY 
    };
  }
  
  // Extended family at same level (cousins, etc.)
  const sameLevelRelations = ['cousin', 'nephew', 'niece'];
  if (sameLevelRelations.includes(relationshipLower)) {
    const existingSameLevel = existingNodes.filter(node => 
      node.data.relationship && 
      sameLevelRelations.includes(node.data.relationship.toLowerCase()) &&
      Math.abs(node.position.y - baseY) < 50
    );
    
    return { 
      x: baseX + horizontalSpacing + (existingSameLevel.length * 75), 
      y: baseY 
    };
  }
  
  // Parent relationships (always above)
  if (['parent', 'father', 'mother', 'grandfather', 'grandmother'].includes(relationshipLower)) {
    // Check for existing parents
    const existingParents = existingNodes.filter(node => 
      node.data.relationship && 
      ['parent', 'father', 'mother', 'grandfather', 'grandmother'].includes(node.data.relationship.toLowerCase()) &&
      Math.abs(node.position.y - (baseY - verticalSpacing)) < 50
    );
    
    return { 
      x: baseX + (existingParents.length * horizontalSpacing/2), 
      y: baseY - verticalSpacing 
    };
  }
  
  // Child relationships (always below)
  if (['child', 'son', 'daughter', 'grandchild', 'grandson', 'granddaughter'].includes(relationshipLower)) {
    // Check for existing children
    const existingChildren = existingNodes.filter(node => 
      node.data.relationship && 
      ['child', 'son', 'daughter', 'grandchild', 'grandson', 'granddaughter'].includes(node.data.relationship.toLowerCase()) &&
      Math.abs(node.position.y - (baseY + verticalSpacing)) < 50
    );
    
    return { 
      x: baseX + (existingChildren.length * horizontalSpacing/2), 
      y: baseY + verticalSpacing 
    };
  }
  
  // Default - place to the side to avoid overlaps
  return { x: baseX + horizontalSpacing, y: baseY };
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
  const { t, formatMessage } = useLanguage();
  
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
      // Only consider edges where the explicit relationship is parent->child
      if (edge.source === parentId) {
        const targetNode = nodes.find(node => node.id === edge.target);
        if (targetNode) {
          const relationship = targetNode.data.relationship?.toLowerCase() || '';
          // Only consider explicit child relationships
          if (['child', 'son', 'daughter', 'grandchild', 'grandson', 'granddaughter'].includes(relationship)) {
            childIds.push(edge.target);
          }
        }
      }
    });
    return childIds;
  }, [edges, nodes]);

  // Get parent nodes for a child node
  const getParentNodesIds = useCallback((childId: string) => {
    const parentIds: string[] = [];
    edges.forEach(edge => {
      // Only consider edges with explicit parent-child relationship
      if (edge.target === childId) {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === childId);
        if (sourceNode && targetNode) {
          // Check if the relationship is explicitly parent-child
          const relationship = targetNode.data.relationship?.toLowerCase() || '';
          if (['child', 'son', 'daughter'].includes(relationship)) {
            parentIds.push(edge.source);
          }
        }
      }
    });
    return parentIds;
  }, [edges, nodes]);

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

  // Get a node by ID
  const getNodeById = useCallback((id: string) => {
    return nodes.find(node => node.id === id);
  }, [nodes]);

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
      const parentNode = getNodeById(parentId);
      if (parentNode) {
        relatedMembers.parents.push({ id: parentNode.id, name: parentNode.data.name });
      }
    });
    
    // Get direct children
    const childIds = getChildNodesIds(nodeId);
    childIds.forEach(childId => {
      const childNode = getNodeById(childId);
      if (childNode) {
        relatedMembers.children.push({ id: childNode.id, name: childNode.data.name });
      }
    });
    
    // Get grandparents
    const grandparentIds = getGrandparentNodesIds(nodeId);
    grandparentIds.forEach(grandparentId => {
      const grandparentNode = getNodeById(grandparentId);
      if (grandparentNode) {
        relatedMembers.grandparents.push({ id: grandparentNode.id, name: grandparentNode.data.name });
      }
    });
    
    // Get grandchildren
    childIds.forEach(childId => {
      const grandchildIds = getChildNodesIds(childId);
      grandchildIds.forEach(grandchildId => {
        const grandchildNode = getNodeById(grandchildId);
        if (grandchildNode) {
          relatedMembers.grandchildren.push({ id: grandchildNode.id, name: grandchildNode.data.name });
        }
      });
    });
    
    // Get spouses and siblings
    edges.forEach(edge => {
      const currentNode = getNodeById(nodeId);
      if (!currentNode) return;
      
      if (edge.target === nodeId) { // The other node points to this node
        const sourceNode = getNodeById(edge.source);
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
        const targetNode = getNodeById(edge.target);
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
  }, [nodes, edges, getParentNodesIds, getChildNodesIds, getGrandparentNodesIds, getNodeById]);

  // Generate contextual relation description with improved formatting and hierarchy
  const generateRelationContext = useCallback((nodeId: string, relationship: string) => {
    if (relationship.toLowerCase() === 'root') {
      // Set different root labels based on language
      return t.language === 'en' ? 'Root Member' : 
             t.language === 'ur' ? 'بنیادی رکن' : 
             t.language === 'pa' ? 'ਮੁੱਢਲਾ ਮੈਂਬਰ' : 'Root Member';
    }
    
    // Find related members
    const relatedMembers = findRelatedMembers(nodeId);
    const relationshipLower = relationship.toLowerCase();
    let primaryRelation = '';

    // Get relationship translation from the correct language context
    const getRelationLabel = (relKey: string) => {
      return t[relKey as keyof typeof t] || relationship;
    };

    // Format name list with the correct language conjunction
    const formatNameList = (names: string[]) => {
      if (names.length === 0) return '';
      if (names.length === 1) return names[0];
      
      // Use language-specific conjunction
      const conjunction = t.language === 'ur' ? ' اور ' : 
                         t.language === 'pa' ? ' ਅਤੇ ' : ' & ';
                         
      const lastItem = names.pop();
      return names.join(', ') + conjunction + lastItem;
    };

    // Handle sibling relationship with more precision (side-by-side)
    if (['sibling', 'brother', 'sister'].includes(relationshipLower)) {
      // Only display "sibling of X" without implying other relationships
      if (relatedMembers.siblings.length > 0) {
        const siblingNames = relatedMembers.siblings.map(s => s.name);
        const siblingNameList = formatNameList(siblingNames);
        const siblingLabel = getRelationLabel(relationshipLower);
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${siblingNameList} کا ${siblingLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${siblingNameList} ਦਾ ${siblingLabel}`;
        } else {
          primaryRelation = `${siblingLabel} of ${siblingNameList}`;
        }
      }
    }
    // Handle spouse relationship with precise side-by-side layout
    else if (['spouse', 'husband', 'wife'].includes(relationshipLower)) {
      if (relatedMembers.spouses.length > 0) {
        const spouseNames = relatedMembers.spouses.map(s => s.name);
        const spouseNameList = formatNameList(spouseNames);
        const spouseLabel = getRelationLabel(relationshipLower);
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${spouseNameList} کا ${spouseLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${spouseNameList} ਦਾ ${spouseLabel}`;
        } else {
          primaryRelation = `${spouseLabel} of ${spouseNameList}`;
        }
      }
    }
    // Handle child relationship with parents, showing only direct parent
    else if (['child', 'son', 'daughter'].includes(relationshipLower)) {
      if (relatedMembers.parents.length > 0) {
        // Only include parents with direct parent-child relationship
        const directParentNames = relatedMembers.parents.map(p => p.name);
        const parentNameList = formatNameList(directParentNames);
        const childLabel = getRelationLabel(relationshipLower);
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${parentNameList} کا ${childLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${parentNameList} ਦਾ ${childLabel}`;
        } else {
          primaryRelation = `${childLabel} of ${parentNameList}`;
        }
      }
    }
    // Handle parent relationship with children, showing only direct children
    else if (['parent', 'father', 'mother'].includes(relationshipLower)) {
      if (relatedMembers.children.length > 0) {
        const childNames = relatedMembers.children.map(c => c.name);
        const childNameList = formatNameList(childNames);
        const parentLabel = getRelationLabel(relationshipLower);
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${childNameList} کا ${parentLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${childNameList} ਦਾ ${parentLabel}`;
        } else {
          primaryRelation = `${parentLabel} of ${childNameList}`;
        }
      }
    }
    // Handle other relationships similarly, with proper spacing and connections
    // ... keep existing code (other relationship handlers)
    
    // If we don't have a specific formatting for this relationship or couldn't determine relations
    if (!primaryRelation) {
      const relationKey = relationshipLower.trim();
      primaryRelation = getRelationLabel(relationKey);
    }
    
    return primaryRelation;
  }, [findRelatedMembers, t]);
  
  // Handle hiding/showing children nodes
  const handleToggleChildren = useCallback((nodeId: string, isCollapsed: boolean) => {
    // First check if this node has children before allowing toggle
    const childIds = getChildNodesIds(nodeId);
    
    // Only allow toggle if there are actual children
    if (childIds.length === 0) {
      return; // No children to hide/show
    }
    
    // Update hidden children state
    setHiddenChildren(prev => ({
      ...prev,
      [nodeId]: isCollapsed
    }));
    
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
      title: isCollapsed ? t.childrenHidden : t.childrenShown,
      description: formatMessage('childrenToggleDesc', { 
        state: isCollapsed ? t.hidden : t.showing 
      })
    });
  }, [getChildNodesIds, setNodes, reactFlowInstance, toast, t, formatMessage]);

  // Update node relation contexts and hasChildren property
  const updateAllNodeProperties = useCallback(() => {
    setNodes(currentNodes => currentNodes.map(node => {
      // Only show hasChildren if actual parent-child relationships exist
      const childIds = getChildNodesIds(node.id);
      
      return {
        ...node,
        data: {
          ...node.data,
          relationContext: generateRelationContext(node.id, node.data.relationship),
          hasChildren: childIds.length > 0, // Only true for nodes with actual children
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

  // Add the missing handleAddMember function
  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

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
        title: t.rootMemberAdded,
        description: formatMessage('rootMemberAddedDesc', { name })
      });
      setIsAddModalOpen(false);
      return;
    }
    
    // Find the related node
    const relatedNode = nodes.find(node => node.id === relatedTo);
    if (!relatedNode && relationship !== 'root') {
      toast({
        title: t.error,
        description: t.noMemberFound,
        variant: 'destructive'
      });
      return;
    }
    
    // Calculate position based on improved relationship positioning logic
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
      // Determine edge direction based on relationship type
      const relationshipLower = relationship.toLowerCase();
      
      // Parent-child relationships: parent is always source, child is target
      if (['child', 'son', 'daughter', 'grandchild', 'grandson', 'granddaughter'].includes(relationshipLower)) {
        newEdge = {
          id: `e-${relatedNode.id}-${newId}`,
          source: relatedTo,
          target: newId,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        };
      } 
      // Spouse/sibling relationships: newer node is source (to avoid confusing arrows)
      // This keeps spouse nodes side by side without hierarchy implications
      else if (['spouse', 'husband', 'wife', 'sibling', 'brother', 'sister'].includes(relationshipLower)) {
        newEdge = {
          id: `e-${newId}-${relatedNode.id}`,
          source: newId,
          target: relatedTo,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        };
      }
      // Parent relationships: new node is source, existing node is target
      else if (['parent', 'father', 'mother', 'grandfather', 'grandmother'].includes(relationshipLower)) {
        newEdge = {
          id: `e-${newId}-${relatedNode.id}`,
          source: newId,
          target: relatedTo,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        };
      }
      // Default: create an edge without implying hierarchy
      else {
        newEdge = {
          id: `e-${relatedNode.id}-${newId}`,
          source: newId,
          target: relatedNode.id, 
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        };
      }
    }
    
    setNodes(nds => [...nds, newNode]);
    if (newEdge) {
      setEdges(eds => [...eds, newEdge!]);
    }
    
    toast({
      title: t.memberAdded,
      description: formatMessage('memberAddedDesc', { name })
    });
    
    setIsAddModalOpen(false);
    
    // Update relation contexts immediately to ensure newly added node shows correct relationships
    setTimeout(() => {
      updateAllNodeProperties();
    }, 50);
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
      setEditError(t.noMemberFound);
      toast({
        title: t.error,
        description: t.noMemberFound,
        variant: 'destructive'
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditMemberSubmit = (values: EditMemberFormValues) => {
    if (!currentEditNode) {
      setEditError("No member selected for editing.");
      toast({
        title: t.error,
        description: t.noMemberFound,
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
        title: t.memberUpdated,
        description: formatMessage('memberUpdatedDesc', { name: values.name })
      });
      
      setIsEditModalOpen(false);
      setCurrentEditNode(null);
      setEditError(undefined);
      
      // Update relation contexts after editing
      setTimeout(() => {
        updateAllNodeProperties();
      }, 50);
    } catch (error) {
      console.error("Error updating member:", error);
      setEditError(t.updateFailedDesc);
      toast({
        title: t.updateFailed,
        description: t.updateFailedDesc,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      setNodes(nodes.filter(node => node.data.id !== id));
      setEdges(edges.filter(edge => edge.source !== id && edge.target !== id));
      toast({
        title: t.memberDeleted,
        description: t.memberDeletedDesc
      });
      
      // Update relation contexts after deletion
      setTimeout(() => {
        updateAllNodeProperties();
      }, 50);
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
              }, 50);
              
              toast({
                title: t.importSuccess,
                description: t.familyTreeExported
              });
            }
          } catch (error) {
            toast({
              title: t.importFailed,
              description: t.invalidFileFormat,
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
        title: t.nothingToExport,
        description: t.emptyTree,
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
      title: t.exportSuccess,
      description: t.familyTreeExported
    });
  };

  const handleReset = () => {
    if (nodes.length > 0) {
      if (window.confirm(t.resetConfirm)) {
        setNodes([]);
        setEdges([]);
        setHiddenChildren({});
        toast({
          title: t.resetComplete,
          description: t.familyTreeExported
        });
      }
    } else {
      toast({
        title: t.nothingToReset,
        description: t.emptyTree
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t.familyTreeTitle}</h1>
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
            <Button variant="outline" size="sm" onClick={handleZoomIn} title={t.zoomIn}>
              <ZoomIn size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} title={t.zoomOut}>
              <ZoomOut size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitView} title={t.fitView}>
              <MoveHorizontal size={16} />
            </Button>
          </Panel>
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
      
      {/* Add Member Modal */}
      <AddMemberModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddMemberSubmit}
        existingNodes={nodes}
        isFirstMember={nodes.length === 0}
      />
      
      {/* Edit Member Modal */}
      <EditMemberModal 
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setCurrentEditNode(null);
            setEditError(undefined);
          }
        }}
        onSubmit={handleEditMemberSubmit}
        initialValues={currentEditNode || { name: '' }}
        error={editError}
      />
    </div>
  );
};

export default FamilyTree;
