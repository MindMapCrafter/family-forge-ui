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
  
  // Special positioning for sibling, cousin, spouse relationships (side by side)
  const sideByRelations = ['cousin', 'uncle', 'aunt', 'sibling', 'brother', 'sister', 'spouse', 'husband', 'wife', 'nephew', 'niece'];
  if (sideByRelations.includes(relationshipLower)) {
    // Find existing siblings to place new node properly
    const existingSiblings = existingNodes.filter(node => 
      node.data.relationship && 
      sideByRelations.includes(node.data.relationship.toLowerCase()) &&
      node.position.y === baseY
    );
    
    // Place horizontally with progressive offset
    return { 
      x: baseX + horizontalSpacing + (existingSiblings.length * 50), 
      y: baseY 
    };
  }
  
  // Hierarchical relationships (above/below)
  switch (relationshipLower) {
    // Parent relationships (above)
    case 'parent':
    case 'father':
    case 'mother':
      // Check for existing parents
      const existingParents = existingNodes.filter(node => 
        node.data.relationship && 
        ['parent', 'father', 'mother'].includes(node.data.relationship.toLowerCase()) &&
        node.position.y === baseY - verticalSpacing
      );
      return { 
        x: baseX + (existingParents.length * horizontalSpacing/2), 
        y: baseY - verticalSpacing 
      };
    
    // Child relationships (below)
    case 'child':
    case 'son':
    case 'daughter':
      // Check for existing children
      const existingChildren = existingNodes.filter(node => 
        node.data.relationship && 
        ['child', 'son', 'daughter'].includes(node.data.relationship.toLowerCase()) &&
        node.position.y === baseY + verticalSpacing
      );
      return { 
        x: baseX + (existingChildren.length * horizontalSpacing/2), 
        y: baseY + verticalSpacing 
      };
    
    // Extended family - above
    case 'grandfather':
    case 'grandmother':
      return { x: baseX, y: baseY - (verticalSpacing * 2) };
      
    // Extended family - below
    case 'grandchild':
    case 'grandson':
    case 'granddaughter':
      return { x: baseX, y: baseY + (verticalSpacing * 2) };
      
    // Default - place to the side to avoid overlaps
    default:
      return { x: baseX + horizontalSpacing, y: baseY };
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
      // Child edges are when the parent is the source and relationship is hierarchical
      if (edge.source === parentId) {
        const targetNode = nodes.find(node => node.id === edge.target);
        if (targetNode) {
          const relationship = targetNode.data.relationship?.toLowerCase() || '';
          // Only consider hierarchical relationships (parent->child)
          if (relationship === 'child' || relationship === 'son' || relationship === 'daughter' || 
              relationship === 'grandchild' || relationship === 'grandson' || relationship === 'granddaughter') {
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
    
    const relatedMembers = findRelatedMembers(nodeId);
    const relationship_lc = relationship.toLowerCase();
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

    // Handle side-by-side relations first (relatives at the same level)
    if (['sibling', 'brother', 'sister', 'cousin', 'nephew', 'niece'].includes(relationship_lc)) {
      // Find direct relation with a peer
      const peers = edges.filter(edge => 
        (edge.source === nodeId || edge.target === nodeId) && 
        edge.source !== edge.target
      );
      
      if (peers.length > 0) {
        // Find the first direct peer relation
        for (const edge of peers) {
          const otherId = edge.source === nodeId ? edge.target : edge.source;
          const otherNode = getNodeById(otherId);
          
          if (otherNode) {
            const relationKey = relationship_lc;
            const relationLabel = getRelationLabel(relationKey);
            
            // Use proper language format
            if (t.language === 'ur') {
              // Urdu: name + ka + relation
              primaryRelation = `${otherNode.data.name} کا ${relationLabel}`;
            } else if (t.language === 'pa') {
              // Punjabi: name + da + relation
              primaryRelation = `${otherNode.data.name} ਦਾ ${relationLabel}`;
            } else {
              // English: relation + of + name
              primaryRelation = `${relationLabel} of ${otherNode.data.name}`;
            }
            
            // We only need one primary relationship
            break;
          }
        }
      }
    }
    // Handle spouse relationship
    else if (['spouse', 'husband', 'wife'].includes(relationship_lc)) {
      if (relatedMembers.spouses.length > 0) {
        const spouseNames = relatedMembers.spouses.map(s => s.name);
        const spouseNameList = formatNameList(spouseNames);
        const spouseLabel = getRelationLabel('spouse');
        
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
    // Handle child relationship with parents
    else if (['child', 'son', 'daughter'].includes(relationship_lc)) {
      if (relatedMembers.parents.length > 0) {
        const parentNames = relatedMembers.parents.map(p => p.name);
        const parentNameList = formatNameList(parentNames);
        const childLabel = getRelationLabel('child');
        
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
    // Handle parent relationship with children
    else if (['parent', 'father', 'mother'].includes(relationship_lc)) {
      if (relatedMembers.children.length > 0) {
        const childNames = relatedMembers.children.map(c => c.name);
        const childNameList = formatNameList(childNames);
        const parentLabel = getRelationLabel('parent');
        
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
    // Handle grandparent relationships
    else if (['grandfather', 'grandmother'].includes(relationship_lc)) {
      if (relatedMembers.grandchildren.length > 0) {
        const grandchildNames = relatedMembers.grandchildren.map(c => c.name);
        const grandchildNameList = formatNameList(grandchildNames);
        const grandparentLabel = getRelationLabel(relationship_lc);
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${grandchildNameList} کا ${grandparentLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${grandchildNameList} ਦਾ ${grandparentLabel}`;
        } else {
          primaryRelation = `${grandparentLabel} of ${grandchildNameList}`;
        }
      }
    }
    // Handle grandchild relationships
    else if (['grandchild', 'grandson', 'granddaughter'].includes(relationship_lc)) {
      if (relatedMembers.parents.length > 0) {
        const grandparentNames = relatedMembers.parents.map(p => p.name);
        const grandparentNameList = formatNameList(grandparentNames);
        const grandchildLabel = getRelationLabel('grandchild');
        
        // Format based on language
        if (t.language === 'ur') {
          primaryRelation = `${grandparentNameList} کا ${grandchildLabel}`;
        } else if (t.language === 'pa') {
          primaryRelation = `${grandparentNameList} ਦਾ ${grandchildLabel}`;
        } else {
          primaryRelation = `${grandchildLabel} of ${grandparentNameList}`;
        }
      }
    }
    // For uncle/aunt
    else if (['uncle', 'aunt'].includes(relationship_lc)) {
      // Find nieces/nephews
      const nieces = edges.filter(edge => 
        (edge.source === nodeId || edge.target === nodeId) && 
        edge.source !== edge.target
      );
      
      if (nieces.length > 0) {
        // Find the first direct relation
        for (const edge of nieces) {
          const otherId = edge.source === nodeId ? edge.target : edge.source;
          const otherNode = getNodeById(otherId);
          
          if (otherNode) {
            const relationKey = relationship_lc;
            const relationLabel = getRelationLabel(relationKey);
            
            // Format based on language
            if (t.language === 'ur') {
              primaryRelation = `${otherNode.data.name} کا ${relationLabel}`;
            } else if (t.language === 'pa') {
              primaryRelation = `${otherNode.data.name} ਦਾ ${relationLabel}`;
            } else {
              primaryRelation = `${relationLabel} of ${otherNode.data.name}`;
            }
            break;
          }
        }
      }
    }
    
    // If we don't have a specific formatting for this relationship or couldn't determine relations
    if (!primaryRelation) {
      const relationKey = relationship_lc.trim();
      primaryRelation = getRelationLabel(relationKey);
    }
    
    return primaryRelation;
  }, [findRelatedMembers, t, edges, getNodeById]);

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
    
    // Calculate position based on relationship and node type
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
      // Check relationship type to determine edge direction
      const relationshipLower = relationship.toLowerCase();
      const isHierarchical = ['child', 'son', 'daughter', 'grandchild', 'grandson', 'granddaughter'].includes(relationshipLower);
      
      // For hierarchical relationships (parent->child), parent is source
      // For non-hierarchical (side-by-side), we maintain a consistent direction
      newEdge = {
        id: `e-${relatedNode.id}-${newId}`,
        source: isHierarchical ? relatedTo : newId,
        target: isHierarchical ? newId : relatedTo,
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 }
      };
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
