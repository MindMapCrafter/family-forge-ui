
import React from 'react';
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
import { Node } from 'reactflow';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  relationship: z.string().min(1, { message: 'Relationship is required' }),
  relatedTo: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  image: z.string().optional(),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      relationship: isFirstMember ? 'root' : '',
      relatedTo: '',
      gender: 'other',
      image: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Family Member</SheetTitle>
          <SheetDescription>
            {isFirstMember 
              ? 'Add the first member to start your family tree.' 
              : 'Add a new member and define their relationship.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
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
                      <FormLabel>Relationship</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Basic relationships */}
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          
                          {/* Extended family relationships */}
                          <SelectItem value="grandfather">Grandfather</SelectItem>
                          <SelectItem value="grandmother">Grandmother</SelectItem>
                          <SelectItem value="uncle">Uncle</SelectItem>
                          <SelectItem value="aunt">Aunt</SelectItem>
                          <SelectItem value="cousin">Cousin</SelectItem>
                          <SelectItem value="nephew">Nephew</SelectItem>
                          <SelectItem value="niece">Niece</SelectItem>
                          <SelectItem value="grandchild">Grandchild</SelectItem>
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
                      <FormLabel>Related to</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select existing member" />
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
            
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </SheetClose>
              <Button type="submit">Add Member</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddMemberModal;
