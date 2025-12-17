import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Settings,
  Link as LinkIcon,
  Calendar,
  Shield,
  Trash2,
  Star,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

// Mock data - in the future this would come from the database
const mockDomains = [
  {
    id: '1',
    domain: 'viafatto.lovable.app',
    isDefault: true,
    isPrimary: false,
    status: 'active',
    sslStatus: 'active',
  },
  {
    id: '2',
    domain: 'viafatto.com.br',
    isDefault: false,
    isPrimary: true,
    status: 'active',
    sslStatus: 'active',
  },
  {
    id: '3',
    domain: 'www.viafatto.com.br',
    isDefault: false,
    isPrimary: false,
    status: 'active',
    sslStatus: 'active',
  },
];

const helpCards = [
  {
    icon: Settings,
    title: 'Configure seu domínio',
    description: 'Use um domínio próprio para destacar a identidade da sua marca.',
    linkText: 'Ver tutorial',
    linkUrl: 'https://docs.lovable.dev/features/custom-domain',
  },
  {
    icon: LinkIcon,
    title: 'Verifique a configuração',
    description: 'Siga estes passos para revisar se seu domínio ficou corretamente vinculado.',
    linkText: 'Ver tutorial',
    linkUrl: 'https://docs.lovable.dev/features/custom-domain',
  },
  {
    icon: Calendar,
    title: 'Consulte o vencimento',
    description: 'Identifique se o registro do seu domínio deve ser renovado em breve.',
    linkText: 'Ver tutorial',
    linkUrl: 'https://docs.lovable.dev/features/custom-domain',
  },
  {
    icon: Shield,
    title: 'Certificado de segurança',
    description: 'Saiba se seu certificado de segurança está ativo.',
    linkText: 'Ver tutorial',
    linkUrl: 'https://docs.lovable.dev/features/custom-domain',
  },
];

const DomainsPage = () => {
  const [domains] = useState(mockDomains);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Domínios</h1>
            <p className="text-muted-foreground mt-1">
              O domínio é o endereço de sua loja na Internet. Você pode ter mais de um e gerenciá-los aqui.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {/* Domains Table */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Administre seus domínios</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domínios</TableHead>
                  <TableHead>Status do domínio</TableHead>
                  <TableHead>Status do certificado SSL</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Por padrão
                          </Badge>
                        )}
                        {domain.isPrimary && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Principal
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Ativado
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50"
                      >
                        <Shield className="h-3 w-3" />
                        SSL ativado
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!domain.isPrimary && !domain.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Definir como principal"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        {!domain.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Remover domínio"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Help Cards */}
        <div>
          <h2 className="font-semibold mb-4">Aprenda mais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpCards.map((card, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <card.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                      <a
                        href={card.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        {card.linkText}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <div className="flex justify-center">
          <a
            href="https://docs.lovable.dev/features/custom-domain"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Mais sobre domínios
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DomainsPage;
