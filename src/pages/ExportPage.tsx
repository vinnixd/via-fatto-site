import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, CheckCircle } from 'lucide-react';

const TENANT_ID = 'f136543f-bace-4e46-9908-d7c8e7e0982f';

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function convertToCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => escapeCsvValue(row[col])).join(',')
  );
  return [header, ...rows].join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

interface ExportStatus {
  [key: string]: 'idle' | 'loading' | 'done' | 'error';
}

interface TableConfig {
  name: 'tenants' | 'domains' | 'tenant_users' | 'properties' | 'property_images' | 'categories' | 'site_config' | 'portais' | 'contacts' | 'favorites';
  label: string;
  columns: string[];
  filterColumn?: string;
  filterValue?: string;
}

export default function ExportPage() {
  const [status, setStatus] = useState<ExportStatus>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  const setTableStatus = (table: string, state: 'idle' | 'loading' | 'done' | 'error') => {
    setStatus(prev => ({ ...prev, [table]: state }));
  };

  const tables: TableConfig[] = [
    {
      name: 'tenants',
      label: 'Tenants (Inquilinos)',
      columns: ['id', 'name', 'slug', 'status', 'settings', 'created_at', 'updated_at'],
      filterColumn: 'id',
      filterValue: TENANT_ID
    },
    {
      name: 'domains',
      label: 'Domains (Domínios)',
      columns: ['id', 'tenant_id', 'hostname', 'type', 'is_primary', 'verified', 'verify_token', 'created_at', 'updated_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'tenant_users',
      label: 'Tenant Users (Usuários)',
      columns: ['id', 'tenant_id', 'user_id', 'role', 'created_at', 'updated_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'properties',
      label: 'Properties (Imóveis)',
      columns: [
        'id', 'tenant_id', 'title', 'slug', 'description', 'price', 'type', 'status', 'profile', 
        'condition', 'address_street', 'address_neighborhood', 'address_city', 'address_state', 
        'address_zipcode', 'address_lat', 'address_lng', 'bedrooms', 'suites', 'bathrooms', 
        'garages', 'area', 'built_area', 'featured', 'active', 'financing', 'documentation',
        'condo_fee', 'condo_exempt', 'iptu', 'features', 'amenities', 'reference', 'order_index',
        'integrar_portais', 'location_type', 'category_id', 'created_by', 'seo_title', 
        'seo_description', 'views', 'shares', 'old_url', 'created_at', 'updated_at'
      ],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'property_images',
      label: 'Property Images (Fotos)',
      columns: ['id', 'property_id', 'url', 'alt', 'order_index', 'created_at'],
    },
    {
      name: 'categories',
      label: 'Categories (Categorias)',
      columns: ['id', 'tenant_id', 'name', 'slug', 'description', 'icon', 'created_at', 'updated_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'site_config',
      label: 'Site Config (Configurações)',
      columns: [
        'id', 'tenant_id', 'logo_url', 'primary_color', 'secondary_color', 'accent_color',
        'hero_title', 'hero_subtitle', 'hero_background_url', 'whatsapp', 'phone', 'email',
        'address', 'about_title', 'about_text', 'about_image_url', 'about_image_position',
        'footer_text', 'footer_links', 'social_facebook', 'social_instagram', 'social_youtube',
        'social_linkedin', 'seo_title', 'seo_description', 'seo_keywords', 'og_image_url',
        'favicon_url', 'home_image_url', 'home_image_position', 'logo_horizontal_url',
        'logo_vertical_url', 'logo_symbol_url', 'gtm_container_id', 'facebook_pixel_id',
        'google_analytics_id', 'watermark_enabled', 'watermark_opacity', 'watermark_size',
        'watermark_url', 'template_id', 'created_at', 'updated_at'
      ],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'portais',
      label: 'Portais (Portais)',
      columns: ['id', 'tenant_id', 'nome', 'slug', 'ativo', 'metodo', 'formato_feed', 'token_feed', 'config', 'created_at', 'updated_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'contacts',
      label: 'Contacts (Contatos)',
      columns: ['id', 'tenant_id', 'property_id', 'name', 'email', 'phone', 'message', 'read', 'created_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    },
    {
      name: 'favorites',
      label: 'Favorites (Favoritos)',
      columns: ['id', 'tenant_id', 'property_id', 'user_hash', 'email', 'phone', 'created_at'],
      filterColumn: 'tenant_id',
      filterValue: TENANT_ID
    }
  ];

  const exportPropertyImages = async () => {
    const table = tables.find(t => t.name === 'property_images')!;
    setTableStatus('property_images', 'loading');
    try {
      // First get all property IDs for this tenant
      const { data: propsData } = await supabase
        .from('properties')
        .select('id')
        .eq('tenant_id', TENANT_ID);
      
      const propertyIds = (propsData || []).map(p => p.id);
      
      // Then get all images
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .in('property_id', propertyIds);
      
      if (error) throw error;
      
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'property_images': records.length }));
      
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'property_images_export.csv');
      setTableStatus('property_images', 'done');
    } catch (err) {
      console.error('Error exporting property_images:', err);
      setTableStatus('property_images', 'error');
    }
  };

  const exportTenants = async () => {
    const table = tables.find(t => t.name === 'tenants')!;
    setTableStatus('tenants', 'loading');
    try {
      const { data, error } = await supabase.from('tenants').select('*').eq('id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'tenants': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'tenants_export.csv');
      setTableStatus('tenants', 'done');
    } catch (err) {
      console.error('Error exporting tenants:', err);
      setTableStatus('tenants', 'error');
    }
  };

  const exportDomains = async () => {
    const table = tables.find(t => t.name === 'domains')!;
    setTableStatus('domains', 'loading');
    try {
      const { data, error } = await supabase.from('domains').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'domains': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'domains_export.csv');
      setTableStatus('domains', 'done');
    } catch (err) {
      console.error('Error exporting domains:', err);
      setTableStatus('domains', 'error');
    }
  };

  const exportTenantUsers = async () => {
    const table = tables.find(t => t.name === 'tenant_users')!;
    setTableStatus('tenant_users', 'loading');
    try {
      const { data, error } = await supabase.from('tenant_users').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'tenant_users': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'tenant_users_export.csv');
      setTableStatus('tenant_users', 'done');
    } catch (err) {
      console.error('Error exporting tenant_users:', err);
      setTableStatus('tenant_users', 'error');
    }
  };

  const exportProperties = async () => {
    const table = tables.find(t => t.name === 'properties')!;
    setTableStatus('properties', 'loading');
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'properties': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'properties_export.csv');
      setTableStatus('properties', 'done');
    } catch (err) {
      console.error('Error exporting properties:', err);
      setTableStatus('properties', 'error');
    }
  };

  const exportCategories = async () => {
    const table = tables.find(t => t.name === 'categories')!;
    setTableStatus('categories', 'loading');
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'categories': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'categories_export.csv');
      setTableStatus('categories', 'done');
    } catch (err) {
      console.error('Error exporting categories:', err);
      setTableStatus('categories', 'error');
    }
  };

  const exportSiteConfig = async () => {
    const table = tables.find(t => t.name === 'site_config')!;
    setTableStatus('site_config', 'loading');
    try {
      const { data, error } = await supabase.from('site_config').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'site_config': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'site_config_export.csv');
      setTableStatus('site_config', 'done');
    } catch (err) {
      console.error('Error exporting site_config:', err);
      setTableStatus('site_config', 'error');
    }
  };

  const exportPortais = async () => {
    const table = tables.find(t => t.name === 'portais')!;
    setTableStatus('portais', 'loading');
    try {
      const { data, error } = await supabase.from('portais').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'portais': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'portais_export.csv');
      setTableStatus('portais', 'done');
    } catch (err) {
      console.error('Error exporting portais:', err);
      setTableStatus('portais', 'error');
    }
  };

  const exportContacts = async () => {
    const table = tables.find(t => t.name === 'contacts')!;
    setTableStatus('contacts', 'loading');
    try {
      const { data, error } = await supabase.from('contacts').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'contacts': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'contacts_export.csv');
      setTableStatus('contacts', 'done');
    } catch (err) {
      console.error('Error exporting contacts:', err);
      setTableStatus('contacts', 'error');
    }
  };

  const exportFavorites = async () => {
    const table = tables.find(t => t.name === 'favorites')!;
    setTableStatus('favorites', 'loading');
    try {
      const { data, error } = await supabase.from('favorites').select('*').eq('tenant_id', TENANT_ID);
      if (error) throw error;
      const records = (data || []) as Record<string, unknown>[];
      setCounts(prev => ({ ...prev, 'favorites': records.length }));
      const csv = convertToCSV(records, table.columns);
      downloadCSV(csv, 'favorites_export.csv');
      setTableStatus('favorites', 'done');
    } catch (err) {
      console.error('Error exporting favorites:', err);
      setTableStatus('favorites', 'error');
    }
  };

  const handleExport = async (tableName: string) => {
    switch (tableName) {
      case 'tenants': await exportTenants(); break;
      case 'domains': await exportDomains(); break;
      case 'tenant_users': await exportTenantUsers(); break;
      case 'properties': await exportProperties(); break;
      case 'property_images': await exportPropertyImages(); break;
      case 'categories': await exportCategories(); break;
      case 'site_config': await exportSiteConfig(); break;
      case 'portais': await exportPortais(); break;
      case 'contacts': await exportContacts(); break;
      case 'favorites': await exportFavorites(); break;
    }
  };

  const exportAll = async () => {
    for (const table of tables) {
      await handleExport(table.name);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Exportar Banco de Dados</CardTitle>
            <CardDescription>
              Exporte todas as tabelas do tenant Via Fatto em formato CSV.
              <br />
              <strong>Tenant ID:</strong> {TENANT_ID}
              <br />
              <strong>Supabase Project:</strong> lwxrneoeoqzlekusqgml
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAll} size="lg" className="w-full">
              <Download className="mr-2 h-5 w-5" />
              Exportar Todas as Tabelas
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {tables.map((table) => (
            <Card key={table.name}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-semibold">{table.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {table.columns.length} colunas
                    {counts[table.name] !== undefined && ` • ${counts[table.name]} registros`}
                  </p>
                </div>
                <Button
                  onClick={() => handleExport(table.name)}
                  disabled={status[table.name] === 'loading'}
                  variant={status[table.name] === 'done' ? 'secondary' : 'outline'}
                >
                  {status[table.name] === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status[table.name] === 'done' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {status[table.name] === 'loading' ? 'Exportando...' : 
                     status[table.name] === 'done' ? 'Exportado' : 'Exportar'}
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
