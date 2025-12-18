import SubscriptionsLayout from './SubscriptionsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Settings } from 'lucide-react';

interface Invoice {
  month: string;
  period: string;
  nfe: string;
  plan: string;
  amount: string;
}

const invoices: Invoice[] = [
  { month: 'Dezembro 2025', period: '11/12/25 - 10/01/26', nfe: 'NFe #5335886', plan: 'Plano - Profissional', amount: 'R$ 139,00' },
  { month: '', period: '14/06/25 - 14/07/25', nfe: 'NFe #5351240', plan: 'Plano - Essencial', amount: 'R$ 59,00' },
  { month: 'Novembro 2025', period: '11/11/25 - 11/12/25', nfe: 'NFe #5191841', plan: 'Plano - Profissional', amount: 'R$ 139,00' },
  { month: 'Outubro 2025', period: '12/10/25 - 11/11/25', nfe: 'NFe #5106998', plan: 'Plano - Profissional', amount: 'R$ 139,00' },
  { month: 'Setembro 2025', period: '12/09/25 - 12/10/25', nfe: 'NFe #4920976', plan: 'Plano - Profissional', amount: 'R$ 139,00' },
  { month: 'Agosto 2025', period: '13/08/25 - 12/09/25', nfe: 'NFe #4791000', plan: 'Plano - Profissional', amount: 'R$ 139,00' },
];

const InvoicesPage = () => {
  // Group invoices by month and calculate totals
  const groupedInvoices = invoices.reduce((acc, invoice, index) => {
    const prevInvoice = invoices[index - 1];
    const isNewMonth = invoice.month && (!prevInvoice || prevInvoice.month !== invoice.month);
    
    if (isNewMonth || index === 0) {
      acc.push({ ...invoice, isFirst: true });
    } else {
      acc.push({ ...invoice, isFirst: false });
    }
    return acc;
  }, [] as (Invoice & { isFirst: boolean })[]);

  return (
    <SubscriptionsLayout>
      <div className="max-w-4xl">
        {/* Fiscal Data Card */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dados fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-primary text-sm gap-2">
              <Settings className="h-3 w-3" />
              Configurar
            </Button>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <h2 className="text-xl font-bold mb-4">Notas fiscais</h2>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Mês</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>NFe</TableHead>
                <TableHead className="text-right">Quantia</TableHead>
                <TableHead className="w-[80px]">Baixar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedInvoices.map((invoice, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {invoice.isFirst ? invoice.month : ''}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{invoice.period}</TableCell>
                  <TableCell>
                    <span className="text-primary hover:underline cursor-pointer">
                      {invoice.nfe}
                    </span>
                    <span className="text-muted-foreground">- {invoice.plan}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </SubscriptionsLayout>
  );
};

export default InvoicesPage;
