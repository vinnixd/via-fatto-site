import SubscriptionsLayout from './SubscriptionsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Essencial',
    price: 'R$ 79 a R$ 99',
    description: 'Ideal para corretor autônomo.',
    features: [
      { text: 'Site imobiliário profissional', included: true },
      { text: 'Painel administrativo', included: true },
      { text: 'Cadastro de imóveis', included: true },
      { text: 'Integração com WhatsApp', included: true },
      { text: 'Suporte básico', included: true },
      { text: 'Destaque de imóveis', included: false },
      { text: 'Mapa interativo', included: false },
      { text: 'CRM integrado', included: false },
    ],
  },
  {
    name: 'Profissional',
    price: 'R$ 129 a R$ 149',
    description: 'Ideal para corretores mais ativos.',
    current: true,
    features: [
      { text: 'Tudo do Essencial', included: true },
      { text: 'Mais imóveis cadastrados', included: true },
      { text: 'Destaque de imóveis', included: true },
      { text: 'Mapa interativo', included: true },
      { text: 'Prioridade no suporte', included: true },
      { text: 'CRM integrado', included: false },
      { text: 'ChatBot no site', included: false },
      { text: 'Agentes de IA', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 'R$ 199 a R$ 249',
    description: 'Ideal para imobiliárias.',
    highlighted: true,
    features: [
      { text: 'Tudo do Profissional', included: true },
      { text: 'CRM integrado (quando disponível)', included: true },
      { text: 'ChatBot no site', included: true },
      { text: 'Agentes de IA (quando disponíveis)', included: true },
      { text: 'Automações de atendimento', included: true },
      { text: 'Acesso antecipado às novas funções', included: true },
    ],
  },
];

const PlansPage = () => {
  return (
    <SubscriptionsLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold mb-8">Planos</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.highlighted ? 'bg-sidebar text-sidebar-foreground border-sidebar' : ''}`}
            >
              {plan.current && (
                <Badge className="absolute -top-3 right-4 bg-primary">
                  Plano atual
                </Badge>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-sidebar-foreground/70' : 'text-muted-foreground'}`}> / mês</span>
                </div>
                <p className={`text-sm mt-2 ${plan.highlighted ? 'text-sidebar-foreground/80' : 'text-muted-foreground'}`}>
                  👉 {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-green-400' : 'text-green-600'}`} />
                    ) : (
                      <X className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-sidebar-foreground/40' : 'text-muted-foreground/50'}`} />
                    )}
                    <span className={!feature.included ? (plan.highlighted ? 'text-sidebar-foreground/50' : 'text-muted-foreground/70') : ''}>
                      {feature.text}
                    </span>
                  </div>
                ))}

                <div className="pt-4">
                  {plan.current ? (
                    <Button variant="outline" className="w-full">
                      Plano atual
                    </Button>
                  ) : plan.highlighted ? (
                    <Button className="w-full bg-white text-sidebar hover:bg-white/90">
                      Fazer upgrade
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      {plan.name === 'Essencial' ? 'Reduzir plano' : 'Subir de plano'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compare Plans Section */}
        <h2 className="text-xl font-bold mt-12 mb-4">Comparar planos</h2>
        <p className="text-muted-foreground">
          Compare os recursos disponíveis em cada plano para escolher o melhor para você.
        </p>
      </div>
    </SubscriptionsLayout>
  );
};

export default PlansPage;
