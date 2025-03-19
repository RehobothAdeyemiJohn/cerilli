
import { supabase } from './client';
import { OrderDetails } from '@/types';

export const orderDetailsApi = {
  getAll: async (): Promise<OrderDetails[]> => {
    console.log("Fetching all order details from Supabase");
    
    try {
      const { data, error } = await supabase
        .from('order_details')
        .select('*');
      
      if (error) {
        console.error('Error fetching all order details:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No order details found in database");
        return [];
      }
      
      console.log("Raw order details data:", data);
      
      // Map data to OrderDetails objects
      const orderDetails = data.map(item => ({
        id: item.id,
        orderId: item.order_id,
        previousChassis: item.previous_chassis,
        chassis: item.chassis,
        isLicensable: item.is_licensable === true,
        hasProforma: item.has_proforma === true,
        isPaid: item.is_paid === true,
        paymentDate: item.payment_date,
        isInvoiced: item.is_invoiced === true,
        invoiceNumber: item.invoice_number,
        invoiceDate: item.invoice_date,
        hasConformity: item.has_conformity === true,
        fundingType: item.funding_type,
        transportCosts: item.transport_costs,
        restorationCosts: item.restoration_costs,
        odlGenerated: item.odl_generated === true,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      } as OrderDetails));
      
      console.log(`Retrieved ${orderDetails.length} order details:`, orderDetails);
      return orderDetails;
    } catch (error) {
      console.error('Unexpected error fetching all order details:', error);
      throw error;
    }
  },
  
  getByOrderId: async (orderId: string): Promise<OrderDetails | null> => {
    console.log("Fetching order details for order ID:", orderId);
    
    const { data, error } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Ensure boolean values are properly converted
    const orderDetails = {
      id: data.id,
      orderId: data.order_id,
      previousChassis: data.previous_chassis,
      chassis: data.chassis,
      isLicensable: data.is_licensable === true,
      hasProforma: data.has_proforma === true,
      isPaid: data.is_paid === true,
      paymentDate: data.payment_date,
      isInvoiced: data.is_invoiced === true,
      invoiceNumber: data.invoice_number,
      invoiceDate: data.invoice_date,
      hasConformity: data.has_conformity === true,
      fundingType: data.funding_type,
      transportCosts: data.transport_costs,
      restorationCosts: data.restoration_costs,
      odlGenerated: data.odl_generated === true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as OrderDetails;
    
    console.log("Fetched order details:", orderDetails);
    return orderDetails;
  },
  
  create: async (details: Omit<OrderDetails, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderDetails> => {
    console.log("Creating order details:", details);
    
    const { data, error } = await supabase
      .from('order_details')
      .insert({
        order_id: details.orderId,
        previous_chassis: details.previousChassis,
        chassis: details.chassis,
        is_licensable: details.isLicensable || false,
        has_proforma: details.hasProforma || false,
        is_paid: details.isPaid || false,
        payment_date: details.paymentDate,
        is_invoiced: details.isInvoiced || false,
        invoice_number: details.invoiceNumber,
        invoice_date: details.invoiceDate,
        has_conformity: details.hasConformity || false,
        funding_type: details.fundingType,
        transport_costs: details.transportCosts || 0,
        restoration_costs: details.restorationCosts || 0,
        odl_generated: details.odlGenerated || false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order details:', error);
      throw error;
    }
    
    // Ensure boolean values are properly converted
    const orderDetails = {
      id: data.id,
      orderId: data.order_id,
      previousChassis: data.previous_chassis,
      chassis: data.chassis,
      isLicensable: data.is_licensable === true,
      hasProforma: data.has_proforma === true,
      isPaid: data.is_paid === true,
      paymentDate: data.payment_date,
      isInvoiced: data.is_invoiced === true,
      invoiceNumber: data.invoice_number,
      invoiceDate: data.invoice_date,
      hasConformity: data.has_conformity === true,
      fundingType: data.funding_type,
      transportCosts: data.transport_costs,
      restorationCosts: data.restoration_costs,
      odlGenerated: data.odl_generated === true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as OrderDetails;
    
    // Update the order object to include order details
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', details.orderId)
        .single();
      
      if (orderData) {
        console.log('Creating order details and updating order:', orderDetails);
        await supabase
          .from('orders')
          .update({ details: orderDetails })
          .eq('id', details.orderId);
      }
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return orderDetails;
  },
  
  update: async (id: string, updates: Partial<OrderDetails>): Promise<OrderDetails> => {
    console.log("Updating order details:", updates);
    
    const dbUpdates: any = {
      previous_chassis: updates.previousChassis,
      chassis: updates.chassis,
      is_licensable: updates.isLicensable,
      has_proforma: updates.hasProforma,
      is_paid: updates.isPaid,
      payment_date: updates.paymentDate,
      is_invoiced: updates.isInvoiced,
      invoice_number: updates.invoiceNumber,
      invoice_date: updates.invoiceDate,
      has_conformity: updates.hasConformity,
      funding_type: updates.fundingType,
      transport_costs: updates.transportCosts,
      restoration_costs: updates.restorationCosts,
      odl_generated: updates.odlGenerated
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('order_details')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order details:', error);
      throw error;
    }
    
    // Ensure boolean values are properly converted
    const orderDetails = {
      id: data.id,
      orderId: data.order_id,
      previousChassis: data.previous_chassis,
      chassis: data.chassis,
      isLicensable: data.is_licensable === true,
      hasProforma: data.has_proforma === true,
      isPaid: data.is_paid === true,
      paymentDate: data.payment_date,
      isInvoiced: data.is_invoiced === true,
      invoiceNumber: data.invoice_number,
      invoiceDate: data.invoice_date,
      hasConformity: data.has_conformity === true,
      fundingType: data.funding_type,
      transportCosts: data.transport_costs,
      restorationCosts: data.restoration_costs,
      odlGenerated: data.odl_generated === true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as OrderDetails;
    
    // Update the order object to include updated order details
    try {
      if (orderDetails.orderId) {
        console.log('Updating order with details:', orderDetails);
        
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderDetails.orderId)
          .single();
          
        if (orderData) {
          await supabase
            .from('orders')
            .update({ details: orderDetails })
            .eq('id', orderDetails.orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return orderDetails;
  },
  
  generateODL: async (id: string): Promise<OrderDetails> => {
    console.log("Generating ODL for order details ID:", id);
    
    const { data, error } = await supabase
      .from('order_details')
      .update({ odl_generated: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error generating ODL for order details:', error);
      throw error;
    }
    
    // Ensure boolean values are properly converted
    const orderDetails = {
      id: data.id,
      orderId: data.order_id,
      previousChassis: data.previous_chassis,
      chassis: data.chassis,
      isLicensable: data.is_licensable === true,
      hasProforma: data.has_proforma === true,
      isPaid: data.is_paid === true,
      paymentDate: data.payment_date,
      isInvoiced: data.is_invoiced === true,
      invoiceNumber: data.invoice_number,
      invoiceDate: data.invoice_date,
      hasConformity: data.has_conformity === true,
      fundingType: data.funding_type,
      transportCosts: data.transport_costs,
      restorationCosts: data.restoration_costs,
      odlGenerated: data.odl_generated === true,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as OrderDetails;
    
    // Update the order object to include updated order details
    try {
      if (orderDetails.orderId) {
        console.log('Setting ODL generated flag and updating order:', orderDetails);
        
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderDetails.orderId)
          .single();
          
        if (orderData) {
          await supabase
            .from('orders')
            .update({ details: orderDetails })
            .eq('id', orderDetails.orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return orderDetails;
  }
};
