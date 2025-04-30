
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FamilyMemberData {
  name: string;
  relationship: string;
  gender?: 'male' | 'female' | 'other';
  image?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface FamilyMemberNodeProps {
  data: FamilyMemberData;
  isConnectable?: boolean;
}

const FamilyMemberNode = ({ data, isConnectable = true }: FamilyMemberNodeProps) => {
  // Determine background color based on gender
  const getBorderColor = () => {
    switch (data.gender) {
      case 'male': return 'border-blue-200';
      case 'female': return 'border-pink-200';
      default: return '';
    }
  };

  // Get background color for the node
  const getBackgroundColor = () => {
    switch (data.gender) {
      case 'male': return 'bg-gradient-to-b from-blue-50 to-white';
      case 'female': return 'bg-gradient-to-b from-pink-50 to-white';
      default: return '';
    }
  };

  // Get avatar fallback based on name
  const getNameInitials = () => {
    return data.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-w-[180px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Card className={`p-3 border-2 shadow-sm ${getBorderColor()} ${getBackgroundColor()}`}>
        <div className="flex flex-col items-center">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage src={data.image} alt={data.name} />
            <AvatarFallback>{getNameInitials()}</AvatarFallback>
          </Avatar>
          <div className="font-medium text-center">{data.name}</div>
          <div className="text-xs text-muted-foreground text-center">{data.relationship}</div>
          {data.gender && (
            <div className="text-xs text-muted-foreground text-center mb-2">
              {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
            </div>
          )}
          <div className="flex justify-center gap-2 mt-1">
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
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default FamilyMemberNode;
