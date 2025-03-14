
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import Chart from '@/components/dashboard/Chart';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import HighInventoryVehicles from '@/components/dashboard/HighInventoryVehicles';
import DealerCreditList from '@/components/dealers/DealerCreditList';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/api/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateDaysInStock } from '@/lib/utils';
import { 
  Car, 
  Clock, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Target, 
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
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;
  
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [useDarkMode, setUseDarkMode] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  
  useEffect(() => {
    setRenderKey(Date.now().toString());
  }, []);

  const { data: dealerData, isLoading: loadingDealerData } = useQuery({
    queryKey: ['dealerDashboard', dealerId, selectedPeriod, dateRange],
    queryFn: async () => {
      if (!isDealer || !dealerId) return null;
      
      console.log('Fetching dealer dashboard data for dealerId:', dealerId);
      
      const { data: dealer } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .single();
      
      let vehiclesQuery = supabase.from('vehicles').select('*').eq('reservedby', dealerId);
      
      let ordersQuery = supabase
        .from('orders')
        .select('*, vehicles(*)')
        .eq('dealerid', dealerId)
        .order('orderdate', { ascending: false });
      
      let quotesQuery = supabase
        .from('quotes')
        .select('*, vehicles(*)')
        .eq('dealerid', dealerId)
        .order('createdat', { ascending: false });
      
      // Apply date filters if specified
      if (dateRange.from && dateRange.to) {
        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();
        
        ordersQuery = ordersQuery.gte('orderdate', fromDate).lte('orderdate', toDate);
        quotesQuery = quotesQuery.gte('createdat', fromDate).lte('createdat', toDate);
      } else if (selectedPeriod !== 'all') {
        let startDate = new Date();
        
        if (selectedPeriod === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (selectedPeriod === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (selectedPeriod === 'year') {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        const startDateStr = startDate.toISOString();
        
        ordersQuery = ordersQuery.gte('orderdate', startDateStr);
        quotesQuery = quotesQuery.gte('createdat', startDateStr);
      }
      
      const { data: vehicles } = await vehiclesQuery;
      const { data: orders } = await ordersQuery;
      const { data: quotes } = await quotesQuery.limit(5);
      const { data: allOrders } = await ordersQuery;
      
      return {
        dealer,
        vehicles: vehicles || [],
        quotes: quotes || [],
        orders: orders || [],
        allOrders: allOrders || []
      };
    },
    enabled: isDealer && !!dealerId,
  });

  const { data: adminData, isLoading: loadingAdminData } = useQuery({
    queryKey: ['adminDashboard', selectedPeriod, dateRange],
    queryFn: async () => {
      if (isDealer) return null;
      
      console.log('Fetching admin dashboard data');
      
      let vehiclesQuery = supabase.from('vehicles').select('*').neq('location', 'Stock Virtuale');
      let ordersQuery = supabase.from('orders').select('*, vehicles(*), dealers(*)');
      let quotesQuery = supabase.from('quotes').select('*, vehicles(*), dealers(*)');
      
      // Apply date filters if specified
      if (dateRange.from && dateRange.to) {
        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();
        
        ordersQuery = ordersQuery.gte('orderdate', fromDate).lte('orderdate', toDate);
        quotesQuery = quotesQuery.gte('createdat', fromDate).lte('createdat', toDate);
      } else if (selectedPeriod !== 'all') {
        let startDate = new Date();
        
        if (selectedPeriod === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (selectedPeriod === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (selectedPeriod === 'year') {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        const startDateStr = startDate.toISOString();
        
        ordersQuery = ordersQuery.gte('orderdate', startDateStr);
        quotesQuery = quotesQuery.gte('createdat', startDateStr);
      }
      
      const { data: vehicles } = await vehiclesQuery;
      const { data: orders } = await ordersQuery;
      const { data: quotes } = await quotesQuery;
      const { data: dealers } = await supabase.from('dealers').select('*');
      
      // Fetch all vehicles for inventory analysis
      const { data: allVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .neq('location', 'Stock Virtuale');
      
      return {
        vehicles: vehicles || [],
        orders: orders || [],
        quotes: quotes || [],
        dealers: dealers || [],
        allVehicles: allVehicles || []
      };
    },
    enabled: !isDealer,
  });

  const dealerStats = React.useMemo(() => {
    if (!dealerData) return null;
    
    const { vehicles, quotes, orders, allOrders, dealer } = dealerData;
    
    // Filter out virtual stock for average days calculation
    const cmcVehicles = vehicles.filter(v => v.location !== 'Stock Virtuale');
    
    const daysInStockValues = cmcVehicles.map(v => calculateDaysInStock(v.dateadded));
    const avgDaysInStock = daysInStockValues.length > 0 
      ? Math.round(daysInStockValues.reduce((sum, days) => sum + days, 0) / daysInStockValues.length) 
      : 0;
    
    const conversionRate = quotes.length > 0 
      ? Math.round((orders.length / quotes.length) * 100) 
      : 0;
    
    const currentMonth = new Date().getMonth();
    const ordersThisMonth = allOrders.filter(o => {
      const orderDate = new Date(o.orderdate);
      return orderDate.getMonth() === currentMonth;
    });
    
    const monthlyTarget = 5;
    const monthlyProgress = Math.min(100, Math.round((ordersThisMonth.length / monthlyTarget) * 100));
    
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const monthlySalesData = monthNames.map((month, idx) => {
      const ordersInMonth = allOrders.filter(o => {
        const orderDate = new Date(o.orderdate);
        return orderDate.getMonth() === idx && orderDate.getFullYear() === currentYear;
      });
      
      return {
        name: month,
        value: ordersInMonth.length
      };
    });
    
    // Calculate total invoiced value
    const totalInvoiced = allOrders.reduce((sum, order) => {
      const price = order.vehicles?.price || 0;
      return sum + price;
    }, 0);
    
    // Get model distribution for non-virtual stock
    const modelDistribution = cmcVehicles.reduce((acc, vehicle) => {
      const model = vehicle.model;
      if (!acc[model]) acc[model] = 0;
      acc[model]++;
      return acc;
    }, {});
    
    const modelData = Object.entries(modelDistribution).map(([model, count]) => ({
      name: model,
      value: count
    }));
    
    if (modelData.length === 0) {
      modelData.push({ name: 'Nessun veicolo', value: 0 });
    }
    
    return {
      vehiclesCount: cmcVehicles.length,
      quotesCount: quotes.length,
      ordersCount: orders.length,
      avgDaysInStock,
      conversionRate,
      creditLimit: dealer?.credit_limit || 0,
      monthlyTarget,
      monthlyProgress,
      monthlySalesData,
      modelData,
      totalInvoiced,
      recentOrders: orders.slice(0, 5),
      recentQuotes: quotes,
      vehicles: cmcVehicles.map(v => ({
        id: v.id,
        model: v.model,
        telaio: v.telaio,
        dateAdded: v.dateadded,
        price: v.price,
        location: v.location
      }))
    };
  }, [dealerData]);

  const adminStats = React.useMemo(() => {
    if (!adminData) return null;
    
    const { vehicles, orders, quotes, dealers, allVehicles } = adminData;
    
    // Calculate average days in stock for CMC vehicles
    const daysInStockValues = vehicles.map(v => calculateDaysInStock(v.dateadded));
    const avgDaysInStock = daysInStockValues.length > 0 
      ? Math.round(daysInStockValues.reduce((sum, days) => sum + days, 0) / daysInStockValues.length) 
      : 0;
    
    // Calculate total invoiced value
    const totalInvoiced = orders.reduce((sum, order) => {
      const price = order.vehicles?.price || 0;
      return sum + price;
    }, 0);
    
    const modelCounts = vehicles.reduce((acc, vehicle) => {
      const model = vehicle.model;
      if (!acc[model]) acc[model] = 0;
      acc[model]++;
      return acc;
    }, {});
    
    const inventoryByModel = Object.entries(modelCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    const dealerSales = orders.reduce((acc, order) => {
      const dealerName = order.dealers?.companyname || 'Unknown';
      if (!acc[dealerName]) acc[dealerName] = 0;
      acc[dealerName]++;
      return acc;
    }, {});
    
    const salesByDealer = Object.entries(dealerSales).map(([name, value]) => ({
      name,
      value
    }));
    
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const monthlySalesData = monthNames.map((month, idx) => {
      const ordersInMonth = orders.filter(o => {
        const orderDate = new Date(o.orderdate);
        return orderDate.getMonth() === idx && orderDate.getFullYear() === currentYear;
      });
      
      const totalValue = ordersInMonth.reduce((sum, order) => {
        const vehiclePrice = order.vehicles?.price || 0;
        return sum + vehiclePrice;
      }, 0);
      
      return {
        name: month,
        value: totalValue
      };
    });
    
    const recentOrders = [...orders].sort((a, b) => {
      return new Date(b.orderdate).getTime() - new Date(a.orderdate).getTime();
    }).slice(0, 5);
    
    const recentQuotes = [...quotes].sort((a, b) => {
      return new Date(b.createdat).getTime() - new Date(a.createdat).getTime();
    }).slice(0, 5);
    
    return {
      inventoryByModel,
      salesByDealer,
      monthlySalesData,
      recentOrders,
      recentQuotes,
      vehiclesCount: vehicles.length,
      dealersCount: dealers.length,
      quotesCount: quotes.length,
      ordersCount: orders.length,
      avgDaysInStock,
      totalInvoiced,
      vehicles: allVehicles.map(v => ({
        id: v.id,
        model: v.model,
        telaio: v.telaio,
        dateAdded: v.dateadded,
        price: v.price,
        location: v.location
      }))
    };
  }, [adminData]);

  const COLORS = ['#4ADE80', '#818CF8', '#FB7185', '#FACC15', '#60A5FA', '#C084FC'];

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Clear date range when switching periods
    setDateRange({ from: undefined, to: undefined });
  };
  
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

  const isLoading = (isDealer && loadingDealerData) || (!isDealer && loadingAdminData);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 px-4 animate-fade-in ${useDarkMode ? 'bg-gray-900 text-white' : ''}`} key={renderKey}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard {isDealer ? 'Concessionario' : 'Admin'}</h1>
        <div className="mt-4 md:mt-0 flex items-center gap-4 flex-wrap">
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
            <TabsList className={`grid w-full grid-cols-4 ${useDarkMode ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="week" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Settimana</TabsTrigger>
              <TabsTrigger value="month" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Mese</TabsTrigger>
              <TabsTrigger value="year" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Anno</TabsTrigger>
              <TabsTrigger value="all" className={useDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>Tutto</TabsTrigger>
            </TabsList>
          </Tabs>
          <DateRangePicker 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
            darkMode={useDarkMode} 
          />
        </div>
      </div>
      
      {isDealer ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto a Stock CMC</p>
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
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fatturato Totale</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(dealerStats?.totalInvoiced || 0)}</h3>
                </div>
                <div className="p-2 rounded-full bg-rose-100">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </Card>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Andamento Vendite</h3>
              </div>
              <div className="h-[200px] mt-4">
                {dealerStats?.monthlySalesData && dealerStats.monthlySalesData.some(m => m.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dealerStats.monthlySalesData}>
                      <XAxis 
                        dataKey="name" 
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Quantità']}
                        contentStyle={{ 
                          backgroundColor: useDarkMode ? '#333' : 'white', 
                          border: useDarkMode ? '1px solid #555' : '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          color: useDarkMode ? '#fff' : 'inherit'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Quantità"
                        radius={[4, 4, 0, 0]}
                        fill="#4ADE80"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </div>
            </Card>

            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Distribuzione Modelli</h3>
              </div>
              <div className="h-[200px] mt-4">
                {dealerStats?.modelData && dealerStats.modelData.some(item => Number(item.value) > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dealerStats.modelData}
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
                        {dealerStats.modelData.map((entry, index) => (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun veicolo in stock
                  </div>
                )}
              </div>
            </Card>
          </div>

          {dealerStats?.vehicles && <HighInventoryVehicles vehicles={dealerStats.vehicles} darkMode={useDarkMode} />}

          <Card className={`p-4 mb-6 mt-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Ordini Recenti</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Modello</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Cliente</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Stato</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data Ordine</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data Consegna</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerStats?.recentOrders?.length > 0 ? (
                    dealerStats.recentOrders.map((order) => (
                      <tr key={order.id} className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3">{order.vehicles?.model || 'N/A'}</td>
                        <td className="py-3">{order.customername || 'N/A'}</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={`py-4 text-center ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nessun ordine recente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className={`p-4 mb-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Preventivi Recenti</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Modello</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Cliente</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Prezzo</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Stato</th>
                    <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerStats?.recentQuotes?.length > 0 ? (
                    dealerStats.recentQuotes.map((quote) => (
                      <tr key={quote.id} className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="py-3">{quote.vehicles?.model || 'N/A'}</td>
                        <td className="py-3">{quote.customername || 'N/A'}</td>
                        <td className="py-3">{formatCurrency(quote.finalprice || 0)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {quote.status === 'pending' ? 'In Attesa' :
                             quote.status === 'approved' ? 'Approvato' :
                             quote.status === 'rejected' ? 'Rifiutato' :
                             quote.status === 'converted' ? 'Convertito' : quote.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {quote.createdat ? new Date(quote.createdat).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={`py-4 text-center ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nessun preventivo recente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto a Stock CMC</p>
                  <h3 className="text-2xl font-bold mt-1">{adminStats?.vehiclesCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Car className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </Card>
            
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Concessionari</p>
                  <h3 className="text-2xl font-bold mt-1">{adminStats?.dealersCount || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </Card>
            
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Giorni Medi Giacenza</p>
                  <h3 className="text-2xl font-bold mt-1">{adminStats?.avgDaysInStock || 0}</h3>
                </div>
                <div className="p-2 rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </Card>
            
            <Card className={`p-4 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fatturato Totale</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(adminStats?.totalInvoiced || 0)}</h3>
                </div>
                <div className="p-2 rounded-full bg-rose-100">
                  <CreditCard className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Chart title="Inventario per Modello" excludeVirtualStock={true} darkMode={useDarkMode} />
            
            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Vendite per Concessionario</h3>
              </div>
              <div className="h-[200px] mt-4">
                {adminStats?.salesByDealer && adminStats.salesByDealer.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adminStats.salesByDealer}>
                      <XAxis
                        dataKey="name" 
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Vendite']}
                        contentStyle={{ 
                          backgroundColor: useDarkMode ? '#333' : 'white', 
                          border: useDarkMode ? '1px solid #555' : '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          color: useDarkMode ? '#fff' : 'inherit'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Vendite"
                        radius={[4, 4, 0, 0]}
                        fill="#818CF8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </div>
            </Card>
            
            <DealerCreditList darkMode={useDarkMode} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Vendite Mensili</h3>
              </div>
              <div className="h-[200px] mt-4">
                {adminStats?.monthlySalesData && adminStats.monthlySalesData.some(m => m.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={adminStats.monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={useDarkMode ? "#333" : "#eee"} />
                      <XAxis
                        dataKey="name" 
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={useDarkMode ? "#888888" : "#888888"}
                        fontSize={12}
                        tickFormatter={(value) => `€${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value) => [`€${value.toLocaleString()}`, 'Valore']}
                        contentStyle={{ 
                          backgroundColor: useDarkMode ? '#333' : 'white', 
                          border: useDarkMode ? '1px solid #555' : '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          color: useDarkMode ? '#fff' : 'inherit'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Valore Vendite"
                        stroke="#FB7185"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </div>
            </Card>
            
            {adminStats?.vehicles && <HighInventoryVehicles vehicles={adminStats.vehicles} darkMode={useDarkMode} />}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className={`p-6 border transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${useDarkMode ? 'text-white' : ''}`}>Ordini Recenti</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Cliente</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Modello</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Concessionario</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Stato</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStats?.recentOrders?.length > 0 ? (
                      adminStats.recentOrders.map((order) => (
                        <tr key={order.id} className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-3">{order.customername}</td>
                          <td className="py-3">{order.vehicles?.model || 'N/A'}</td>
                          <td className="py-3">{order.dealers?.companyname || 'N/A'}</td>
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
                          <td className="py-3">{new Date(order.orderdate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={`py-4 text-center ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Nessun ordine recente
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <Card className={`p-6 border transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-medium mb-4 ${useDarkMode ? 'text-white' : ''}`}>Preventivi Recenti</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Cliente</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Modello</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Concessionario</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Stato</th>
                      <th className={`pb-2 font-medium ${useDarkMode ? 'text-gray-300' : ''}`}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStats?.recentQuotes?.length > 0 ? (
                      adminStats.recentQuotes.map((quote) => (
                        <tr key={quote.id} className={`border-b ${useDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-3">{quote.customername}</td>
                          <td className="py-3">{quote.vehicles?.model || 'N/A'}</td>
                          <td className="py-3">{quote.dealers?.companyname || 'N/A'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              quote.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                              quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                              quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {quote.status === 'pending' ? 'In Attesa' :
                               quote.status === 'approved' ? 'Approvato' :
                               quote.status === 'rejected' ? 'Rifiutato' :
                               quote.status === 'converted' ? 'Convertito' : quote.status}
                            </span>
                          </td>
                          <td className="py-3">{new Date(quote.createdat).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={`py-4 text-center ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Nessun preventivo recente
                        </td>
                      </tr>
                    )}
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
