-- Update UPDATE policy for properties to include marketing role
DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
CREATE POLICY "Users can update own properties" 
ON public.properties 
FOR UPDATE 
USING (
  (created_by = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'marketing'::app_role)
);

-- Update UPDATE policy for property_images to include marketing role
DROP POLICY IF EXISTS "Users can update property images" ON public.property_images;
CREATE POLICY "Users can update property images" 
ON public.property_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = property_images.property_id 
    AND (
      properties.created_by = auth.uid() 
      OR has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'gestor'::app_role)
      OR has_role(auth.uid(), 'marketing'::app_role)
    )
  )
);