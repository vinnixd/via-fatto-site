import { PropertyFromDB, SiteConfig } from '@/hooks/useSupabaseData';

// Property type translations
const propertyTypeLabels: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Imóvel Comercial',
  rural: 'Imóvel Rural',
  cobertura: 'Cobertura',
  flat: 'Flat',
  galpao: 'Galpão',
};

const statusLabels: Record<string, string> = {
  venda: 'à Venda',
  aluguel: 'para Alugar',
  vendido: 'Vendido',
  alugado: 'Alugado',
};

// Generate SEO-optimized title for property (max 60 chars)
export function generatePropertyTitle(property: PropertyFromDB): string {
  const type = propertyTypeLabels[property.type] || property.type;
  const status = statusLabels[property.status] || property.status;
  const city = property.address_city;
  const state = property.address_state;
  
  // Build features string
  const features: string[] = [];
  if (property.bedrooms > 0) {
    features.push(`${property.bedrooms} Quarto${property.bedrooms > 1 ? 's' : ''}`);
  }
  if (property.area > 0) {
    features.push(`${property.area}m²`);
  }
  
  // Try full title first
  let title = `${type} ${status} em ${city} ${state}`;
  if (features.length > 0) {
    title += ` | ${features.join(', ')}`;
  }
  
  // Truncate if needed
  if (title.length > 60) {
    title = `${type} ${status} em ${city} ${state}`;
    if (title.length > 60) {
      title = `${type} ${status} em ${city}`;
    }
  }
  
  return title.substring(0, 60);
}

// Generate SEO-optimized meta description for property (max 155 chars)
export function generatePropertyDescription(property: PropertyFromDB): string {
  const type = propertyTypeLabels[property.type] || property.type;
  const status = statusLabels[property.status] || property.status;
  const neighborhood = property.address_neighborhood || '';
  const city = property.address_city;
  
  const features: string[] = [];
  if (property.bedrooms > 0) {
    features.push(`${property.bedrooms} quarto${property.bedrooms > 1 ? 's' : ''}`);
  }
  if (property.suites > 0) {
    features.push(`${property.suites} suíte${property.suites > 1 ? 's' : ''}`);
  }
  if (property.bathrooms > 0) {
    features.push(`${property.bathrooms} banheiro${property.bathrooms > 1 ? 's' : ''}`);
  }
  if (property.garages > 0) {
    features.push(`${property.garages} vaga${property.garages > 1 ? 's' : ''}`);
  }
  
  let description = `${type} ${status}`;
  if (neighborhood) {
    description += ` no ${neighborhood}`;
  }
  description += ` em ${city}`;
  
  if (features.length > 0) {
    description += ` com ${features.join(', ')}`;
  }
  
  const price = property.price && property.price > 0
    ? `. ${formatPriceCompact(property.price)}`
    : '';
  
  description += `${price}. Agende uma visita!`;
  
  return description.substring(0, 155);
}

// Generate SEO-friendly URL slug
export function generatePropertySlug(property: {
  type: string;
  status: string;
  address_city: string;
  address_state: string;
  bedrooms?: number;
  reference?: string | null;
}): string {
  const type = property.type;
  const status = property.status === 'venda' ? 'a-venda' : 
                 property.status === 'aluguel' ? 'para-alugar' : property.status;
  const city = normalizeSlug(property.address_city);
  const state = property.address_state.toLowerCase();
  
  let slug = `${type}-${status}-${city}-${state}`;
  
  if (property.bedrooms && property.bedrooms > 0) {
    slug += `-${property.bedrooms}-quartos`;
  }
  
  if (property.reference) {
    slug += `-${property.reference}`;
  } else {
    // Add timestamp to make unique
    slug += `-${Date.now().toString(36)}`;
  }
  
  return slug.toLowerCase();
}

// Generate location page title
export function generateLocationTitle(
  city: string,
  state: string,
  neighborhood?: string,
  type?: string,
  status?: string
): string {
  const typeLabel = type ? propertyTypeLabels[type] + 's' : 'Imóveis';
  const statusLabel = status ? statusLabels[status] : '';
  
  let title = typeLabel;
  if (statusLabel) {
    title += ` ${statusLabel}`;
  }
  
  if (neighborhood) {
    title += ` no ${neighborhood}`;
  }
  title += ` em ${city} ${state}`;
  
  return title.substring(0, 60);
}

// Generate location page description
export function generateLocationDescription(
  city: string,
  state: string,
  count: number,
  neighborhood?: string,
  type?: string,
  status?: string
): string {
  const typeLabel = type ? propertyTypeLabels[type]?.toLowerCase() + 's' : 'imóveis';
  const statusLabel = status ? statusLabels[status]?.toLowerCase() : '';
  
  let description = `Encontre ${count} ${typeLabel}`;
  if (statusLabel) {
    description += ` ${statusLabel}`;
  }
  
  if (neighborhood) {
    description += ` no bairro ${neighborhood}`;
  }
  description += ` em ${city}, ${state}. Veja fotos, preços e agende sua visita.`;
  
  return description.substring(0, 155);
}

// Structured Data generators
export function generateRealEstateListingSchema(
  property: PropertyFromDB,
  siteConfig: SiteConfig | null,
  url: string
) {
  const type = propertyTypeLabels[property.type] || property.type;
  const images = property.images?.map(img => img.url) || [];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || generatePropertyDescription(property),
    url: url,
    datePosted: property.created_at,
    dateModified: property.updated_at,
    image: images,
    offers: property.price && property.price > 0 ? {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'BRL',
      availability: property.status === 'vendido' || property.status === 'alugado' 
        ? 'https://schema.org/SoldOut' 
        : 'https://schema.org/InStock',
    } : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address_street || '',
      addressLocality: property.address_city,
      addressRegion: property.address_state,
      postalCode: property.address_zipcode || '',
      addressCountry: 'BR',
    },
    geo: property.address_lat && property.address_lng ? {
      '@type': 'GeoCoordinates',
      latitude: property.address_lat,
      longitude: property.address_lng,
    } : undefined,
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: property.area ? {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK',
    } : undefined,
    amenityFeature: property.features?.map(feature => ({
      '@type': 'LocationFeatureSpecification',
      name: feature,
    })),
    broker: siteConfig ? {
      '@type': 'RealEstateAgent',
      name: 'Via Fatto Imóveis',
      telephone: siteConfig.phone || '',
      email: siteConfig.email || '',
      address: siteConfig.address || '',
    } : undefined,
  };
}

export function generateProductSchema(property: PropertyFromDB, url: string) {
  if (!property.price || property.price === 0) return null;
  
  const images = property.images?.map(img => img.url) || [];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description || generatePropertyDescription(property),
    image: images[0] || '',
    url: url,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'BRL',
      availability: property.status === 'vendido' || property.status === 'alugado' 
        ? 'https://schema.org/SoldOut' 
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Via Fatto Imóveis',
      },
    },
    category: `Imóveis > ${propertyTypeLabels[property.type] || property.type}`,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateLocalBusinessSchema(siteConfig: SiteConfig | null, baseUrl: string) {
  if (!siteConfig) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Via Fatto Imóveis',
    description: siteConfig.seo_description || 'Imobiliária especializada em Brasília DF e Goiás',
    url: baseUrl,
    logo: siteConfig.logo_url || siteConfig.logo_horizontal_url || '',
    image: siteConfig.og_image_url || siteConfig.hero_background_url || '',
    telephone: siteConfig.phone || '',
    email: siteConfig.email || '',
    address: siteConfig.address ? {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressCountry: 'BR',
    } : undefined,
    sameAs: [
      siteConfig.social_facebook,
      siteConfig.social_instagram,
      siteConfig.social_youtube,
      siteConfig.social_linkedin,
    ].filter(Boolean),
    priceRange: '$$$',
    openingHours: 'Mo-Fr 08:00-18:00',
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate property FAQs dynamically
export function generatePropertyFAQs(property: PropertyFromDB): { question: string; answer: string }[] {
  const type = propertyTypeLabels[property.type] || property.type;
  const statusLabel = property.status === 'venda' ? 'à venda' : 'para alugar';
  const city = property.address_city;
  
  const faqs: { question: string; answer: string }[] = [];
  
  // Price FAQ
  if (property.price && property.price > 0) {
    faqs.push({
      question: `Qual o valor ${property.status === 'venda' ? 'de venda' : 'do aluguel'} deste imóvel?`,
      answer: `Este ${type.toLowerCase()} está ${statusLabel} por ${formatPrice(property.price)}.`,
    });
  }
  
  // Location FAQ
  faqs.push({
    question: `Onde fica localizado este imóvel?`,
    answer: `Este imóvel está localizado ${property.address_neighborhood ? `no bairro ${property.address_neighborhood}, ` : ''}em ${city}, ${property.address_state}.`,
  });
  
  // Features FAQ
  if (property.bedrooms > 0 || property.bathrooms > 0) {
    const features: string[] = [];
    if (property.bedrooms > 0) features.push(`${property.bedrooms} quarto${property.bedrooms > 1 ? 's' : ''}`);
    if (property.suites > 0) features.push(`${property.suites} suíte${property.suites > 1 ? 's' : ''}`);
    if (property.bathrooms > 0) features.push(`${property.bathrooms} banheiro${property.bathrooms > 1 ? 's' : ''}`);
    if (property.garages > 0) features.push(`${property.garages} vaga${property.garages > 1 ? 's' : ''} de garagem`);
    
    faqs.push({
      question: `Quantos quartos e banheiros tem este imóvel?`,
      answer: `Este ${type.toLowerCase()} possui ${features.join(', ')}.`,
    });
  }
  
  // Area FAQ
  if (property.area > 0) {
    faqs.push({
      question: `Qual a área total deste imóvel?`,
      answer: `A área total é de ${property.area}m²${property.built_area ? `, sendo ${property.built_area}m² de área construída` : ''}.`,
    });
  }
  
  // Financing FAQ
  if (property.status === 'venda') {
    faqs.push({
      question: `Este imóvel aceita financiamento?`,
      answer: property.financing 
        ? `Sim, este ${type.toLowerCase()} aceita financiamento bancário.`
        : `Consulte conosco sobre as condições de pagamento para este imóvel.`,
    });
  }
  
  return faqs;
}

// Helper functions
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatPriceCompact(price: number): string {
  if (price >= 1000000) {
    return `R$ ${(price / 1000000).toFixed(1).replace('.', ',')} milhões`;
  }
  if (price >= 1000) {
    return `R$ ${Math.round(price / 1000)} mil`;
  }
  return formatPrice(price);
}

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Open Graph meta tags generator
export function generateOpenGraphMeta(
  title: string,
  description: string,
  url: string,
  image?: string,
  type: 'website' | 'article' | 'product' = 'website'
) {
  const meta: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:type': type,
    'og:locale': 'pt_BR',
    'og:site_name': 'Via Fatto Imóveis',
  };
  
  if (image) {
    meta['og:image'] = image;
    meta['og:image:secure_url'] = image;
    meta['og:image:type'] = image.includes('.png') ? 'image/png' : 'image/jpeg';
    meta['og:image:width'] = '1200';
    meta['og:image:height'] = '630';
    meta['og:image:alt'] = title;
  }
  
  return meta;
}

// Twitter Card meta tags generator
export function generateTwitterMeta(
  title: string,
  description: string,
  image?: string
) {
  const meta: Record<string, string> = {
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:title': title,
    'twitter:description': description,
  };
  
  if (image) {
    meta['twitter:image'] = image;
    meta['twitter:image:alt'] = title;
  }
  
  return meta;
}
