import SubscriptionsLayout from './SubscriptionsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';

const PaymentsPage = () => {
  return (
    <SubscriptionsLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Pagamentos</h1>
        <p className="text-muted-foreground mb-8">
          Tudo sobre pagamentos, assinaturas e vencimentos dos serviços.
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Payment Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Débito automático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Plano - Profissional</p>
                    <p className="text-sm text-muted-foreground">Próximo pagamento: 10/01/2026</p>
                    <Button variant="link" className="p-0 h-auto text-primary text-sm">
                      Detalhes
                    </Button>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">R$ 139,00</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dados da conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Via Fatto</p>
                <a href="#" className="text-primary text-sm hover:underline">viafatto.com.br</a>
                <p className="text-sm text-muted-foreground">CPF: 769.800.651-49</p>
                <Button variant="link" className="p-0 h-auto text-primary text-sm gap-2">
                  <Settings className="h-3 w-3" />
                  Dados fiscais
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Inserir cupom</span>
                  <span>→</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Link */}
        <div className="flex items-center justify-center gap-2 mt-12 text-muted-foreground">
          <span className="text-sm">Mais sobre pagamentos e assinaturas</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </SubscriptionsLayout>
  );
};

export default PaymentsPage;
