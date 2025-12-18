import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, CheckCircle2, XCircle, ExternalLink, BarChart3, Code, Megaphone } from 'lucide-react';

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

// Logo components
const GTMLogo = () => (
  <svg viewBox="0 0 192 192" className="w-full h-full">
    <path fill="#8AB4F8" d="M111.31 176.79L80.76 146.24 146.24 80.76 176.79 111.31z"/>
    <path fill="#4285F4" d="M96 15.2L15.2 96l34.56 34.55 80.79-80.79z"/>
    <path fill="#8AB4F8" d="M176.79 80.69L111.31 15.21 96 30.52l46.08 46.08z"/>
    <path fill="#246FDB" d="M142.08 76.6L96 30.52 49.76 76.76l46.24 46.23z"/>
    <path fill="#FFCE44" d="M49.75 115.25a32.68 32.68 0 1 0 46.22 46.22 32.68 32.68 0 0 0-46.22-46.22z"/>
  </svg>
);

const GALogo = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    <path fill="#F9AB00" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 512 512" className="w-full h-full">
    <defs>
      <linearGradient id="meta-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0064E0"/>
        <stop offset="50%" stopColor="#0064E0"/>
        <stop offset="100%" stopColor="#0095F6"/>
      </linearGradient>
    </defs>
    <path fill="url(#meta-gradient)" d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm117.4 338.8c-5.2 8-14.1 12.7-24.2 12.7-8.2 0-16.3-3.6-25.7-11.5-9.2-7.7-19.2-19.4-29.7-35.4l-4.6-7c-6.8-10.3-13.1-21.5-19-33.6 8.5-20.4 17.3-38.5 26.5-54.1 11.2-19 21.5-32.3 30.4-39.3 6.4-5 12.3-7.5 17.3-7.5 10.1 0 18.9 4.7 24.2 12.7 5.2 8 6.5 18.1 3.6 28.3-2.9 10.5-9.5 21.7-19.7 33.5-4.6 5.3-9.7 10.7-15.5 16.3 5.8 5.6 10.9 11 15.5 16.3 10.2 11.8 16.8 23 19.7 33.5 2.9 10.2 1.6 20.3-3.6 28.3zm-95.3-115.9c-8.5 20.3-17.4 38.4-26.6 54-11.2 19-21.5 32.3-30.4 39.3-6.4 5-12.3 7.5-17.4 7.5-10.1 0-18.9-4.7-24.2-12.7-5.2-8-6.5-18.1-3.6-28.3 2.9-10.5 9.5-21.7 19.7-33.5 4.6-5.3 9.7-10.7 15.5-16.3-5.8-5.6-10.9-11-15.5-16.3-10.2-11.8-16.8-23-19.7-33.5-2.9-10.2-1.6-20.3 3.6-28.3 5.2-8 14.1-12.7 24.2-12.7 5.1 0 11 2.5 17.4 7.5 8.9 7 19.2 20.3 30.4 39.3 9.2 15.5 18 33.6 26.6 54-.1 0-.1 0 0 0z"/>
  </svg>
);

const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('analytics');

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
    if (!value) return true;
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
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Carregando integrações...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!config) return null;

  const integrations = [
    {
      id: 'gtm',
      title: 'Google Tag Manager',
      description: 'Gerencie todas as suas tags de marketing em um só lugar. Adicione scripts, pixels e tags sem precisar editar o código.',
      field: 'gtm_container_id' as keyof IntegrationConfig,
      value: config.gtm_container_id,
      placeholder: 'GTM-XXXXXXX',
      helpText: 'ID do contêiner do GTM (ex: GTM-ABC123D)',
      docsUrl: 'https://tagmanager.google.com/',
      Logo: GTMLogo,
      category: 'analytics',
    },
    {
      id: 'ga',
      title: 'Google Analytics',
      description: 'Analise o tráfego e comportamento dos visitantes do seu site com métricas detalhadas e relatórios em tempo real.',
      field: 'google_analytics_id' as keyof IntegrationConfig,
      value: config.google_analytics_id,
      placeholder: 'G-XXXXXXXXXX',
      helpText: 'ID de medição GA4 (ex: G-ABC123XYZ) ou Universal (UA-XXXXX-X)',
      docsUrl: 'https://analytics.google.com/',
      Logo: GALogo,
      category: 'analytics',
    },
    {
      id: 'fb',
      title: 'Meta Pixel',
      description: 'Acompanhe conversões, crie públicos personalizados e otimize seus anúncios no Facebook e Instagram.',
      field: 'facebook_pixel_id' as keyof IntegrationConfig,
      value: config.facebook_pixel_id,
      placeholder: '1234567890123456',
      helpText: 'ID do Pixel (15-16 dígitos numéricos)',
      docsUrl: 'https://business.facebook.com/events_manager',
      Logo: MetaLogo,
      category: 'marketing',
    },
  ];

  const activeCount = integrations.filter(i => !!i.value && !errors[i.id]).length;

  const tabItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Google Analytics e GTM' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, description: 'Pixels e conversões' },
  ];

  const renderIntegrationCard = (integration: typeof integrations[0]) => {
    const hasValue = !!integration.value;
    const hasError = !!errors[integration.id];
    const isValid = hasValue && !hasError;

    return (
      <Card key={integration.id} className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center p-2.5 shrink-0">
              <integration.Logo />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{integration.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {isValid && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                  {hasError && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inválido
                    </Badge>
                  )}
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Abrir documentação"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <CardDescription className="mt-1">{integration.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label htmlFor={integration.id} className="text-sm font-medium">
              ID da Integração
            </Label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id={integration.id}
                value={integration.value}
                onChange={(e) => handleChange(integration.field, e.target.value)}
                placeholder={integration.placeholder}
                className={`pl-10 font-mono text-sm ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
            </div>
            {hasError ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors[integration.id]}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{integration.helpText}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <AdminHeader title="Integrações" subtitle="Configure as ferramentas de marketing e analytics do seu site" />
      
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Integrações Ativas</p>
                <p className="font-semibold text-lg">{activeCount} de {integrations.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Analytics</p>
                <p className="font-semibold">{config.google_analytics_id ? 'Configurado' : 'Pendente'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marketing</p>
                <p className="font-semibold">{config.facebook_pixel_id ? 'Configurado' : 'Pendente'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="hidden lg:block w-64 space-y-2">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card hover:bg-muted border border-border'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{tab.label}</p>
                  <p className={`text-xs ${activeTab === tab.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}

            <div className="pt-4">
              <Button variant="admin" onClick={handleSave} disabled={saving || Object.keys(errors).length > 0} className="w-full" size="lg">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full h-auto gap-1 bg-muted/50 p-1">
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                    <tab.icon className="h-4 w-4 mr-1" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                {integrations
                  .filter(i => i.category === 'analytics')
                  .map(renderIntegrationCard)}
              </div>
            )}

            {activeTab === 'marketing' && (
              <div className="space-y-6 animate-fade-in">
                {integrations
                  .filter(i => i.category === 'marketing')
                  .map(renderIntegrationCard)}
              </div>
            )}

            {/* Mobile Save Button */}
            <div className="lg:hidden">
              <Button variant="admin" onClick={handleSave} disabled={saving || Object.keys(errors).length > 0} className="w-full" size="lg">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default IntegrationsPage;