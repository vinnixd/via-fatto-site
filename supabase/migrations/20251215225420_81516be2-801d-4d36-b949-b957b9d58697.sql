-- Create enum for portal integration methods
CREATE TYPE public.portal_method AS ENUM ('feed', 'api', 'manual');

-- Create enum for feed formats
CREATE TYPE public.feed_format AS ENUM ('xml', 'json', 'csv');

-- Create enum for publication status
CREATE TYPE public.publication_status AS ENUM ('pending', 'published', 'error', 'disabled');

-- Create enum for log status
CREATE TYPE public.log_status AS ENUM ('success', 'error');

-- Create portals table
CREATE TABLE public.portais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  metodo portal_method NOT NULL DEFAULT 'feed',
  formato_feed feed_format NOT NULL DEFAULT 'xml',
  token_feed TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portal publications table
CREATE TABLE public.portal_publicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES public.portais(id) ON DELETE CASCADE,
  imovel_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status publication_status NOT NULL DEFAULT 'pending',
  ultima_tentativa TIMESTAMP WITH TIME ZONE,
  mensagem_erro TEXT,
  payload_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(portal_id, imovel_id)
);

-- Create portal logs table
CREATE TABLE public.portal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES public.portais(id) ON DELETE CASCADE,
  status log_status NOT NULL,
  total_itens INTEGER NOT NULL DEFAULT 0,
  tempo_geracao_ms INTEGER,
  detalhes JSONB,
  feed_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_publicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for portais
CREATE POLICY "Admins can manage portais"
ON public.portais
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for portal_publicacoes
CREATE POLICY "Admins can manage portal_publicacoes"
ON public.portal_publicacoes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for portal_logs
CREATE POLICY "Admins can manage portal_logs"
ON public.portal_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_portal_publicacoes_portal ON public.portal_publicacoes(portal_id);
CREATE INDEX idx_portal_publicacoes_imovel ON public.portal_publicacoes(imovel_id);
CREATE INDEX idx_portal_logs_portal ON public.portal_logs(portal_id);
CREATE INDEX idx_portal_logs_created ON public.portal_logs(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_portais_updated_at
BEFORE UPDATE ON public.portais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_publicacoes_updated_at
BEFORE UPDATE ON public.portal_publicacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default portals
INSERT INTO public.portais (slug, nome, config) VALUES
('olx', 'OLX', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 20}'::jsonb),
('dfimoveis', 'DF Imóveis', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 30}'::jsonb),
('62imoveis', '62 Imóveis', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 20}'::jsonb),
('facebook', 'Facebook', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 10}'::jsonb),
('vivareal', 'VivaReal', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 50}'::jsonb),
('zap', 'Zap Imóveis', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 50}'::jsonb),
('imovelweb', 'Imovelweb', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 30}'::jsonb),
('chavemao', 'Chave na Mão', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 20}'::jsonb),
('trovit', 'Trovit', '{"mapeamento": {"titulo": "title", "descricao": "description", "preco": "price"}, "filtros": {"apenas_ativos": true}, "limite_fotos": 15}'::jsonb);