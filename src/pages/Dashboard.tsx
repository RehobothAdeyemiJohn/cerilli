
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import Chart from '@/components/dashboard/Chart';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/api/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { calculateDaysInStock } from '@/lib/utils';
import { 
  Car, 
  Clock, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Percent, 
  CreditCard
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define types for admin dashboard charts
interface ModelData {
  name: string;
  value: number;
}

interface SalesByDealer {
  name: string;
  value: number;
}

interface MonthlySalesData {
  name: string;
  value: number;
}

// Mock data for admin dashboard
const mockModelData: ModelData[] = [
  { name: 'Cirelli 500', value: 15 },
  { name: 'Cirelli SUV', value: 12 },
  { name: 'Cirelli Berlina', value: 8 },
  { name: 'Cirelli Spyder', value: 5 }
];

const mockSalesByDealer: SalesByDealer[] = [
  { name: 'Auto Roma', value: 12 },
  { name: 'Milano Motors', value: 10 },
  { name: 'Napoli Auto', value: 8 },
  { name: 'Torino Cars', value: 6 }
];

const mockMonthlySalesData: MonthlySalesData[] = [
  { name: 'Gen', value: 35000 },
  { name: 'Feb', value: 42000 },
  { name: 'Mar', value: 38000 },
  { name: 'Apr', value: 30000 },
  { name: 'Mag', value: 55000 },
  { name: 'Giu', value: 65000 },
  { name: 'Lug', value: 45000 },
  { name: 'Ago', value: 25000 },
  { name: 'Set', value: 60000 },
  { name: 'Ott', value: 70000 },
  { name: 'Nov', value: 55000 },
  { name: 'Dic', value: 40000 }
];

const Dashboard = () => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;
  
  // Use state to force re-render when component mounts or route changes
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [useDarkMode, setUseDarkMode] = useState(false);
  
  // Reset the key whenever the component mounts or remounts
  useEffect(() => {
    setRenderKey(Date.now().toString());
  }, []);

  // Query to get dealer-specific data
  const { data: dealerData, isLoading: loadingDealerData } = useQuery({
    queryKey: ['dealerDashboard', dealerId, selectedPeriod],
    queryFn: async () => {
      if (!isDealer || !dealerId) return null;
      
      console.log('Fetching dealer dashboard data for dealerId:', dealerId);
      
      // Get dealer info
      const { data: dealer } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .single();
      
      console.log('Dealer info:', dealer);
      
      // Get vehicles for this dealer (reserved or ordered by this dealer)
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('reservedby', dealerId);
      
      console.log('Vehicles for dealer:', vehicles);
      
      // Get quotes for this dealer
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .eq('dealerid', dealerId);
      
      console.log('Quotes for dealer:', quotes);
      
      // Get orders for this dealer
      const { data: orders } = await supabase
        .from('orders')
        .select('*, vehicles(*)')
        .eq('dealerid', dealerId);
      
      console.log('Orders for dealer:', orders);
      
      return {
        dealer,
        vehicles: vehicles || [],
        quotes: quotes || [],
        orders: orders || []
      };
    },
    enabled: isDealer && !!dealerId,
  });

  // Calculate derived stats
  const dealerStats = React.useMemo(() => {
    if (!dealerData) return null;
    
    const { vehicles, quotes, orders, dealer } = dealerData;
    
    // Calculate average days in stock
    const daysInStockValues = vehicles.map(v => calculateDaysInStock(v.dateadded));
    const avgDaysInStock = daysInStockValues.length > 0 
      ? Math.round(daysInStockValues.reduce((sum, days) => sum + days, 0) / daysInStockValues.length) 
      : 0;
    
    console.log('Average days in stock calculation:', {daysInStockValues, avgDaysInStock});
    
    // Calculate conversion rate
    const conversionRate = quotes.length > 0 
      ? Math.round((orders.length / quotes.length) * 100) 
      : 0;
    
    // Calculate monthly sales count (number of orders)
    const currentMonth = new Date().getMonth();
    const ordersThisMonth = orders.filter(o => {
      const orderDate = new Date(o.orderdate);
      return orderDate.getMonth() === currentMonth;
    });
    
    // Monthly target is 5 vehicles
    const monthlyTarget = 5;
    const monthlyProgress = Math.min(100, Math.round((ordersThisMonth.length / monthlyTarget) * 100));
    
    // Generate monthly sales data for chart (count of orders per month)
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const monthlySalesData = monthNames.map((month, idx) => {
      const ordersInMonth = orders.filter(o => {
        const orderDate = new Date(o.orderdate);
        return orderDate.getMonth() === idx && orderDate.getFullYear() === currentYear;
      });
      
      return {
        name: month,
        value: ordersInMonth.length
      };
    });
    
    // Generate model distribution data for inventory (count of vehicles by model)
    const modelDistribution = vehicles.reduce((acc, vehicle) => {
      const model = vehicle.model;
      if (!acc[model]) acc[model] = 0;
      acc[model]++;
      return acc;
    }, {});
    
    const modelData = Object.entries(modelDistribution).map(([model, count]) => ({
      name: model,
      value: count
    }));
    
    // If no vehicles, add empty data point to avoid chart errors
    if (modelData.length === 0) {
      modelData.push({ name: 'Nessun veicolo', value: 0 });
    }
    
    console.log('Calculated dealer stats:', {
      vehiclesCount: vehicles.length,
      avgDaysInStock,
      quotesCount: quotes.length,
      ordersCount: orders.length,
      conversionRate,
      monthlyProgress,
      modelData
    });
    
    return {
      vehiclesCount: vehicles.length,
      quotesCount: quotes.length,
      ordersCount: orders.length,
      avgDaysInStock,
      conversionRate,
      creditLimit: dealer?.credit_limit || 0,
      monthlyTarget,
      monthlyProgress,
      monthlySalesData,
      modelData
    };
  }, [dealerData]);

  // Pie chart colors
  const COLORS = ['#4ADE80', '#818CF8', '#FB7185', '#FACC15', '#60A5FA', '#C084FC'];

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setUseDarkMode(!useDarkMode);
  };
  
  if (isDealer && !dealerId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold">Accesso Negato</h2>
          <p className="mt-2">Non hai accesso a questa pagina come dealer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 px-4 animate-fade-in ${useDarkMode ? 'bg-gray-900 text-white' : ''}`} key={renderKey}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard {isDealer ? 'Concessionario' : 'Admin'}</h1>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className={`px-3 py-1 rounded-full text-sm ${useDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {useDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Tabs
            defaultValue="month"
            value={selectedPeriod}
            onValueChange={handlePeriodChange}
            className="w-[250px]"
          >
            <TabsList className={`grid w-full grid-cols-3 ${useDarkMode ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="week" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Settimana</TabsTrigger>
              <TabsTrigger value="month" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Mese</TabsTrigger>
              <TabsTrigger value="year" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Anno</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isDealer ? (
        // DEALER DASHBOARD
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto a Stock</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.vehiclesCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Car className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Giorni Medi in Giacenza</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.avgDaysInStock || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preventivi</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.quotesCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-indigo-100">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contratti</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.ordersCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-rose-100">
                  <ShoppingCart className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Additional KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>% di Conversione</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.conversionRate || 0}%</h3>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plafond Disponibile</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(dealerStats?.creditLimit || 0)}</h3>
                </div>
                <div className="p-2 rounded-full bg-emerald-100">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vendite del Mese</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerData?.orders?.filter(o => new Date(o.orderdate).getMonth() === new Date().getMonth()).length || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-rose-100">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Target Progress */}
          <Card className={`p-4 mb-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Obiettivo Mensile</h3>
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">
                {dealerData?.orders?.filter(o => new Date(o.orderdate).getMonth() === new Date().getMonth()).length || 0} auto vendute
              </span>
              <span className={`${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Obiettivo: {dealerStats?.monthlyTarget || 5} auto
              </span>
            </div>
            <Progress value={dealerStats?.monthlyProgress || 0} className="h-2" />
            <div className={`mt-2 text-right text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {dealerStats?.monthlyProgress || 0}% raggiunto
            </div>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Sales Trend Chart */}
            <Chart
              title="Andamento Vendite"
              data={dealerStats?.monthlySalesData}
              darkMode={useDarkMode}
            />

            {/* Vehicle Model Distribution Chart */}
            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Distribuzione Modelli</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealerStats?.modelData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      animationDuration={1500}
                      label={(entry) => entry.name}
                    >
                      {dealerStats?.modelData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Quantità']}
                      contentStyle={{ 
                        backgroundColor: useDarkMode ? '#333' : 'white', 
                        border: useDarkMode ? '1px solid #555' : '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        color: useDarkMode ? '#fff' : 'inherit'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className={`p-4 mb-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Ordini Recenti</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Modello</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Stato</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data Ordine</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data Consegna</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerData?.orders?.slice(0, 5).map((order) => {
                    return (
                      <tr key={order.id} className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3">{order.vehicles?.model || 'N/A'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'processing' ? 'In Lavorazione' :
                             order.status === 'delivered' ? 'Consegnato' :
                             order.status === 'cancelled' ? 'Cancellato' : order.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3">
                          {order.deliverydate ? new Date(order.deliverydate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {(!dealerData?.orders || dealerData.orders.length === 0) && (
                    <tr>
                      <td colSpan={4} className={`py-4 text-center ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nessun ordine recente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        // ADMIN DASHBOARD
        <>
          <DashboardStats />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Chart 
              title="Inventory by Model" 
              data={mockModelData} 
              darkMode={useDarkMode}
            />
            <Chart 
              title="Sales by Dealer" 
              data={mockSalesByDealer}
              darkMode={useDarkMode}
            />
          </div>
          
          <div className="mt-6">
            <Chart 
              title="Monthly Sales" 
              data={mockMonthlySalesData}
              darkMode={useDarkMode}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className={`p-6 border transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${useDarkMode ? 'text-white' : ''}`}>Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Customer</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Model</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Status</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3">Giovanni Neri</td>
                      <td className="py-3">Cirelli Spyder</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          Delivered
                        </span>
                      </td>
                      <td className="py-3">Feb 10, 2024</td>
                    </tr>
                    <tr className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3">Antonio Russo</td>
                      <td className="py-3">Cirelli 500</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          Delivered
                        </span>
                      </td>
                      <td className="py-3">Dec 1, 2023</td>
                    </tr>
                    <tr>
                      <td className="py-3">Elena Conti</td>
                      <td className="py-3">Cirelli SUV</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                          Processing
                        </span>
                      </td>
                      <td className="py-3">Mar 1, 2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
            
            <Card className={`p-6 border transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${useDarkMode ? 'text-white' : ''}`}>Recent Quotes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Customer</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Model</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Status</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3">Luca Ferrari</td>
                      <td className="py-3">Cirelli 500</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                          Pending
                        </span>
                      </td>
                      <td className="py-3">Feb 20, 2024</td>
                    </tr>
                    <tr className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-3">Maria Verdi</td>
                      <td className="py-3">Cirelli Berlina</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          Approved
                        </span>
                      </td>
                      <td className="py-3">Mar 5, 2024</td>
                    </tr>
                    <tr>
                      <td className="py-3">Giovanni Neri</td>
                      <td className="py-3">Cirelli Spyder</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                          Converted
                        </span>
                      </td>
                      <td className="py-3">Jan 15, 2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
