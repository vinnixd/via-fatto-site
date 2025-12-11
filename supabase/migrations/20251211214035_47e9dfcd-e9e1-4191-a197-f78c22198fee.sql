-- Criar enum para tipos de imóvel
CREATE TYPE public.property_type AS ENUM ('casa', 'apartamento', 'terreno', 'comercial', 'rural', 'cobertura', 'flat', 'galpao');

-- Criar enum para status do imóvel
CREATE TYPE public.property_status AS ENUM ('venda', 'aluguel', 'vendido', 'alugado');

-- Criar enum para perfil do imóvel
CREATE TYPE public.property_profile AS ENUM ('residencial', 'comercial', 'industrial', 'misto');

-- Criar enum para documentação
CREATE TYPE public.documentation_status AS ENUM ('regular', 'irregular', 'pendente');

-- Criar enum para roles do usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  creci TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de categorias de imóveis
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela principal de imóveis
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  type property_type NOT NULL DEFAULT 'casa',
  status property_status NOT NULL DEFAULT 'venda',
  profile property_profile NOT NULL DEFAULT 'residencial',
  
  -- Localização
  address_street TEXT DEFAULT '',
  address_neighborhood TEXT DEFAULT '',
  address_city TEXT NOT NULL DEFAULT '',
  address_state TEXT NOT NULL DEFAULT '',
  address_zipcode TEXT DEFAULT '',
  address_lat DECIMAL(10,8) DEFAULT NULL,
  address_lng DECIMAL(11,8) DEFAULT NULL,
  
  -- Características
  bedrooms INTEGER NOT NULL DEFAULT 0,
  suites INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  garages INTEGER NOT NULL DEFAULT 0,
  area DECIMAL(10,2) NOT NULL DEFAULT 0,
  built_area DECIMAL(10,2) DEFAULT NULL,
  
  -- Arrays de características
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  
  -- Financeiro e documentação
  financing BOOLEAN NOT NULL DEFAULT false,
  documentation documentation_status NOT NULL DEFAULT 'regular',
  
  -- Controle
  featured BOOLEAN NOT NULL DEFAULT false,
  reference TEXT DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de imagens dos imóveis
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configurações do site
CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branding
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#f97316',
  accent_color TEXT DEFAULT '#10b981',
  
  -- Hero
  hero_title TEXT DEFAULT 'Encontre seu imóvel dos sonhos',
  hero_subtitle TEXT DEFAULT 'A melhor seleção de imóveis da região',
  hero_background_url TEXT DEFAULT '',
  
  -- Contato
  whatsapp TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  
  -- Sobre
  about_title TEXT DEFAULT 'Sobre Nós',
  about_text TEXT DEFAULT '',
  about_image_url TEXT DEFAULT '',
  
  -- Footer
  footer_text TEXT DEFAULT '',
  footer_links JSONB DEFAULT '[]',
  
  -- Redes sociais
  social_facebook TEXT DEFAULT '',
  social_instagram TEXT DEFAULT '',
  social_youtube TEXT DEFAULT '',
  social_linkedin TEXT DEFAULT '',
  
  -- SEO
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT DEFAULT '',
  og_image_url TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de favoritos
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_hash TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_hash)
);

-- Tabela de contatos/mensagens
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  message TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Função para verificar role do usuário (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email
  );
  
  -- Adicionar role padrão de user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil ao registrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: usuários podem ver e editar seu próprio perfil, admins podem ver todos
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Roles: apenas admins podem gerenciar
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Categories: públicas para leitura, admins podem gerenciar
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Properties: públicas para leitura, admins podem gerenciar
CREATE POLICY "Properties are publicly readable" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage properties" ON public.properties
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Property Images: públicas para leitura, admins podem gerenciar
CREATE POLICY "Property images are publicly readable" ON public.property_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage property images" ON public.property_images
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Site Config: pública para leitura, admins podem editar
CREATE POLICY "Site config is publicly readable" ON public.site_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site config" ON public.site_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Favorites: públicas para inserção/leitura
CREATE POLICY "Anyone can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view favorites by hash" ON public.favorites
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage favorites" ON public.favorites
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Contacts: públicos para inserção, admins podem ver
CREATE POLICY "Anyone can submit contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contacts" ON public.contacts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Inserir configuração inicial do site
INSERT INTO public.site_config (
  hero_title,
  hero_subtitle,
  whatsapp,
  phone,
  email,
  address,
  about_title,
  about_text
) VALUES (
  'Encontre seu imóvel dos sonhos',
  'A melhor seleção de imóveis da região com Via Fatto Imóveis',
  '(11) 99999-9999',
  '(11) 3333-4444',
  'contato@viafatto.com.br',
  'Av. Paulista, 1000 - São Paulo/SP',
  'Sobre a Via Fatto Imóveis',
  'Somos uma imobiliária dedicada a encontrar o imóvel perfeito para você.'
);

-- Inserir categorias padrão
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Casas', 'casas', 'Home'),
  ('Apartamentos', 'apartamentos', 'Building2'),
  ('Terrenos', 'terrenos', 'Map'),
  ('Comercial', 'comercial', 'Store'),
  ('Rural', 'rural', 'TreePine');

-- Criar bucket para armazenamento de imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Políticas de storage
CREATE POLICY "Property images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update property images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Site assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');