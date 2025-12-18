import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface IntegrationConfig {
  id: string;
  gtm_container_id: string;
  facebook_pixel_id: string;
  google_analytics_id: string;
}

// Validation patterns
const GTM_PATTERN = /^GTM-[A-Z0-9]{6,8}$/;
const FB_PIXEL_PATTERN = /^[0-9]{15,16}$/;
const GA_PATTERN = /^(G-[A-Z0-9]{10,12}|UA-[0-9]+-[0-9]+)$/;

const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('id, gtm_container_id, facebook_pixel_id, google_analytics_id')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          gtm_container_id: data.gtm_container_id || '',
          facebook_pixel_id: data.facebook_pixel_id || '',
          google_analytics_id: data.google_analytics_id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const validateGTM = (value: string): boolean => {
    if (!value) return true; // Empty is valid
    return GTM_PATTERN.test(value);
  };

  const validateFBPixel = (value: string): boolean => {
    if (!value) return true;
    return FB_PIXEL_PATTERN.test(value);
  };

  const validateGA = (value: string): boolean => {
    if (!value) return true;
    return GA_PATTERN.test(value);
  };

  const handleChange = (field: keyof IntegrationConfig, value: string) => {
    if (!config) return;
    
    const cleanValue = value.trim().toUpperCase();
    setConfig({ ...config, [field]: field === 'facebook_pixel_id' ? value.trim() : cleanValue });

    // Validate on change
    const newErrors = { ...errors };
    
    if (field === 'gtm_container_id') {
      if (cleanValue && !validateGTM(cleanValue)) {
        newErrors.gtm = 'Formato inválido. Ex: GTM-XXXXXXX';
      } else {
        delete newErrors.gtm;
      }
    }
    
    if (field === 'facebook_pixel_id') {
      if (value.trim() && !validateFBPixel(value.trim())) {
        newErrors.fb = 'Formato inválido. Deve ter 15-16 dígitos';
      } else {
        delete newErrors.fb;
      }
    }
    
    if (field === 'google_analytics_id') {
      if (cleanValue && !validateGA(cleanValue)) {
        newErrors.ga = 'Formato inválido. Ex: G-XXXXXXXXXX ou UA-XXXXX-X';
      } else {
        delete newErrors.ga;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSave = async () => {
    if (!config) return;
    
    // Validate all before saving
    const newErrors: Record<string, string> = {};
    
    if (config.gtm_container_id && !validateGTM(config.gtm_container_id)) {
      newErrors.gtm = 'Formato inválido';
    }
    if (config.facebook_pixel_id && !validateFBPixel(config.facebook_pixel_id)) {
      newErrors.fb = 'Formato inválido';
    }
    if (config.google_analytics_id && !validateGA(config.google_analytics_id)) {
      newErrors.ga = 'Formato inválido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Corrija os erros antes de salvar');
      return;
    }
    
    setSaving(true);

    try {
      const { error } = await supabase
        .from('site_config')
        .update({
          gtm_container_id: config.gtm_container_id || '',
          facebook_pixel_id: config.facebook_pixel_id || '',
          google_analytics_id: config.google_analytics_id || '',
        })
        .eq('id', config.id);

      if (error) throw error;

      toast.success('Integrações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!config) return null;

  const integrations = [
    {
      id: 'gtm',
      title: 'Google Tag Manager',
      description: 'Gerencie todas as suas tags de marketing em um só lugar',
      field: 'gtm_container_id' as keyof IntegrationConfig,
      value: config.gtm_container_id,
      placeholder: 'GTM-XXXXXXX',
      helpText: 'ID do contêiner do GTM (ex: GTM-ABC123D)',
      docsUrl: 'https://tagmanager.google.com/',
      color: 'bg-blue-500',
    },
    {
      id: 'fb',
      title: 'Facebook Pixel',
      description: 'Acompanhe conversões e crie públicos para anúncios',
      field: 'facebook_pixel_id' as keyof IntegrationConfig,
      value: config.facebook_pixel_id,
      placeholder: '1234567890123456',
      helpText: 'ID do Pixel (15-16 dígitos)',
      docsUrl: 'https://business.facebook.com/events_manager',
      color: 'bg-blue-600',
    },
    {
      id: 'ga',
      title: 'Google Analytics',
      description: 'Analise o tráfego e comportamento dos visitantes',
      field: 'google_analytics_id' as keyof IntegrationConfig,
      value: config.google_analytics_id,
      placeholder: 'G-XXXXXXXXXX',
      helpText: 'ID de medição GA4 (ex: G-ABC123XYZ) ou Universal (UA-XXXXX-X)',
      docsUrl: 'https://analytics.google.com/',
      color: 'bg-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <AdminHeader title="Integrações" subtitle="Configure as ferramentas de marketing e analytics" />
      
      <div className="p-6">
        <div className="grid gap-6 max-w-3xl">
          {integrations.map((integration) => {
            const hasValue = !!integration.value;
            const hasError = !!errors[integration.id];
            const isValid = hasValue && !hasError;
            
            return (
              <Card key={integration.id} className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">
                          {integration.id.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {integration.title}
                          {isValid && (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          )}
                          {hasError && (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inválido
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <a
                      href={integration.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={integration.id}>ID da Integração</Label>
                    <Input
                      id={integration.id}
                      value={integration.value}
                      onChange={(e) => handleChange(integration.field, e.target.value)}
                      placeholder={integration.placeholder}
                      className={hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {hasError ? (
                      <p className="text-xs text-red-500">{errors[integration.id]}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{integration.helpText}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 max-w-3xl">
          <Button variant="admin" onClick={handleSave} disabled={saving || Object.keys(errors).length > 0}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Integrações
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsPage;