import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import { useTenantSettings, useCompanyName, useContactInfo } from '@/hooks/useTenantSettings';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { buildWhatsAppUrl } from '@/lib/utils';

const Footer = () => {
  const { settings, isLoading } = useTenantSettings();
  const companyName = useCompanyName();
  const contactInfo = useContactInfo();

  const whatsappUrl = buildWhatsAppUrl({ 
    phone: contactInfo.whatsapp || '', 
    message: 'Olá! Gostaria de saber mais sobre os imóveis.' 
  });
  
  const footerText = settings?.footer_text || `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`;

  return (
    <footer className="bg-neutral-900 text-neutral-100">
      <div className="container">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                {isLoading ? (
                  <div className="h-14 w-[150px]" />
                ) : (settings?.logo_horizontal_url || settings?.logo_url) ? (
                  <img 
                    src={settings.logo_horizontal_url || settings.logo_url!} 
                    alt={companyName} 
                    className="h-14 w-auto object-contain brightness-0 invert"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">
                      {companyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-neutral-300 mb-6 max-w-md">
                {settings?.about_text?.substring(0, 200) || 'Encontre o imóvel dos seus sonhos com atendimento personalizado e as melhores opções do mercado.'}
                {settings?.about_text && settings.about_text.length > 200 ? '...' : ''}
              </p>
              <div className="flex space-x-4">
                {contactInfo.social.instagram && (
                  <a href={contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {contactInfo.social.facebook && (
                  <a href={contactInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {contactInfo.social.linkedin && (
                  <a href={contactInfo.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {contactInfo.social.youtube && (
                  <a href={contactInfo.social.youtube} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-neutral-300 hover:text-primary transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/imoveis" className="text-neutral-300 hover:text-primary transition-colors">
                    Imóveis
                  </Link>
                </li>
                <li>
                  <Link to="/sobre" className="text-neutral-300 hover:text-primary transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/favoritos" className="text-neutral-300 hover:text-primary transition-colors">
                    Favoritos
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="text-neutral-300 hover:text-primary transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contato</h3>
              <div className="space-y-3">
                {contactInfo.phone && (
                  <a 
                    href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                    className="flex items-center space-x-2 text-neutral-300 hover:text-primary transition-colors"
                  >
                    <Phone size={16} />
                    <span>{contactInfo.phone}</span>
                  </a>
                )}
                {contactInfo.email && (
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center space-x-2 text-neutral-300 hover:text-primary transition-colors"
                  >
                    <Mail size={16} />
                    <span>{contactInfo.email}</span>
                  </a>
                )}
                {contactInfo.address && (
                  <div className="flex items-start space-x-2 text-neutral-300">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span className="whitespace-pre-line">{contactInfo.address}</span>
                  </div>
                )}
                {contactInfo.whatsapp && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors mt-4"
                  >
                    <WhatsAppIcon size={16} />
                    <span>Falar no WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              {footerText}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacidade" className="text-neutral-400 hover:text-primary text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-neutral-400 hover:text-primary text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;