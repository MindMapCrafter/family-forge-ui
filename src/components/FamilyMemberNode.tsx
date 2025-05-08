
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown, ChevronUp, Globe, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  relations?: {
    parent?: string[];
    child?: string[];
    spouse?: string[];
    sibling?: string[];
    cousin?: string[];
  };
  // Add social media properties
  website?: string;
  facebookUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
}

interface FamilyMemberNodeProps {
  data: FamilyMemberData;
  isConnectable?: boolean;
  id: string;
}

const FamilyMemberNode = ({ data, isConnectable = true, id }: FamilyMemberNodeProps) => {
  // Use language context for translations
  const { t, language } = useLanguage();
  const [childrenCollapsed, setChildrenCollapsed] = React.useState(false);
  const [socialExpanded, setSocialExpanded] = React.useState(false);
  
  // Check if we have any social media links to display
  const hasSocialLinks = data.website || data.facebookUrl || data.twitterHandle || data.linkedinUrl;

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

  // Format the relationship context to ensure it's properly displayed in the current language
  const formatRelationContext = () => {
    // If there's no relationContext, return the basic relationship
    if (!data.relationContext) {
      const relationKey = data.relationship?.toLowerCase().trim() || '';
      return t[relationKey as keyof typeof t] || data.relationship;
    }

    // Special case for Root Member
    if (data.relationContext === 'Root Member') {
      return language === 'en' ? 'Root Member' : 
             language === 'ur' ? 'بنیادی رکن' :
             language === 'pa' ? 'ਮੁੱਢਲਾ ਮੈਂਬਰ' : data.relationContext;
    }

    // For other cases, use the relationContext directly as it's already generated with proper translations
    return data.relationContext;
  };

  // Handle toggle children visibility
  const handleToggleChildren = () => {
    const newCollapsedState = !childrenCollapsed;
    setChildrenCollapsed(newCollapsedState);
    if (data.onToggleChildren) {
      data.onToggleChildren(data.id, newCollapsedState);
    }
  };

  return (
    <div className="min-w-[200px] max-w-[250px]">
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="!bg-gray-400 border-0"
      />
      <Card className={`p-3 border-2 shadow-sm ${getBorderColor()} ${getBackgroundColor()}`}>
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => {
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
                    {formatRelationContext()}
                  </div>
                </div>
              )}
              
              {data.title && (
                <div className="text-sm font-semibold text-primary mt-1">
                  {data.title}
                </div>
              )}
              
              {/* Only show the social links section if any links exist */}
              {hasSocialLinks && (
                <Collapsible 
                  open={socialExpanded} 
                  onOpenChange={setSocialExpanded} 
                  className="w-full mt-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full p-1 h-6 text-xs flex justify-between items-center">
                      <span>Social Links</span>
                      {socialExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center">
                      {data.website && (
                        <a href={data.website} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Globe size={14} />
                            <span className="sr-only">Website</span>
                          </Button>
                        </a>
                      )}
                      {data.facebookUrl && (
                        <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Facebook size={14} />
                            <span className="sr-only">Facebook</span>
                          </Button>
                        </a>
                      )}
                      {data.twitterHandle && (
                        <a href={`https://twitter.com/${data.twitterHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Twitter size={14} />
                            <span className="sr-only">Twitter</span>
                          </Button>
                        </a>
                      )}
                      {data.linkedinUrl && (
                        <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Linkedin size={14} />
                            <span className="sr-only">LinkedIn</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>
          
          {/* Show hide/show toggle button for all nodes, not just those with children */}
          <Toggle 
            className="mt-2 text-xs flex items-center" 
            pressed={childrenCollapsed}
            onPressedChange={handleToggleChildren}
            aria-label={childrenCollapsed ? t.showChildren : t.hideChildren}
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
        </div>
      </Card>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="!bg-gray-400 border-0"
      />
    </div>
  );
};

export default FamilyMemberNode;
