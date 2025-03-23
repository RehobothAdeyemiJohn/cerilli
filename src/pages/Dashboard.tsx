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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateDaysInStock } from '@/lib/utils';
import { Vehicle } from '@/types';
import {
  Car,
  Clock,
  FileText,
  ShoppingCart,
  TrendingUp,
  Target,
  Percent,
  CreditCard,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import DealerStockCountCard from '@/components/dashboard/DealerStockCountCard';
import AverageStockDaysCard from '@/components/dashboard/AverageStockDaysCard';
import { DealerAnalysis } from '@/components/dashboard/Dashboard';

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

      let vehiclesQuery = supabase.from('vehicles')
        .select('*')
        .neq('location', 'Stock Virtuale')
        .in('status', ['available', 'reserved']);

      let ordersQuery = supabase.from('orders').select('*, vehicles(*), dealers(*)');
      let quotesQuery = supabase.from('quotes').select('*, vehicles(*), dealers(*)');

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

      const { data: allVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .neq('location', 'Stock Virtuale')
        .in('status', ['available', 'reserved']);

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

    const totalInvoiced = allOrders.reduce((sum, order) => {
      const price = order.vehicles?.price || 0;
      return sum + price;
    }, 0);

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
        trim: v.trim || '',
        fuelType: v.fueltype || '',
        exteriorColor: v.exteriorcolor || '',
        accessories: v.accessories || [],
        price: v.price || 0,
        location: v.location,
        status: v.status || 'available',
        dateAdded: v.dateadded,
        telaio: v.telaio || ''
      } as Vehicle))
    };
  }, [dealerData]);

  const adminStats = React.useMemo(() => {
    if (!adminData) return null;

    const { vehicles, orders, quotes, dealers, allVehicles } = adminData;

    const daysInStockValues = vehicles.map(v => calculateDaysInStock(v.dateadded));
    const avgDaysInStock = daysInStockValues.length > 0
      ? Math.round(daysInStockValues.reduce((sum, days) => sum + days, 0) / daysInStockValues.length)
      : 0;

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

    const currentMonth = new Date().getMonth();
    const ordersThisMonth = orders.filter(o => {
      const orderDate = new Date(o.orderdate);
      return orderDate.getMonth() === currentMonth;
    });

    const monthlyTarget = 5;
    const monthlyProgress = Math.min(100, Math.round((ordersThisMonth.length / monthlyTarget) * 100));

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
        trim: v.trim || '',
        fuelType: v.fueltype || '',
        exteriorColor: v.exteriorcolor || '',
        accessories: v.accessories || [],
        price: v.price || 0,
        location: v.location,
        status: v.status || 'available',
        dateAdded: v.dateadded,
        telaio: v.telaio || ''
      } as Vehicle)),
      orders,
      monthlyTarget,
      monthlyProgress
    };
  }, [adminData]);

  const COLORS = ['#4ADE80', '#818CF8', '#FB7185', '#FACC15', '#60A5FA', '#C084FC'];

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
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
        <h1 className="text-2xl font-bold">Dashboard{isDealer ? 'Concessionario' : 'Admin'}</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DealerStockCountCard dealerName={user?.dealerName || 'CMC'} darkMode={useDarkMode} />
            <AverageStockDaysCard dealerName={user?.dealerName || 'CMC'} darkMode={useDarkMode} />
            <Card className={`overflow-hidden ${useDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className={useDarkMode ? 'text-white' : ''}>Auto Vendute</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{dealerStats?.ordersCount || 0}</p>
                    <p className="text-sm text-gray-500">Ordini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-1">
              {dealerStats?.vehicles && <HighInventoryVehicles vehicles={dealerStats.vehicles} darkMode={useDarkMode} />}
            </div>

            <div className="md:col-span-1">
              <Card className={`overflow-hidden ${useDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={useDarkMode ? 'text-white' : ''}>Fatturato Totale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{formatCurrency(dealerStats?.totalInvoiced || 0)}</p>
                      <p className="text-sm text-gray-500">Fatturato</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className={`p-4 mb-6 mt-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
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

          <Card className={`p-4 mb-6 mt-6 transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Ordini  Recenti</h3>
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
                        <td className="py-3">{order.vehicles?.model || 'N/A'} hhr</td>

                        <td className="py-3">{order.customername || 'N/A'}</td>

                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
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
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-1">
              {adminStats?.vehicles && <HighInventoryVehicles vehicles={adminStats.vehicles} darkMode={useDarkMode} />}
            </div>
            <div className="md:col-span-1">
              <DealerCreditList darkMode={useDarkMode} />
            </div>
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
                {adminStats?.orders?.filter(o => new Date(o.orderdate).getMonth() === new Date().getMonth()).length || 0} auto vendute
              </span>
              <span className={`${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Obiettivo: {adminStats?.monthlyTarget || 5} auto
              </span>
            </div>
            <Progress value={adminStats?.monthlyProgress || 0} className="h-2" />
            <div className={`mt-2 text-right text-sm ${useDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {adminStats?.monthlyProgress || 0}% raggiunto
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className={`p-4 overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${useDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Andamento Vendite</h3>
              </div>
              <div className="h-[300px] mt-4">
                {adminStats?.monthlySalesData && adminStats.monthlySalesData.some(m => m.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adminStats.monthlySalesData}>
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
                        formatter={(value: any) => {
                          return [formatCurrency(Number(value)), 'Fatturato'];
                        }}
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
                        name="Fatturato"
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
                <h3 className={`text-lg font-medium ${useDarkMode ? 'text-white' : ''}`}>Vendite per Concessionario</h3>
              </div>
              <div className="h-[300px] mt-4">
                {adminStats?.salesByDealer && adminStats.salesByDealer.some(item => Number(item.value) > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={adminStats.salesByDealer}
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
                        {adminStats.salesByDealer.map((entry, index) => (
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
                    Nessuna vendita registrata
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
