-- Allow authenticated users to insert property images
CREATE POLICY "Authenticated users can insert property images"
ON public.property_images
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own property images (property they created)
CREATE POLICY "Users can update property images"
ON public.property_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_images.property_id 
    AND (properties.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
  )
);

-- Allow users to delete their own property images
CREATE POLICY "Users can delete property images"
ON public.property_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_images.property_id 
    AND (properties.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
  )
);