
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

// Enhanced form schema with all relevant fields
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  gender: z.enum(['male', 'female', 'other']),
  image: z.string().optional(),
  title: z.string().optional(),
  relationship: z.string().optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues.image || null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
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
      setImageUploadError("Image size must be less than 2MB");
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError("Only JPG, PNG and WEBP formats are supported");
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
          <DialogTitle>Edit Family Member</DialogTitle>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
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
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <FormLabel>Relationship (Read-only)</FormLabel>
                    <FormControl>
                      <Input placeholder="Relationship" {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex flex-col items-center space-y-3">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview} alt="Preview" />
                        <AvatarFallback>
                          {initialValues.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={removeImage}
                        type="button"
                      >
                        <X size={14} className="mr-1" /> Remove Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-full h-24 w-24 flex items-center justify-center bg-gray-50">
                        <Image size={32} className="text-gray-400" />
                      </div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="mt-2 flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                          <Upload size={14} className="mr-1" /> Upload Photo
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
                        <Upload size={14} className="mr-1" /> Change Photo
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
                    Supported formats: JPG, PNG, WEBP (max 2MB)
                  </p>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title (e.g. Prophet, Hazrat)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberModal;
