import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Upload, Image, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced form schema with all relevant fields including social media
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  gender: z.enum(['male', 'female', 'other']),
  image: z.string().optional(),
  title: z.string().optional(),
  relationship: z.string().optional(),
  // Add social media fields
  website: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  twitterHandle: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
});

export type EditMemberFormValues = z.infer<typeof formSchema>;

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EditMemberFormValues) => void;
  initialValues: {
    name: string;
    gender?: 'male' | 'female' | 'other';
    image?: string;
    title?: string;
    relationship?: string;
    // Add social media fields to props interface
    website?: string;
    facebookUrl?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
  };
  error?: string;
}

const EditMemberModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  error,
}: EditMemberModalProps) => {
  // Ensure initialValues is not undefined and has default values if needed
  const safeInitialValues = initialValues || { name: '', gender: 'other' as const };
  const [imagePreview, setImagePreview] = useState<string | null>(safeInitialValues.image || null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const { t } = useLanguage();

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: safeInitialValues,
  });

  const handleSubmit = (values: EditMemberFormValues) => {
    onSubmit({ 
      ...values, 
      image: imagePreview || values.image
    });
    form.reset();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageUploadError(t.imageSizeLimit);
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError(t.validFileTypes);
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', '');
  };

  React.useEffect(() => {
    if (open && initialValues) {
      form.reset(initialValues);
      setImagePreview(initialValues.image || null);
      setImageUploadError(null);
    }
  }, [form, initialValues, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editFamilyMember}</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-1">
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
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.relationship_readonly}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.relationship} {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t.profilePicture}</FormLabel>
                <div className="flex flex-col items-center space-y-3">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview} alt="Preview" />
                        <AvatarFallback>
                          {safeInitialValues.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={removeImage}
                        type="button"
                      >
                        <X size={14} className="mr-1" /> {t.removePhoto}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-full h-24 w-24 flex items-center justify-center bg-gray-50">
                        <Image size={32} className="text-gray-400" />
                      </div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="mt-2 flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                          <Upload size={14} className="mr-1" /> {t.uploadPhoto}
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                  
                  {imagePreview && (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-secondary/90">
                        <Upload size={14} className="mr-1" /> {t.changePhoto}
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  
                  {imageUploadError && (
                    <p className="text-red-500 text-sm">{imageUploadError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t.supportedFormats}
                  </p>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.title_optional}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.enterTitle} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Add social media fields */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Social Media Links</h3>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                          value={field.value || ''} 
                        />
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
                        <Input 
                          placeholder="https://facebook.com/username" 
                          {...field} 
                          value={field.value || ''} 
                        />
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
                        <Input 
                          placeholder="@username" 
                          {...field} 
                          value={field.value || ''} 
                        />
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
                        <Input 
                          placeholder="https://linkedin.com/in/username" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit">{t.save}</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberModal;
