import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Home from './Home';
import SEOHead from '@/components/SEOHead';
import { useSiteConfig } from '@/hooks/useSupabaseData';

const Index = () => {
  const { data: siteConfig } = useSiteConfig();
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={siteConfig?.seo_title || 'Via Fatto Imóveis - Imóveis em Brasília DF e Goiás'}
        description={siteConfig?.seo_description || 'Encontre casas, apartamentos e terrenos para compra e aluguel em Brasília DF e Goiás. Imóveis selecionados com as melhores oportunidades.'}
        ogImage={siteConfig?.og_image_url || siteConfig?.hero_background_url || undefined}
        siteConfig={siteConfig}
      />
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
