
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FamilyMemberData {
  name: string;
  relationship: string;
  gender?: 'male' | 'female' | 'other';
  image?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  id: string;
  title?: string;
  relationContext?: string; // Property to store contextual relationship information
}

interface FamilyMemberNodeProps {
  data: FamilyMemberData;
  isConnectable?: boolean;
  id: string;
}

const FamilyMemberNode = ({ data, isConnectable = true, id }: FamilyMemberNodeProps) => {
  // Determine border color based on gender
  const getBorderColor = () => {
    switch (data.gender) {
      case 'male': return 'border-blue-300';
      case 'female': return 'border-pink-300';
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

  // Format gender to display properly
  const formatGender = () => {
    if (!data.gender) return null;
    return data.gender.charAt(0).toUpperCase() + data.gender.slice(1);
  };

  // For debugging
  console.log('Node render:', { id, dataId: data.id, data });

  return (
    <div className="min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Card className={`p-3 border-2 shadow-sm ${getBorderColor()} ${getBackgroundColor()}`}>
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => {
                console.log('Edit button clicked with id:', data.id);
                data.onEdit && data.onEdit(data.id);
              }}
            >
              <Edit size={14} />
              <span className="sr-only">Edit</span>
            </Button>
            <Avatar className="h-14 w-14">
              <AvatarImage src={data.image} alt={data.name} />
              <AvatarFallback>{getNameInitials()}</AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => {
                console.log('Delete button clicked with id:', data.id);
                data.onDelete && data.onDelete(data.id);
              }}
            >
              <Trash2 size={14} />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
          
          <ScrollArea className="w-full max-h-[120px] px-1">
            <div className="text-sm mb-1 font-medium">
              {data.name}
            </div>
            
            {formatGender() && (
              <div className="text-sm mb-1 text-muted-foreground">
                {formatGender()}
              </div>
            )}
            
            {data.relationContext ? (
              <div className="text-sm mt-2 text-center border-t pt-1 text-muted-foreground">
                {data.relationContext}
              </div>
            ) : data.relationship && (
              <div className="text-sm mt-2 text-center border-t pt-1 text-muted-foreground">
                {data.relationship}
              </div>
            )}
            
            {data.title && (
              <div className="text-sm font-semibold text-primary mt-1">
                {data.title}
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default FamilyMemberNode;
