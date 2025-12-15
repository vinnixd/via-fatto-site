import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portalId } = await req.json();

    if (!portalId) {
      return new Response(
        JSON.stringify({ error: 'Missing portalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch portal
    const { data: portal, error: portalError } = await supabase
      .from('portais')
      .select('*')
      .eq('id', portalId)
      .single();

    if (portalError || !portal) {
      return new Response(
        JSON.stringify({ error: 'Portal not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = portal.config || {};
    const filtros = config.filtros || {};
    const warnings: string[] = [];

    // Build query
    let query = supabase
      .from('properties')
      .select(`
        id, title, slug, description, price, status, active, featured,
        address_city, address_state,
        property_images (id)
      `);

    if (filtros.apenas_ativos !== false) {
      query = query.eq('active', true);
    }
    if (filtros.apenas_venda) {
      query = query.eq('status', 'venda');
    }
    if (filtros.apenas_aluguel) {
      query = query.eq('status', 'aluguel');
    }
    if (filtros.apenas_destaques) {
      query = query.eq('featured', true);
    }

    const { data: properties, error: propertiesError } = await query.limit(100);

    if (propertiesError) {
      throw propertiesError;
    }

    let filteredProperties = properties || [];
    const initialCount = filteredProperties.length;

    // Check for issues
    const withoutPrice = filteredProperties.filter((p: any) => !p.price || p.price <= 0);
    const withoutImages = filteredProperties.filter((p: any) => !p.property_images || p.property_images.length === 0);
    const withoutDescription = filteredProperties.filter((p: any) => !p.description);
    const withoutAddress = filteredProperties.filter((p: any) => !p.address_city || !p.address_state);

    if (withoutPrice.length > 0) {
      warnings.push(`${withoutPrice.length} imóveis sem preço`);
    }
    if (withoutImages.length > 0) {
      warnings.push(`${withoutImages.length} imóveis sem fotos`);
    }
    if (withoutDescription.length > 0) {
      warnings.push(`${withoutDescription.length} imóveis sem descrição`);
    }
    if (withoutAddress.length > 0) {
      warnings.push(`${withoutAddress.length} imóveis sem endereço completo`);
    }

    // Apply post-filters
    if (filtros.excluir_sem_fotos) {
      filteredProperties = filteredProperties.filter(
        (p: any) => p.property_images && p.property_images.length > 0
      );
    }

    if (filtros.excluir_sem_endereco) {
      filteredProperties = filteredProperties.filter(
        (p: any) => p.address_city && p.address_state
      );
    }

    const finalCount = filteredProperties.length;
    const excluded = initialCount - finalCount;

    if (excluded > 0) {
      warnings.push(`${excluded} imóveis excluídos pelos filtros`);
    }

    // Get preview of first 3 properties
    const preview = filteredProperties.slice(0, 3).map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      images: p.property_images?.length || 0,
      hasDescription: !!p.description,
      location: `${p.address_city || '?'}, ${p.address_state || '?'}`,
    }));

    const valid = warnings.length === 0 || (warnings.length === 1 && excluded > 0);

    console.log(`Portal test for ${portal.slug}: ${finalCount} properties, ${warnings.length} warnings`);

    return new Response(
      JSON.stringify({
        valid,
        totalItems: finalCount,
        warnings,
        preview,
        config: {
          formato: portal.formato_feed,
          limite_fotos: config.limite_fotos,
          filtros,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Portal test error:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
