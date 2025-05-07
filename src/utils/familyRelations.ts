
import { Node, Edge } from 'reactflow';

// Function to create initial family tree with all the specified relationships
export const createInitialFamilyTree = (onEdit: (id: string) => void, onDelete: (id: string) => void, onToggleChildren: (id: string, isCollapsed: boolean) => void) => {
  // Initialize nodes array
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Create root node - Sohail
  const rootNode: Node = {
    id: 'sohail',
    type: 'familyMember',
    position: { x: 500, y: 100 },
    data: {
      id: 'sohail',
      name: 'Sohail',
      relationship: 'Root',
      relationContext: 'Root Member',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(rootNode);
  
  // Add Sohail's children - Danish, Abdullah, Zainab
  const danishNode: Node = {
    id: 'danish',
    type: 'familyMember',
    position: { x: 300, y: 250 },
    data: {
      id: 'danish',
      name: 'Danish',
      relationship: 'Child',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(danishNode);
  
  const abdullahNode: Node = {
    id: 'abdullah',
    type: 'familyMember',
    position: { x: 500, y: 250 },
    data: {
      id: 'abdullah',
      name: 'Abdullah',
      relationship: 'Child',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(abdullahNode);
  
  const zainabNode: Node = {
    id: 'zainab',
    type: 'familyMember',
    position: { x: 100, y: 250 },
    data: {
      id: 'zainab',
      name: 'Zainab',
      relationship: 'Child',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(zainabNode);
  
  // Connect Sohail to his children
  edges.push({
    id: 'e-sohail-danish',
    source: 'sohail',
    target: 'danish',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-sohail-abdullah',
    source: 'sohail',
    target: 'abdullah',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-sohail-zainab',
    source: 'sohail',
    target: 'zainab',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Farhan (Sohail's brother)
  const farhanNode: Node = {
    id: 'farhan',
    type: 'familyMember',
    position: { x: 700, y: 250 },
    data: {
      id: 'farhan',
      name: 'Farhan',
      relationship: 'Sibling',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(farhanNode);
  
  // Connect Sohail and Farhan as siblings
  edges.push({
    id: 'e-sohail-farhan',
    source: 'sohail',
    target: 'farhan',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Saima (Sohail's sister)
  const saimaNode: Node = {
    id: 'saima',
    type: 'familyMember',
    position: { x: 900, y: 250 },
    data: {
      id: 'saima',
      name: 'Saima',
      relationship: 'Sibling',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(saimaNode);
  
  // Connect Sohail and Saima as siblings
  edges.push({
    id: 'e-sohail-saima',
    source: 'sohail',
    target: 'saima',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Ayesha (Farhan's wife)
  const ayeshaNode: Node = {
    id: 'ayesha',
    type: 'familyMember',
    position: { x: 700, y: 350 },
    data: {
      id: 'ayesha',
      name: 'Ayesha',
      relationship: 'Spouse',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(ayeshaNode);
  
  // Connect Farhan and Ayesha as spouses
  edges.push({
    id: 'e-farhan-ayesha',
    source: 'farhan',
    target: 'ayesha',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Mussa and Sara (Children of Farhan and Ayesha)
  const mussaNode: Node = {
    id: 'mussa',
    type: 'familyMember',
    position: { x: 650, y: 450 },
    data: {
      id: 'mussa',
      name: 'Mussa',
      relationship: 'Child',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(mussaNode);
  
  const saraNode: Node = {
    id: 'sara',
    type: 'familyMember',
    position: { x: 750, y: 450 },
    data: {
      id: 'sara',
      name: 'Sara',
      relationship: 'Child',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(saraNode);
  
  // Connect Farhan to his children
  edges.push({
    id: 'e-farhan-mussa',
    source: 'farhan',
    target: 'mussa',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-farhan-sara',
    source: 'farhan',
    target: 'sara',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Connect Ayesha to her children
  edges.push({
    id: 'e-ayesha-mussa',
    source: 'ayesha',
    target: 'mussa',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-ayesha-sara',
    source: 'ayesha',
    target: 'sara',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Naveed (Saima's husband)
  const naveedNode: Node = {
    id: 'naveed',
    type: 'familyMember',
    position: { x: 900, y: 350 },
    data: {
      id: 'naveed',
      name: 'Naveed',
      relationship: 'Spouse',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(naveedNode);
  
  // Connect Saima and Naveed as spouses
  edges.push({
    id: 'e-saima-naveed',
    source: 'saima',
    target: 'naveed',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Laiba (Saima and Naveed's daughter)
  const laibaNode: Node = {
    id: 'laiba',
    type: 'familyMember',
    position: { x: 900, y: 450 },
    data: {
      id: 'laiba',
      name: 'Laiba',
      relationship: 'Child',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(laibaNode);
  
  // Connect Saima and Naveed to Laiba
  edges.push({
    id: 'e-saima-laiba',
    source: 'saima',
    target: 'laiba',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-naveed-laiba',
    source: 'naveed',
    target: 'laiba',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Danish and Zainab as spouses (they're married per requirement 4)
  edges.push({
    id: 'e-danish-zainab',
    source: 'danish',
    target: 'zainab',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Hadi (Child of Danish and Zainab)
  const hadiNode: Node = {
    id: 'hadi',
    type: 'familyMember',
    position: { x: 200, y: 350 },
    data: {
      id: 'hadi',
      name: 'Hadi',
      relationship: 'Child',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(hadiNode);
  
  // Connect Danish and Zainab to Hadi
  edges.push({
    id: 'e-danish-hadi',
    source: 'danish',
    target: 'hadi',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-zainab-hadi',
    source: 'zainab',
    target: 'hadi',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Zoya (Abdullah's wife)
  const zoyaNode: Node = {
    id: 'zoya',
    type: 'familyMember',
    position: { x: 500, y: 350 },
    data: {
      id: 'zoya',
      name: 'Zoya',
      relationship: 'Spouse',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: true
    }
  };
  nodes.push(zoyaNode);
  
  // Connect Abdullah and Zoya as spouses
  edges.push({
    id: 'e-abdullah-zoya',
    source: 'abdullah',
    target: 'zoya',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Add Ayan and Sana (Children of Abdullah and Zoya)
  const ayanNode: Node = {
    id: 'ayan',
    type: 'familyMember',
    position: { x: 450, y: 450 },
    data: {
      id: 'ayan',
      name: 'Ayan',
      relationship: 'Child',
      gender: 'male',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(ayanNode);
  
  const sanaNode: Node = {
    id: 'sana',
    type: 'familyMember',
    position: { x: 550, y: 450 },
    data: {
      id: 'sana',
      name: 'Sana',
      relationship: 'Child',
      gender: 'female',
      onEdit,
      onDelete,
      onToggleChildren,
      hasChildren: false
    }
  };
  nodes.push(sanaNode);
  
  // Connect Abdullah and Zoya to their children
  edges.push({
    id: 'e-abdullah-ayan',
    source: 'abdullah',
    target: 'ayan',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-abdullah-sana',
    source: 'abdullah',
    target: 'sana',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-zoya-ayan',
    source: 'zoya',
    target: 'ayan',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  edges.push({
    id: 'e-zoya-sana',
    source: 'zoya',
    target: 'sana',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2 }
  });
  
  // Connect siblings Danish, Abdullah, Zainab
  edges.push({
    id: 'e-danish-abdullah',
    source: 'danish',
    target: 'abdullah',
    animated: true,
    style: { stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '5,5' }
  });
  
  // Mark cousins connections with dashed lines
  // Mussa and Sara are cousins of Danish, Abdullah, Zainab and Hadi
  // Ayan and Sana are cousins of Mussa, Sara, and Hadi
  // Laiba is cousin to all the above
  
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
