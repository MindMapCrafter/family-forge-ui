import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Camera } from 'lucide-react';
import { Node } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  relationship: z.string().min(1, { message: 'Relationship is required' }),
  relatedTo: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  image: z.any().optional(),
  title: z.string().optional(),
  website: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterHandle: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  existingNodes: Node[];
  isFirstMember: boolean;
}

const AddMemberModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  existingNodes, 
  isFirstMember 
}: AddMemberModalProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, formatMessage } = useLanguage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      relationship: isFirstMember ? 'root' : '',
      relatedTo: '',
      gender: 'other',
      image: undefined,
      title: '',
      website: '',
      facebookUrl: '',
      twitterHandle: '',
      linkedinUrl: '',
    },
  });

  // Reset form when modal is opened or closed
  React.useEffect(() => {
    if (!open) {
      // Only reset when closing to prevent issues during open
      setTimeout(() => {
        form.reset();
        setPreviewImage(null);
      }, 300); // Small delay to ensure animation completes
    }
  }, [open, form]);

  const handleImageUploadClick = () => {
    // Programmatically click the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file size
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t.imageTooLarge,
        description: t.imageSizeLimit,
        variant: 'destructive',
      });
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: t.invalidFileType,
        description: t.validFileTypes,
        variant: 'destructive',
      });
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      form.setValue('image', result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (values: FormValues) => {
    // Include the image data in the submission
    const submissionValues = {
      ...values,
      image: previewImage,
    };
    
    onSubmit(submissionValues);
    // Form reset is handled by the useEffect when modal closes
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto max-h-[100vh] pb-20">
        <SheetHeader>
          <SheetTitle>{t.addFamilyMember}</SheetTitle>
          <SheetDescription>
            {isFirstMember 
              ? t.addFirstMember
              : t.addNewMember}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {/* Image Upload and Preview */}
            <div className="flex flex-col items-center mb-4">
              <Avatar className="w-24 h-24 mb-2">
                {previewImage ? (
                  <AvatarImage src={previewImage} alt="Preview" />
                ) : (
                  <AvatarFallback>
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImageUploadClick}
                className="gap-2"
              >
                <Upload size={16} />
                {previewImage ? t.changePhoto : t.uploadPhoto}
              </Button>
            </div>
            
            {/* Basic information fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.enterName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.gender}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectGender} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">{t.male}</SelectItem>
                      <SelectItem value="female">{t.female}</SelectItem>
                      <SelectItem value="other">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isFirstMember && (
              <>
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.relationship}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectRelationship} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Basic relationships */}
                          <SelectItem value="parent">{t.parent}</SelectItem>
                          <SelectItem value="child">{t.child}</SelectItem>
                          <SelectItem value="spouse">{t.spouse}</SelectItem>
                          <SelectItem value="sibling">{t.sibling}</SelectItem>
                          
                          {/* Extended family relationships */}
                          <SelectItem value="grandfather">{t.grandfather}</SelectItem>
                          <SelectItem value="grandmother">{t.grandmother}</SelectItem>
                          <SelectItem value="uncle">{t.uncle}</SelectItem>
                          <SelectItem value="aunt">{t.aunt}</SelectItem>
                          <SelectItem value="cousin">{t.cousin}</SelectItem>
                          <SelectItem value="nephew">{t.nephew}</SelectItem>
                          <SelectItem value="niece">{t.niece}</SelectItem>
                          <SelectItem value="grandchild">{t.grandchild}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relatedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.relatedTo}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectExistingMember} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {existingNodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.data.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Social media fields */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Social Media Links (Optional)</h3>
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">{t.cancel}</Button>
              </SheetClose>
              <Button type="submit">{t.add}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddMemberModal;
