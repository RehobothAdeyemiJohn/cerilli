import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Quote, Vehicle } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";

interface QuoteContractDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (quoteId: string, data: any) => void;
  isSubmitting: boolean;
}

const QuoteContractDialog: React.FC<QuoteContractDialogProps> = ({
  quote,
  vehicle,
  open,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [contractorType, setContractorType] = useState('personaFisica');
  const [hasReducedVAT, setHasReducedVAT] = useState(quote?.reducedVAT || false);
  const [hasTradein, setHasTradein] = useState(quote?.hasTradeIn || false);
  const [formData, setFormData] = useState<any>({
    // Persona Fisica
    firstName: '',
    lastName: '',
    fiscalCode: '',
    birthDate: '',
    birthPlace: '',
    birthProvince: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    email: quote?.customerEmail || '',
    phone: quote?.customerPhone || '',
    
    // Persona Giuridica
    companyName: '',
    vatNumber: '',
    legalRepFirstName: '',
    legalRepLastName: '',
    legalRepFiscalCode: '',
    legalRepBirthDate: '',
    legalRepBirthPlace: '',
    legalRepBirthProvince: '',
    
    // Contract payment terms
    terminiPagamento: '',
    tempiConsegna: '',
    garanzia: '24 mesi',
    clausoleSpeciali: '',
    
    // Price configuration
    discountAmount: quote?.discount || 0,
    plateBonus: quote?.licensePlateBonus || 0,
    safetyKitAmount: quote?.safetyKit || 0,
    roadTaxAmount: 400, // Changed from 350 to 400 euro
    hasReducedVAT: quote?.reducedVAT || false,
    
    // Trade-in details
    hasTradein: quote?.hasTradeIn || false,
    tradeinBonus: quote?.tradeInBonus || 0,
    tradeinBrand: quote?.tradeInBrand || '',
    tradeinModel: quote?.tradeInModel || '',
    tradeinYear: quote?.tradeInYear || '',
    tradeinValue: quote?.tradeInValue || 0,
  });

  // Calculate prices with VAT
  const calculatePriceWithVAT = (price: number, hasReducedVAT: boolean): number => {
    // If price already includes VAT (from quote), we need to first remove the standard VAT
    const vatRate = hasReducedVAT ? 0.04 : 0.22;
    const priceWithoutVAT = price / 1.22; // Remove standard 22% VAT
    return Math.round(priceWithoutVAT * (1 + vatRate)); // Apply correct VAT rate
  };
  
  // Trade-in value should not be affected by VAT changes
  const getTradeinValue = (): number => {
    return formData.hasTradein ? (formData.tradeinValue || 0) : 0;
  };

  const calculateFinalPrice = (): number => {
    const basePrice = vehicle?.price || 0;
    const basePriceWithVAT = calculatePriceWithVAT(basePrice, hasReducedVAT);
    
    // Calculate discounts with correct VAT
    const discountWithVAT = calculatePriceWithVAT(formData.discountAmount || 0, hasReducedVAT);
    const plateBonusWithVAT = calculatePriceWithVAT(formData.plateBonus || 0, hasReducedVAT);
    const tradeinBonusWithVAT = formData.hasTradein ? 
      calculatePriceWithVAT(formData.tradeinBonus || 0, hasReducedVAT) : 0;
    
    // Calculate additions with correct VAT  
    const safetyKitWithVAT = calculatePriceWithVAT(formData.safetyKitAmount || 0, hasReducedVAT);
    const roadTaxWithVAT = calculatePriceWithVAT(formData.roadTaxAmount || 400, hasReducedVAT);
    
    // Trade-in value remains the same regardless of VAT
    const tradeinValue = getTradeinValue();
    
    // Calculate final price
    const totalDiscounts = discountWithVAT + plateBonusWithVAT + tradeinBonusWithVAT + tradeinValue;
    const totalAdditions = safetyKitWithVAT + roadTaxWithVAT;
    return basePriceWithVAT - totalDiscounts + totalAdditions;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quote) {
      onSubmit(quote.id, formData);
    }
  };

  // Update form values when quote changes
  useEffect(() => {
    if (quote) {
      setHasReducedVAT(quote.reducedVAT || false);
      setHasTradein(quote.hasTradeIn || false);
      setFormData(prev => ({
        ...prev,
        hasReducedVAT: quote.reducedVAT || false,
        hasTradein: quote.hasTradeIn || false,
        tradeinBrand: quote.tradeInBrand || '',
        tradeinModel: quote.tradeInModel || '',
        tradeinYear: quote.tradeInYear || '',
        tradeinValue: quote.tradeInValue || 0,
        discountAmount: quote.discount || 0,
        plateBonus: quote.licensePlateBonus || 0,
        tradeinBonus: quote.tradeInBonus || 0,
        safetyKitAmount: quote.safetyKit || 0,
        email: quote.customerEmail || '',
        phone: quote.customerPhone || '',
      }));
    }
  }, [quote]);

  // Update form when switches change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      hasReducedVAT: hasReducedVAT,
      hasTradein: hasTradein
    }));
  }, [hasReducedVAT, hasTradein]);
  
  if (!quote || !vehicle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Creazione Contratto da Preventivo
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Contractor and Vehicle Information */}
            <div className="space-y-6">
              {/* Contractor Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Dati del Contraente</h3>
                
                <Tabs defaultValue="personaFisica" className="w-full" 
                  onValueChange={(value) => setContractorType(value)}>
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="personaFisica">Persona Fisica</TabsTrigger>
                    <TabsTrigger value="personaGiuridica">Persona Giuridica</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personaFisica" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={formData.firstName} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName">Cognome</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={formData.lastName} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                        <Input 
                          id="fiscalCode" 
                          name="fiscalCode" 
                          value={formData.fiscalCode} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="birthDate">Data di Nascita</Label>
                        <Input 
                          id="birthDate" 
                          name="birthDate" 
                          type="date" 
                          value={formData.birthDate} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="birthPlace">Luogo di Nascita</Label>
                        <Input 
                          id="birthPlace" 
                          name="birthPlace" 
                          value={formData.birthPlace} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="birthProvince">Provincia di Nascita</Label>
                        <Input 
                          id="birthProvince" 
                          name="birthProvince" 
                          value={formData.birthProvince} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="personaGiuridica" className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="companyName">Ragione Sociale</Label>
                        <Input 
                          id="companyName" 
                          name="companyName" 
                          value={formData.companyName} 
                          onChange={handleChange} 
                          required={contractorType === 'personaGiuridica'} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="vatNumber">Partita IVA</Label>
                        <Input 
                          id="vatNumber" 
                          name="vatNumber" 
                          value={formData.vatNumber} 
                          onChange={handleChange} 
                          required={contractorType === 'personaGiuridica'} 
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-2">Rappresentante Legale</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="legalRepFirstName">Nome</Label>
                          <Input 
                            id="legalRepFirstName" 
                            name="legalRepFirstName" 
                            value={formData.legalRepFirstName} 
                            onChange={handleChange} 
                            required={contractorType === 'personaGiuridica'} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="legalRepLastName">Cognome</Label>
                          <Input 
                            id="legalRepLastName" 
                            name="legalRepLastName" 
                            value={formData.legalRepLastName} 
                            onChange={handleChange} 
                            required={contractorType === 'personaGiuridica'} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <Label htmlFor="legalRepFiscalCode">Codice Fiscale</Label>
                        <Input 
                          id="legalRepFiscalCode" 
                          name="legalRepFiscalCode" 
                          value={formData.legalRepFiscalCode} 
                          onChange={handleChange} 
                          required={contractorType === 'personaGiuridica'} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="space-y-1">
                          <Label htmlFor="legalRepBirthDate">Data di Nascita</Label>
                          <Input 
                            id="legalRepBirthDate" 
                            name="legalRepBirthDate" 
                            type="date" 
                            value={formData.legalRepBirthDate} 
                            onChange={handleChange} 
                            required={contractorType === 'personaGiuridica'} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="legalRepBirthPlace">Luogo di Nascita</Label>
                          <Input 
                            id="legalRepBirthPlace" 
                            name="legalRepBirthPlace" 
                            value={formData.legalRepBirthPlace} 
                            onChange={handleChange} 
                            required={contractorType === 'personaGiuridica'} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <Label htmlFor="legalRepBirthProvince">Provincia di Nascita</Label>
                        <Input 
                          id="legalRepBirthProvince" 
                          name="legalRepBirthProvince" 
                          value={formData.legalRepBirthProvince} 
                          onChange={handleChange} 
                          required={contractorType === 'personaGiuridica'} 
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Common contact information */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Contatti e Residenza</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="address">Indirizzo</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="city">Città</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          value={formData.city} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="province">Provincia</Label>
                        <Input 
                          id="province" 
                          name="province" 
                          value={formData.province} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="zipCode">CAP</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="phone">Telefono</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Dati del Veicolo</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Modello</Label>
                    <div className="bg-white p-2 border rounded-md">
                      {vehicle.model}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Allestimento</Label>
                    <div className="bg-white p-2 border rounded-md">
                      {vehicle.trim}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <Label>Alimentazione</Label>
                    <div className="bg-white p-2 border rounded-md">
                      {vehicle.fuelType}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Colore</Label>
                    <div className="bg-white p-2 border rounded-md">
                      {vehicle.exteriorColor}
                    </div>
                  </div>
                </div>
                
                {vehicle.transmission && (
                  <div className="mt-3">
                    <div className="space-y-1">
                      <Label>Cambio</Label>
                      <div className="bg-white p-2 border rounded-md">
                        {vehicle.transmission}
                      </div>
                    </div>
                  </div>
                )}
                
                {vehicle.accessories && vehicle.accessories.length > 0 && (
                  <div className="mt-3">
                    <Label>Accessori</Label>
                    <div className="bg-white p-2 border rounded-md">
                      <ul className="list-disc pl-5 text-sm">
                        {vehicle.accessories.map((acc, idx) => (
                          <li key={idx}>{acc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <div className="space-y-1">
                    <Label>Telaio</Label>
                    <div className="bg-white p-2 border rounded-md">
                      {vehicle.telaio}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Price and Contract Details */}
            <div className="space-y-6">
              {/* Price Configuration */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Configurazione Prezzo</h3>
                
                {/* IVA agevolata Switch */}
                <div className="flex items-center justify-between mb-4 p-3 border rounded-md">
                  <div>
                    <span className="font-medium">IVA agevolata 4%</span>
                    <p className="text-xs text-green-600">Legge 104 art.3 com.3</p>
                  </div>
                  <Switch 
                    checked={hasReducedVAT} 
                    onCheckedChange={(checked) => setHasReducedVAT(checked)}
                  />
                </div>
                
                {/* Permuta Switch */}
                <div className="flex items-center justify-between mb-4 p-3 border rounded-md">
                  <span className="font-medium">Permuta</span>
                  <Switch 
                    checked={hasTradein}
                    onCheckedChange={(checked) => setHasTradein(checked)}
                  />
                </div>
                
                {/* Price Components */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="discountAmount">Sconto (€)</Label>
                    <Input 
                      id="discountAmount" 
                      name="discountAmount" 
                      type="number" 
                      value={formData.discountAmount} 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="plateBonus">Premio Targa (€)</Label>
                    <Input 
                      id="plateBonus" 
                      name="plateBonus" 
                      type="number" 
                      value={formData.plateBonus} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <Label htmlFor="safetyKitAmount">Kit Sicurezza (€)</Label>
                    <Input 
                      id="safetyKitAmount" 
                      name="safetyKitAmount" 
                      type="number" 
                      value={formData.safetyKitAmount} 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="roadTaxAmount">Messa su Strada (€)</Label>
                    <Input 
                      id="roadTaxAmount" 
                      name="roadTaxAmount" 
                      type="number" 
                      value={formData.roadTaxAmount} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Show trade-in section only if trade-in is enabled */}
                {hasTradein && (
                  <div className="mt-4 p-3 border rounded-md bg-blue-50">
                    <h4 className="font-medium mb-2">Dati Permuta</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="tradeinBrand">Marca</Label>
                        <Input 
                          id="tradeinBrand" 
                          name="tradeinBrand" 
                          value={formData.tradeinBrand} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tradeinModel">Modello</Label>
                        <Input 
                          id="tradeinModel" 
                          name="tradeinModel" 
                          value={formData.tradeinModel} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="space-y-1">
                        <Label htmlFor="tradeinYear">Anno</Label>
                        <Input 
                          id="tradeinYear" 
                          name="tradeinYear" 
                          value={formData.tradeinYear} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tradeinBonus">Premio Permuta (€)</Label>
                        <Input 
                          id="tradeinBonus" 
                          name="tradeinBonus" 
                          type="number" 
                          value={formData.tradeinBonus} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="space-y-1">
                        <Label htmlFor="tradeinValue">Valore Permuta (€)</Label>
                        <Input 
                          id="tradeinValue" 
                          name="tradeinValue" 
                          type="number" 
                          value={formData.tradeinValue} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Final Price Summary */}
                <div className="mt-6 p-4 bg-blue-900 text-white rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Prezzo Finale</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(calculateFinalPrice())}
                    </span>
                  </div>
                  {hasReducedVAT && (
                    <p className="text-xs mt-1 text-blue-200">IVA agevolata 4% inclusa</p>
                  )}
                </div>
              </div>
              
              {/* Contract Terms */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-4">Condizioni Contrattuali</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="terminiPagamento">Termini di Pagamento</Label>
                    <Input 
                      id="terminiPagamento" 
                      name="terminiPagamento" 
                      value={formData.terminiPagamento} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="tempiConsegna">Tempi di Consegna</Label>
                    <Input 
                      id="tempiConsegna" 
                      name="tempiConsegna" 
                      value={formData.tempiConsegna} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="garanzia">Garanzia</Label>
                    <Input 
                      id="garanzia" 
                      name="garanzia" 
                      value={formData.garanzia} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="clausoleSpeciali">Clausole Speciali</Label>
                    <Textarea 
                      id="clausoleSpeciali" 
                      name="clausoleSpeciali" 
                      value={formData.clausoleSpeciali} 
                      onChange={handleChange} 
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creazione in corso...' : 'Crea Contratto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteContractDialog;
