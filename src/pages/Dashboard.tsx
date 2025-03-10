
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import Chart from '@/components/dashboard/Chart';
import { 
  dashboardStats, 
  inventoryByModel, 
  salesByDealer, 
  salesByMonth 
} from '@/data/mockData';

const Dashboard = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <Tabs defaultValue="month" className="w-[250px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <DashboardStats stats={dashboardStats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Chart 
          title="Inventory by Model" 
          data={inventoryByModel} 
          color="#3B82F6"
        />
        <Chart 
          title="Sales by Dealer" 
          data={salesByDealer} 
          color="#10B981"
        />
      </div>
      
      <div className="mt-6">
        <Chart 
          title="Monthly Sales" 
          data={salesByMonth} 
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
    </div>
  );
};

export default Dashboard;
