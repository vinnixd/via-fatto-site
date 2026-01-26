-- ============================================
-- Via Fatto - Database Schema Export
-- Supabase Project: lwxrneoeoqzlekusqgml
-- Tenant ID: f136543f-bace-4e46-9908-d7c8e7e0982f
-- Generated: 2026-01-26
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'corretor', 'gestor', 'marketing');

CREATE TYPE public.documentation_status AS ENUM ('regular', 'irregular', 'pendente');

CREATE TYPE public.feed_format AS ENUM ('xml', 'json', 'csv');

CREATE TYPE public.log_status AS ENUM ('success', 'error');

CREATE TYPE public.portal_method AS ENUM ('feed', 'api', 'manual');

CREATE TYPE public.property_condition AS ENUM ('lancamento', 'novo', 'usado', 'pronto_para_morar');

CREATE TYPE public.property_profile AS ENUM ('residencial', 'comercial', 'industrial', 'misto');

CREATE TYPE public.property_status AS ENUM ('venda', 'aluguel', 'vendido', 'alugado');

CREATE TYPE public.property_type AS ENUM ('casa', 'apartamento', 'terreno', 'comercial', 'rural', 'cobertura', 'flat', 'galpao', 'loft');

CREATE TYPE public.publication_status AS ENUM ('pending', 'published', 'error', 'disabled');

-- ============================================
-- TABLES
-- ============================================

-- Table: tenants
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: domains
CREATE TABLE public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  hostname text NOT NULL UNIQUE,
  type text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  verify_token text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: tenant_users
CREATE TABLE public.tenant_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'agent'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Table: profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text,
  phone text DEFAULT ''::text,
  creci text DEFAULT ''::text,
  avatar_url text DEFAULT ''::text,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user'::app_role,
  UNIQUE(user_id, role)
);

-- Table: categories
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT ''::text,
  icon text DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: properties
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  category_id uuid REFERENCES public.categories(id),
  created_by uuid,
  title text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT ''::text,
  price numeric NOT NULL DEFAULT 0,
  type public.property_type NOT NULL DEFAULT 'casa'::property_type,
  status public.property_status NOT NULL DEFAULT 'venda'::property_status,
  profile public.property_profile NOT NULL DEFAULT 'residencial'::property_profile,
  condition public.property_condition,
  address_street text DEFAULT ''::text,
  address_neighborhood text DEFAULT ''::text,
  address_city text NOT NULL DEFAULT ''::text,
  address_state text NOT NULL DEFAULT ''::text,
  address_zipcode text DEFAULT ''::text,
  address_lat numeric,
  address_lng numeric,
  location_type text NOT NULL DEFAULT 'approximate'::text,
  bedrooms integer NOT NULL DEFAULT 0,
  suites integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  garages integer NOT NULL DEFAULT 0,
  area numeric NOT NULL DEFAULT 0,
  built_area numeric,
  condo_fee numeric DEFAULT 0,
  condo_exempt boolean DEFAULT false,
  iptu numeric DEFAULT 0,
  financing boolean NOT NULL DEFAULT false,
  documentation public.documentation_status NOT NULL DEFAULT 'regular'::documentation_status,
  features text[] DEFAULT '{}'::text[],
  amenities text[] DEFAULT '{}'::text[],
  reference text DEFAULT ''::text,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  integrar_portais boolean NOT NULL DEFAULT false,
  order_index integer DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  old_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: property_images
CREATE TABLE public.property_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text DEFAULT ''::text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: contacts
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  property_id uuid REFERENCES public.properties(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT ''::text,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: favorites
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_hash text NOT NULL,
  email text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: site_config
CREATE TABLE public.site_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  logo_url text DEFAULT ''::text,
  logo_horizontal_url text,
  logo_vertical_url text,
  logo_symbol_url text,
  primary_color text DEFAULT '#0ea5e9'::text,
  secondary_color text DEFAULT '#f97316'::text,
  accent_color text DEFAULT '#10b981'::text,
  hero_title text DEFAULT 'Encontre seu imóvel dos sonhos'::text,
  hero_subtitle text DEFAULT 'A melhor seleção de imóveis da região'::text,
  hero_background_url text DEFAULT ''::text,
  home_image_url text,
  home_image_position text DEFAULT '50% 50%'::text,
  whatsapp text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  email text DEFAULT ''::text,
  address text DEFAULT ''::text,
  about_title text DEFAULT 'Sobre Nós'::text,
  about_text text DEFAULT ''::text,
  about_image_url text DEFAULT ''::text,
  about_image_position text DEFAULT 'center'::text,
  footer_text text DEFAULT ''::text,
  footer_links jsonb DEFAULT '[]'::jsonb,
  social_facebook text DEFAULT ''::text,
  social_instagram text DEFAULT ''::text,
  social_youtube text DEFAULT ''::text,
  social_linkedin text DEFAULT ''::text,
  seo_title text DEFAULT ''::text,
  seo_description text DEFAULT ''::text,
  seo_keywords text DEFAULT ''::text,
  og_image_url text DEFAULT ''::text,
  favicon_url text,
  gtm_container_id text DEFAULT ''::text,
  facebook_pixel_id text DEFAULT ''::text,
  google_analytics_id text DEFAULT ''::text,
  watermark_enabled boolean DEFAULT false,
  watermark_url text,
  watermark_opacity numeric DEFAULT 40,
  watermark_size numeric DEFAULT 50,
  template_id text DEFAULT 'default'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: portais
CREATE TABLE public.portais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id),
  nome text NOT NULL,
  slug text NOT NULL,
  ativo boolean NOT NULL DEFAULT false,
  metodo public.portal_method NOT NULL DEFAULT 'feed'::portal_method,
  formato_feed public.feed_format NOT NULL DEFAULT 'xml'::feed_format,
  token_feed text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'::text),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: portal_logs
CREATE TABLE public.portal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_id uuid NOT NULL REFERENCES public.portais(id) ON DELETE CASCADE,
  status public.log_status NOT NULL,
  total_itens integer NOT NULL DEFAULT 0,
  tempo_geracao_ms integer,
  feed_url text,
  detalhes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: portal_publicacoes
CREATE TABLE public.portal_publicacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_id uuid NOT NULL REFERENCES public.portais(id) ON DELETE CASCADE,
  imovel_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status public.publication_status NOT NULL DEFAULT 'pending'::publication_status,
  external_id text,
  mensagem_erro text,
  payload_snapshot jsonb,
  ultima_tentativa timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: portal_jobs
CREATE TABLE public.portal_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_id uuid NOT NULL REFERENCES public.portais(id) ON DELETE CASCADE,
  imovel_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'queued'::text,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  last_error text,
  next_run_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: page_views
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  page_type text NOT NULL,
  page_slug text,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  view_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(page_type, page_slug, view_date)
);

-- Table: invites
CREATE TABLE public.invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  role public.app_role NOT NULL DEFAULT 'corretor'::app_role,
  token text NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'::text) UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  used_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: subscription_plans
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  monthly_price numeric NOT NULL DEFAULT 0,
  annual_price numeric NOT NULL DEFAULT 0,
  max_users integer NOT NULL DEFAULT 1,
  max_properties integer NOT NULL DEFAULT 100,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: subscriptions
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active'::text,
  billing_cycle text NOT NULL DEFAULT 'monthly'::text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  fiscal_name text,
  fiscal_document text,
  fiscal_cep text,
  fiscal_state text,
  fiscal_city text,
  fiscal_neighborhood text,
  fiscal_street text,
  fiscal_number text,
  fiscal_complement text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: invoices
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES public.subscriptions(id),
  invoice_number text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text,
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  payment_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: import_jobs
CREATE TABLE public.import_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  status text NOT NULL DEFAULT 'processing'::text,
  total_items integer NOT NULL DEFAULT 0,
  processed_items integer NOT NULL DEFAULT 0,
  created_items integer NOT NULL DEFAULT 0,
  updated_items integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Table: role_permissions
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.app_role NOT NULL,
  page_key text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, page_key)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_properties_tenant_id ON public.properties(tenant_id);
CREATE INDEX idx_properties_slug ON public.properties(slug);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_featured ON public.properties(featured);
CREATE INDEX idx_properties_active ON public.properties(active);
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX idx_domains_hostname ON public.domains(hostname);
CREATE INDEX idx_domains_tenant_id ON public.domains(tenant_id);
CREATE INDEX idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX idx_favorites_tenant_id ON public.favorites(tenant_id);
CREATE INDEX idx_favorites_user_hash ON public.favorites(user_hash);
CREATE INDEX idx_site_config_tenant_id ON public.site_config(tenant_id);
CREATE INDEX idx_portais_tenant_id ON public.portais(tenant_id);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_owner(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND role = 'owner'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_role(p_tenant_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.tenant_users
  WHERE tenant_id = p_tenant_id
    AND user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.track_page_view(p_page_type text, p_page_slug text DEFAULT NULL, p_property_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.page_views (page_type, page_slug, property_id, view_date, view_count)
  VALUES (p_page_type, p_page_slug, p_property_id, CURRENT_DATE, 1)
  ON CONFLICT (page_type, page_slug, view_date)
  DO UPDATE SET 
    view_count = page_views.view_count + 1,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_role app_role;
BEGIN
  SELECT role INTO invite_role 
  FROM public.invites 
  WHERE email = NEW.email 
    AND used_at IS NULL 
    AND expires_at > now()
  LIMIT 1;
  
  INSERT INTO public.profiles (id, name, email, creci, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'creci', ''),
    'active'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(invite_role, 'user'));
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_invite(invite_token text)
RETURNS TABLE(id uuid, email text, name text, role app_role, is_valid boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inv RECORD;
BEGIN
  SELECT * INTO inv FROM public.invites WHERE token = invite_token;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::uuid, NULL::text, NULL::text, NULL::app_role, 
      false, 'Convite não encontrado';
    RETURN;
  END IF;
  
  IF inv.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      inv.id, inv.email, inv.name, inv.role,
      false, 'Este convite já foi utilizado';
    RETURN;
  END IF;
  
  IF inv.expires_at < now() THEN
    RETURN QUERY SELECT 
      inv.id, inv.email, inv.name, inv.role,
      false, 'Este convite expirou';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    inv.id, inv.email, inv.name, inv.role,
    true, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.use_invite(invite_token text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.invites 
  SET used_at = now()
  WHERE token = invite_token 
    AND used_at IS NULL 
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_publicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Members can view their tenants" ON public.tenants FOR SELECT USING (is_tenant_member(id));
CREATE POLICY "Owners can update tenants" ON public.tenants FOR UPDATE USING (is_tenant_owner(id));

-- Domains policies
CREATE POLICY "Anyone can read verified domains" ON public.domains FOR SELECT USING (verified = true);
CREATE POLICY "Members can view tenant domains" ON public.domains FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "Admins can add domains" ON public.domains FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));
CREATE POLICY "Admins can update domains" ON public.domains FOR UPDATE USING (is_tenant_admin(tenant_id));
CREATE POLICY "Admins can delete domains" ON public.domains FOR DELETE USING (is_tenant_admin(tenant_id));

-- Tenant users policies
CREATE POLICY "Members can view tenant users" ON public.tenant_users FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "Admins can add tenant users" ON public.tenant_users FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));
CREATE POLICY "Admins can update tenant users" ON public.tenant_users FOR UPDATE USING (is_tenant_admin(tenant_id));
CREATE POLICY "Admins can delete tenant users" ON public.tenant_users FOR DELETE USING (is_tenant_admin(tenant_id));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Categories policies
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Properties policies
CREATE POLICY "Properties are publicly readable" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING ((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING ((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));
CREATE POLICY "Admins can manage properties" ON public.properties FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Property images policies
CREATE POLICY "Property images are publicly readable" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert property images" ON public.property_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update property images" ON public.property_images FOR UPDATE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND ((properties.created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'marketing'::app_role))));
CREATE POLICY "Users can delete property images" ON public.property_images FOR DELETE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND ((properties.created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'marketing'::app_role))));
CREATE POLICY "Admins can manage property images" ON public.property_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Contacts policies
CREATE POLICY "Anyone can submit contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contacts" ON public.contacts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Favorites policies
CREATE POLICY "Anyone can add favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own favorites by hash" ON public.favorites FOR SELECT USING ((user_hash = COALESCE(NULLIF(((current_setting('request.headers'::text, true))::json ->> 'x-user-hash'::text), ''::text), ''::text)) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Marketing can delete favorites" ON public.favorites FOR DELETE USING (has_role(auth.uid(), 'marketing'::app_role));
CREATE POLICY "Admins can manage favorites" ON public.favorites FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Site config policies
CREATE POLICY "Public can read site config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Tenant admins can manage site config" ON public.site_config FOR ALL USING ((is_tenant_admin(tenant_id) OR has_role(auth.uid(), 'admin'::app_role))) WITH CHECK ((is_tenant_admin(tenant_id) OR has_role(auth.uid(), 'admin'::app_role)));

-- Portais policies
CREATE POLICY "Authenticated users can view portais" ON public.portais FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage portais" ON public.portais FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Portal logs policies
CREATE POLICY "Admins can manage portal_logs" ON public.portal_logs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Portal publicacoes policies
CREATE POLICY "Admins can manage portal_publicacoes" ON public.portal_publicacoes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Portal jobs policies
CREATE POLICY "Admins can manage portal_jobs" ON public.portal_jobs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Page views policies
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update page views" ON public.page_views FOR UPDATE USING (true);
CREATE POLICY "Public can read page views" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Invites policies
CREATE POLICY "Admins can manage invites" ON public.invites FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscription plans policies
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscriptions policies
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Invoices policies
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Import jobs policies
CREATE POLICY "Admins can insert import jobs" ON public.import_jobs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all import jobs" ON public.import_jobs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can update import jobs" ON public.import_jobs FOR UPDATE USING (true);

-- Role permissions policies
CREATE POLICY "Authenticated users can view role_permissions" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON public.tenant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portais_updated_at BEFORE UPDATE ON public.portais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_publicacoes_updated_at BEFORE UPDATE ON public.portal_publicacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_jobs_updated_at BEFORE UPDATE ON public.portal_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Note: Storage buckets are managed via Supabase dashboard
-- Bucket: property-images (public)
-- Bucket: site-assets (public)

-- ============================================
-- END OF SCHEMA
-- ============================================
