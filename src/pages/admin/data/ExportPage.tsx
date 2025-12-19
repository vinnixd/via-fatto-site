import { useState } from "react";
import DataLayout from "./DataLayout";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileSpreadsheet, Building2, Loader2, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ExportPage = () => {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);

  const handleExport = async () => {
    setExporting(true);

    try {
      // Build query
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          slug,
          description,
          type,
          status,
          profile,
          price,
          address_street,
          address_neighborhood,
          address_city,
          address_state,
          address_zipcode,
          address_lat,
          address_lng,
          bedrooms,
          suites,
          bathrooms,
          garages,
          area,
          built_area,
          features,
          amenities,
          financing,
          documentation,
          condo_fee,
          condo_exempt,
          iptu,
          featured,
          active,
          reference,
          seo_title,
          seo_description,
          created_at,
          updated_at,
          property_images (url, alt, order_index)
        `)
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data: properties, error } = await query;

      if (error) throw error;

      if (!properties || properties.length === 0) {
        toast.error("Nenhum imóvel encontrado para exportar");
        return;
      }

      // Process data for export
      const exportData = properties.map((property) => {
        const images = includeImages && property.property_images
          ? property.property_images
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((img: any) => img.url)
              .join('; ')
          : '';

        return {
          id: property.id,
          titulo: property.title,
          slug: property.slug,
          descricao: property.description || '',
          tipo: property.type,
          finalidade: property.status,
          perfil: property.profile,
          preco: property.price,
          endereco_rua: property.address_street || '',
          endereco_bairro: property.address_neighborhood || '',
          endereco_cidade: property.address_city,
          endereco_estado: property.address_state,
          endereco_cep: property.address_zipcode || '',
          latitude: property.address_lat || '',
          longitude: property.address_lng || '',
          quartos: property.bedrooms,
          suites: property.suites,
          banheiros: property.bathrooms,
          vagas: property.garages,
          area_total: property.area,
          area_construida: property.built_area || '',
          caracteristicas: property.features?.join('; ') || '',
          amenidades: property.amenities?.join('; ') || '',
          aceita_financiamento: property.financing ? 'Sim' : 'Não',
          documentacao: property.documentation,
          condominio: property.condo_fee || '',
          condominio_isento: property.condo_exempt ? 'Sim' : 'Não',
          iptu: property.iptu || '',
          destaque: property.featured ? 'Sim' : 'Não',
          ativo: property.active ? 'Sim' : 'Não',
          referencia: property.reference || '',
          seo_titulo: property.seo_title || '',
          seo_descricao: property.seo_description || '',
          criado_em: property.created_at,
          atualizado_em: property.updated_at,
          ...(includeImages && { imagens: images }),
        };
      });

      // Generate file content
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(exportData[0]);
        const csvRows = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = row[header as keyof typeof row];
              // Escape quotes and wrap in quotes if contains comma, newline, or quotes
              const stringValue = String(value ?? '');
              if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            }).join(',')
          )
        ];
        fileContent = csvRows.join('\n');
        fileName = `imoveis_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        // JSON format
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `imoveis_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json;charset=utf-8;';
      }

      // Create and download file
      const blob = new Blob(['\ufeff' + fileContent], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`${properties.length} imóveis exportados com sucesso!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao exportar: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <DataLayout>
      <AdminHeader 
        title="Exportar Imóveis" 
        subtitle="Exporte seus imóveis para CSV ou JSON"
      />
      
      <div className="space-y-6">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Sobre a exportação
            </CardTitle>
            <CardDescription>
              Exporte todos os seus imóveis em formato CSV ou JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A exportação inclui todos os dados dos imóveis cadastrados no sistema, incluindo:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Título e descrição</Badge>
                <Badge variant="secondary">Preço</Badge>
                <Badge variant="secondary">Endereço completo</Badge>
                <Badge variant="secondary">Especificações</Badge>
                <Badge variant="secondary">Características</Badge>
                <Badge variant="secondary">SEO</Badge>
                <Badge variant="secondary">Imagens</Badge>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Dica</AlertTitle>
                <AlertDescription>
                  O arquivo CSV pode ser aberto no Excel, Google Sheets ou qualquer editor de planilhas.
                  O formato JSON é ideal para integração com outros sistemas.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Opções de exportação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Formato do arquivo</Label>
              <RadioGroup 
                value={format} 
                onValueChange={(value) => setFormat(value as 'csv' | 'json')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="cursor-pointer">
                    CSV (Excel, Google Sheets)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="cursor-pointer">
                    JSON (Integração)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Incluir na exportação</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-inactive" 
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
                  />
                  <Label htmlFor="include-inactive" className="cursor-pointer text-sm">
                    Incluir imóveis inativos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-images" 
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                  />
                  <Label htmlFor="include-images" className="cursor-pointer text-sm">
                    Incluir URLs das imagens
                  </Label>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button 
              variant="admin"
              onClick={handleExport} 
              disabled={exporting}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar imóveis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DataLayout>
  );
};

export default ExportPage;
