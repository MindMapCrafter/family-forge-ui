
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/LanguageContext';

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
  onToggleChildren?: (id: string, isCollapsed: boolean) => void;
  hasChildren?: boolean;
}

interface FamilyMemberNodeProps {
  data: FamilyMemberData;
  isConnectable?: boolean;
  id: string;
}

const FamilyMemberNode = ({ data, isConnectable = true, id }: FamilyMemberNodeProps) => {
  // Use language context for translations
  const { t } = useLanguage();
  const [childrenCollapsed, setChildrenCollapsed] = React.useState(false);

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
    
    switch (data.gender) {
      case 'male': return t.male;
      case 'female': return t.female;
      default: return t.other;
    }
  };

  // Handle toggle children visibility
  const handleToggleChildren = () => {
    const newCollapsedState = !childrenCollapsed;
    setChildrenCollapsed(newCollapsedState);
    if (data.onToggleChildren) {
      data.onToggleChildren(data.id, newCollapsedState);
    }
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
              <span className="sr-only">{t.edit}</span>
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
              <span className="sr-only">{t.delete}</span>
            </Button>
          </div>
          
          <ScrollArea className="w-full max-h-[140px] px-1">
            {/* Information in strict order: Name, Gender, Relation */}
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">{t.name}:</div>
                <div className="text-sm font-medium">{data.name}</div>
              </div>
              
              {data.gender && (
                <div>
                  <div className="text-xs text-muted-foreground">{t.gender}:</div>
                  <div className="text-sm">{formatGender()}</div>
                </div>
              )}
              
              {(data.relationContext || data.relationship) && (
                <div>
                  <div className="text-xs text-muted-foreground">{t.relationship}:</div>
                  <div className="text-sm text-muted-foreground">
                    {data.relationContext || data.relationship}
                  </div>
                </div>
              )}
              
              {data.title && (
                <div className="text-sm font-semibold text-primary mt-1">
                  {data.title}
                </div>
              )}
            </div>
          </ScrollArea>
          
          {data.hasChildren && (
            <Toggle 
              className="mt-2 text-xs flex items-center" 
              pressed={childrenCollapsed}
              onPressedChange={handleToggleChildren}
            >
              {childrenCollapsed ? (
                <>
                  <ChevronDown size={14} className="mr-1" />
                  {t.showChildren}
                </>
              ) : (
                <>
                  <ChevronUp size={14} className="mr-1" />
                  {t.hideChildren}
                </>
              )}
            </Toggle>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default FamilyMemberNode;
