
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface FamilyMemberData {
  name: string;
  relationship: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface FamilyMemberNodeProps {
  data: FamilyMemberData;
  isConnectable?: boolean;
}

const FamilyMemberNode = ({ data, isConnectable = true }: FamilyMemberNodeProps) => {
  return (
    <div className="min-w-[180px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Card className="p-3 border shadow-sm">
        <div className="font-medium text-center">{data.name}</div>
        <div className="text-xs text-muted-foreground text-center mb-2">{data.relationship}</div>
        <div className="flex justify-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={data.onEdit}
          >
            <Edit size={14} />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={data.onDelete}
          >
            <Trash2 size={14} />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default FamilyMemberNode;
