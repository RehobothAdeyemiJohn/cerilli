
-- Schema for Supabase project
-- This file defines the schema for the Cirelli Motor Company inventory management system

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY,
  model TEXT NOT NULL,
  trim TEXT,
  fuelType TEXT,
  exteriorColor TEXT,
  accessories TEXT[] DEFAULT '{}',
  price NUMERIC,
  location TEXT NOT NULL,
  imageUrl TEXT,
  status TEXT DEFAULT 'available',
  dateAdded DATE NOT NULL,
  telaio TEXT,
  transmission TEXT,
  reservedBy TEXT,
  reservedAccessories TEXT[] DEFAULT '{}',
  virtualConfig JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dealers table
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID PRIMARY KEY,
  companyName TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  zipCode TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  contactName TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (we'll add specific policies later when implementing authentication)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- Add temporary policies to allow all operations during development
CREATE POLICY "Allow all operations on vehicles during development" 
  ON public.vehicles FOR ALL USING (true);

CREATE POLICY "Allow all operations on dealers during development"
  ON public.dealers FOR ALL USING (true);
