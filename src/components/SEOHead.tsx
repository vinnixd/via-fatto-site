import { useEffect } from 'react';
import { PropertyFromDB, SiteConfig } from '@/hooks/useSupabaseData';
import {
  generatePropertyTitle,
  generatePropertyDescription,
  generateRealEstateListingSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generatePropertyFAQs,
  generateOpenGraphMeta,
  generateTwitterMeta,
} from '@/lib/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  property?: PropertyFromDB;
  siteConfig?: SiteConfig | null;
  breadcrumbs?: { name: string; url: string }[];
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  property,
  siteConfig,
  breadcrumbs,
  noIndex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentUrl = canonicalUrl || window.location.href;

    // Generate title and description
    let seoTitle = title;
    let seoDescription = description;

    if (property) {
      // Prioritize custom SEO fields if available, otherwise generate
      seoTitle = seoTitle || property.seo_title || generatePropertyTitle(property);
      seoDescription = seoDescription || property.seo_description || generatePropertyDescription(property);
    }

    // Default fallbacks
    seoTitle = seoTitle || siteConfig?.seo_title || 'Via Fatto Imóveis';
    seoDescription = seoDescription || siteConfig?.seo_description || 'Imóveis em Brasília DF e Goiás';

    // Set document title
    document.title = seoTitle;

    // Helper to set/update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to set/update link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic meta tags
    setMetaTag('description', seoDescription);
    if (siteConfig?.seo_keywords) {
      setMetaTag('keywords', siteConfig.seo_keywords);
    }

    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical URL
    setLinkTag('canonical', currentUrl);

    // Open Graph
    const ogImageUrl = ogImage || property?.images?.[0]?.url || siteConfig?.og_image_url || '';
    const ogMeta = generateOpenGraphMeta(seoTitle, seoDescription, currentUrl, ogImageUrl, property ? 'product' : ogType);
    Object.entries(ogMeta).forEach(([key, value]) => {
      if (value) setMetaTag(key, value, true);
    });

    // Twitter Card
    const twitterMeta = generateTwitterMeta(seoTitle, seoDescription, ogImageUrl);
    Object.entries(twitterMeta).forEach(([key, value]) => {
      if (value) setMetaTag(key, value);
    });

    // Structured Data (JSON-LD)
    const removeExistingSchemas = () => {
      document.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach(el => el.remove());
    };

    const addSchema = (schema: object | null, id: string) => {
      if (!schema) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', id);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    removeExistingSchemas();

    // Add LocalBusiness schema (always)
    addSchema(generateLocalBusinessSchema(siteConfig || null, baseUrl), 'local-business');

    // Add property-specific schemas
    if (property) {
      addSchema(generateRealEstateListingSchema(property, siteConfig || null, currentUrl), 'real-estate-listing');
      addSchema(generateProductSchema(property, currentUrl), 'product');
      
      // Add FAQ schema
      const faqs = generatePropertyFAQs(property);
      if (faqs.length > 0) {
        addSchema(generateFAQSchema(faqs), 'faq');
      }
    }

    // Add breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      addSchema(generateBreadcrumbSchema(breadcrumbs), 'breadcrumb');
    }

    // Cleanup on unmount
    return () => {
      removeExistingSchemas();
    };
  }, [title, description, canonicalUrl, ogImage, ogType, property, siteConfig, breadcrumbs, noIndex]);

  return null;
}

export default SEOHead;
