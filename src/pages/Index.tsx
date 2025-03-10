
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { ShoppingBag, BarChart3, FileText, Car } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: ShoppingBag,
      title: 'Stock Veicoli',
      description: 'Gestisci il tuo stock di veicoli con informazioni dettagliate su modelli, allestimenti e specifiche.',
      path: '/inventory',
    },
    {
      icon: FileText,
      title: 'Preventivi',
      description: 'Crea e gestisci preventivi per i clienti con prezzi speciali e sconti.',
      path: '/quotes',
    },
    {
      icon: Car,
      title: 'Ordini Auto',
      description: 'Monitora gli ordini dai concessionari e gestisci l\'intero processo di consegna.',
      path: '/orders',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analitica',
      description: 'Ottieni approfondimenti sul tuo inventario, vendite e prestazioni dei concessionari con report dettagliati.',
      path: '/dashboard',
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Gestionale CMC
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Sistema completo di gestione stock per veicoli CMC, concessionari e operazioni di vendita.
            </p>
            <div className="mt-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Vai alla Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Funzionalità del Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Pronto a gestire il tuo stock di veicoli in modo efficace?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Inizia con il sistema di gestione stock Gestionale CMC e ottimizza le tue operazioni.
            </p>
            <button 
              onClick={() => navigate('/inventory')}
              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Sfoglia Stock
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Gestionale CMC. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
