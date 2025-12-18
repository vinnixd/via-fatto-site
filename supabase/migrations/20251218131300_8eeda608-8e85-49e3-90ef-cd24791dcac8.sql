-- Add policy to allow authenticated users to create properties
CREATE POLICY "Authenticated users can create properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policy to allow users to update their own properties
CREATE POLICY "Users can update own properties" 
ON public.properties 
FOR UPDATE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));