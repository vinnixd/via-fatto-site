-- Add location_type field to properties table
-- Values: 'exact', 'approximate', 'hidden'
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'approximate';

-- Add constraint for valid values
ALTER TABLE public.properties 
ADD CONSTRAINT properties_location_type_check 
CHECK (location_type IN ('exact', 'approximate', 'hidden'));