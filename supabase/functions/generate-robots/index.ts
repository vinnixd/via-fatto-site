import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get base URL from request parameter
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('baseUrl');
    
    if (!baseUrl) {
      return new Response('Missing baseUrl parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const sitemapUrl = `${supabaseUrl}/functions/v1/generate-sitemap?baseUrl=${encodeURIComponent(baseUrl)}`;

    const robots = `# Robots.txt - Imobiliária
# Generated dynamically for ${baseUrl}

# Google
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /admin/*

# Bing
User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /admin/*

# Social Media Bots (for link previews)
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# All other bots
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Block admin and auth routes
Disallow: /admin/login
Disallow: /admin/convite/
Disallow: /auth/
Disallow: /painel/
Disallow: /dashboard/

# Allow important pages
Allow: /imoveis
Allow: /imovel/
Allow: /blog
Allow: /blog/
Allow: /sobre
Allow: /contato
Allow: /favoritos

# Sitemap location (dynamic per tenant)
Sitemap: ${sitemapUrl}

# Crawl-delay for politeness
Crawl-delay: 1
`;

    console.log(`Robots.txt generated for ${baseUrl}`);

    return new Response(robots, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: unknown) {
    console.error('Error generating robots.txt:', error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar robots.txt";
    return new Response(errorMessage, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
});
