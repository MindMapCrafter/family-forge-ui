
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
  
  if (language === 'en') {
    return `${relationship} of ${nameList}`;
  } else if (language === 'ur') {
    return `${nameList} کا ${relationship}`;
  } else if (language === 'pa') {
    return `${nameList} ਦਾ ${relationship}`;
  }
  
  return `${relationship} of ${nameList}`;
};
