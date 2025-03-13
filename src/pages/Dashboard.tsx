
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
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;
  
  // Use state to force re-render when component mounts or route changes
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Reset the key whenever the component mounts or remounts
  useEffect(() => {
    setRenderKey(Date.now().toString());
  }, []);

  // Query to get dealer-specific data
  const { data: dealerData, isLoading: loadingDealerData } = useQuery({
    queryKey: ['dealerDashboard', dealerId, selectedPeriod],
    queryFn: async () => {
      if (!isDealer || !dealerId) return null;
      
      // Get dealer info
      const { data: dealer } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .single();
      
      // Get vehicles for this dealer (reserved or ordered by this dealer)
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('reservedby', dealerId);
      
      // Get quotes for this dealer
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .eq('dealerid', dealerId);
      
      // Get orders for this dealer
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('dealerid', dealerId);
      
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
    const today = new Date();
    const daysInStock = vehicles.map(v => {
      const dateAdded = new Date(v.dateadded);
      return Math.floor((today.getTime() - dateAdded.getTime()) / (1000 * 3600 * 24));
    });
    const avgDaysInStock = daysInStock.length > 0 
      ? Math.round(daysInStock.reduce((sum, days) => sum + days, 0) / daysInStock.length) 
      : 0;
    
    // Calculate conversion rate
    const conversionRate = quotes.length > 0 
      ? Math.round((orders.length / quotes.length) * 100) 
      : 0;
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const ordersThisMonth = orders.filter(o => {
      const orderDate = new Date(o.orderdate);
      return orderDate.getMonth() === currentMonth;
    });
    
    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce((sum, order) => {
      const vehicle = vehicles.find(v => v.id === order.vehicleid);
      return sum + (vehicle?.price || 0);
    }, 0);
    
    // Calculate monthly revenue
    const monthlyRevenue = ordersThisMonth.reduce((sum, order) => {
      const vehicle = vehicles.find(v => v.id === order.vehicleid);
      return sum + (vehicle?.price || 0);
    }, 0);
    
    // Set target and calculate progress
    const monthlyTarget = 100000; // Example target: €100,000
    const targetProgress = Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100));
    
    // Generate monthly sales data for chart
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const monthlySalesData = monthNames.map((month, idx) => {
      const ordersInMonth = orders.filter(o => {
        const orderDate = new Date(o.orderdate);
        return orderDate.getMonth() === idx && orderDate.getFullYear() === currentYear;
      });
      
      const revenue = ordersInMonth.reduce((sum, order) => {
        const vehicle = vehicles.find(v => v.id === order.vehicleid);
        return sum + (vehicle?.price || 0);
      }, 0);
      
      return {
        name: month,
        value: revenue
      };
    });
    
    // Generate model distribution data
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
    
    return {
      vehiclesCount: vehicles.length,
      quotesCount: quotes.length,
      ordersCount: orders.length,
      avgDaysInStock,
      conversionRate,
      creditLimit: dealer.credit_limit || 0,
      totalRevenue,
      monthlyRevenue,
      monthlyTarget,
      targetProgress,
      monthlySalesData,
      modelData
    };
  }, [dealerData]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#6E59A5'];

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
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
    <div className="container mx-auto py-6 px-4 animate-fade-in" key={renderKey}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard {isDealer ? 'Concessionario' : 'Admin'}</h1>
        <div className="mt-4 md:mt-0">
          <Tabs
            defaultValue="month"
            value={selectedPeriod}
            onValueChange={handlePeriodChange}
            className="w-[250px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Settimana</TabsTrigger>
              <TabsTrigger value="month">Mese</TabsTrigger>
              <TabsTrigger value="year">Anno</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isDealer ? (
        // DEALER DASHBOARD
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Auto a Stock</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.vehiclesCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Giorni Medi in Giacenza</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.avgDaysInStock || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Preventivi</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.quotesCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-indigo-100">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Contratti</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.ordersCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Additional KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">% di Conversione</p>
                  <h3 className="text-2xl font-bold mt-1">{dealerStats?.conversionRate || 0}%</h3>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Percent className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Plafond Disponibile</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(dealerStats?.creditLimit || 0)}</h3>
                </div>
                <div className="p-2 rounded-full bg-emerald-100">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Vendite del Mese</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(dealerStats?.monthlyRevenue || 0)}</h3>
                </div>
                <div className="p-2 rounded-full bg-rose-100">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Target Progress */}
          <Card className="p-4 mb-6 hover-scale">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Obiettivo Mensile</h3>
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{formatCurrency(dealerStats?.monthlyRevenue || 0)}</span>
              <span className="text-gray-500">{formatCurrency(dealerStats?.monthlyTarget || 0)}</span>
            </div>
            <Progress value={dealerStats?.targetProgress || 0} className="h-2" />
            <div className="mt-2 text-right text-sm text-gray-500">
              {dealerStats?.targetProgress || 0}% raggiunto
            </div>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Sales Trend Chart */}
            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Andamento Vendite</h3>
                <div className="p-2 rounded-full bg-indigo-100">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dealerStats?.monthlySalesData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Vendite"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Vehicle Model Distribution Chart */}
            <Card className="p-4 hover-scale">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Distribuzione Modelli</h3>
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
                    <Tooltip formatter={(value) => [value, 'Quantità']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="p-4 mb-6 hover-scale">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ordini Recenti</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Modello</th>
                    <th className="pb-2 font-medium">Stato</th>
                    <th className="pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerData?.orders?.slice(0, 5).map((order) => {
                    const vehicle = dealerData.vehicles.find(v => v.id === order.vehicleid);
                    return (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-3">{order.customername || 'N/A'}</td>
                        <td className="py-3">{vehicle?.model || 'N/A'}</td>
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
                      </tr>
                    );
                  })}
                  {(!dealerData?.orders || dealerData.orders.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
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
              data={dealerData?.modelData || []} 
              color="#3B82F6"
            />
            <Chart 
              title="Sales by Dealer" 
              data={dealerData?.salesByDealer || []} 
              color="#10B981"
            />
          </div>
          
          <div className="mt-6">
            <Chart 
              title="Monthly Sales" 
              data={dealerData?.monthlySalesData || []} 
              color="#6366F1"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Model</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">Giovanni Neri</td>
                      <td className="py-3">Cirelli Spyder</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          Delivered
                        </span>
                      </td>
                      <td className="py-3">Feb 10, 2024</td>
                    </tr>
                    <tr className="border-b border-gray-100">
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
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium mb-4">Recent Quotes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Model</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">Luca Ferrari</td>
                      <td className="py-3">Cirelli 500</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                          Pending
                        </span>
                      </td>
                      <td className="py-3">Feb 20, 2024</td>
                    </tr>
                    <tr className="border-b border-gray-100">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
