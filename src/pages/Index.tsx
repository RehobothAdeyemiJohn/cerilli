
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Car, BarChart3, FileText, ShoppingCart } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Car,
      title: 'Vehicle Inventory',
      description: 'Manage your vehicle stock with detailed information on models, trims, and specifications.',
      path: '/inventory',
    },
    {
      icon: FileText,
      title: 'Quote Management',
      description: 'Create and manage quotes for customers with special pricing and discounts.',
      path: '/quotes',
    },
    {
      icon: ShoppingCart,
      title: 'Order Processing',
      description: 'Track orders from dealers and manage the entire delivery process.',
      path: '/orders',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Gain insights into your inventory, sales, and dealer performance with detailed reports.',
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
              Cirelli Motor Company
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Complete stock management system for Cirelli Motors vehicles, dealers, and sales operations.
            </p>
            <div className="mt-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            System Features
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
              Ready to manage your vehicle stock effectively?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Get started with the Cirelli Motor Company stock management system and streamline your operations.
            </p>
            <button 
              onClick={() => navigate('/inventory')}
              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Inventory
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Cirelli Motor Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
