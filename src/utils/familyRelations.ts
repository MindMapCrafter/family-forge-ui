
import { Node, Edge } from 'reactflow';

// Function to create initial family tree with an empty structure
export const createInitialFamilyTree = (onEdit: (id: string) => void, onDelete: (id: string) => void, onToggleChildren: (id: string, isCollapsed: boolean) => void) => {
  // Initialize empty nodes and edges arrays
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  return { nodes, edges };
};

// Function to generate clear relationship description
export const generateRelationDescription = (
  relationship: string,
  relatedNames: string[],
  language: string
) => {
  if (relatedNames.length === 0) return relationship;
  
  const nameList = relatedNames.join(', ');
  
  // Enhanced Urdu relation formatting with proper possessive grammar
  if (language === 'en') {
    return `${relationship} of ${nameList}`;
  } else if (language === 'ur') {
    // Handle Urdu possessive grammar rules
    const lastChar = nameList[nameList.length - 1];
    // Use کا for masculine owners, کی for feminine owners
    // This is a simplified approach - in a real app, we'd need gender data for each person
    // Default to کا if we can't determine
    return `${nameList} کا ${relationship}`;
  } else if (language === 'pa') {
    return `${nameList} ਦਾ ${relationship}`;
  }
  
  return `${relationship} of ${nameList}`;
};

// Function to properly format possessive relationship text in Urdu
export const formatUrduPossessive = (ownerName: string, isOwnerFemale: boolean, relation: string) => {
  // Use کی for feminine owners, کا for masculine
  const possessive = isOwnerFemale ? 'کی' : 'کا';
  return `${ownerName} ${possessive} ${relation}`;
};

// Function to create a link relation between nodes - will be used when user adds real data
export const createRelationLink = (
  sourceId: string,
  targetId: string,
  relationshipType: string
) => {
  return {
    id: `edge-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    animated: true,
    label: relationshipType,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  };
};
