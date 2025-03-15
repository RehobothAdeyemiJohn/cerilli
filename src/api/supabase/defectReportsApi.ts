
import { supabase } from './client';
import { DefectReport, DefectReportStats } from '@/types';

// Helper function to check authentication and get session
const getAuthenticatedSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    console.error('Authentication error:', error?.message || 'No active session found');
    throw new Error('Authentication error: ' + (error?.message || 'Sessione non valida. Effettua il login.'));
  }
  
  return data.session;
};

export const defectReportsApi = {
  async getAll() {
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching defect reports:', error);
      throw error;
    }

    return data as DefectReport[];
  },

  async getById(id: string) {
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching defect report with id ${id}:`, error);
      throw error;
    }

    return data as DefectReport;
  },

  async getByDealerId(dealerId: string) {
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching defect reports for dealer ${dealerId}:`, error);
      throw error;
    }

    return data as DefectReport[];
  },

  async create(report: Omit<DefectReport, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) {
    console.log("Creating defect report with data:", report);
    
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    // Make sure we have all required fields and they are in the correct format
    const payload = {
      dealer_id: report.dealerId,
      dealer_name: report.dealerName,
      vehicle_id: report.vehicleId || null,
      email: report.email || '',
      status: report.status || 'Aperta',
      reason: report.reason,
      description: report.description,
      vehicle_receipt_date: report.vehicleReceiptDate,
      repair_cost: report.repairCost || 0,
      approved_repair_value: report.approvedRepairValue || 0,
      spare_parts_request: report.sparePartsRequest || '',
      transport_document_url: report.transportDocumentUrl || '',
      photo_report_urls: report.photoReportUrls || [],
      repair_quote_url: report.repairQuoteUrl || '',
      admin_notes: report.adminNotes || ''
    };
    
    console.log("Submitting payload to Supabase:", payload);
    
    try {
      const { data, error } = await supabase
        .from('defect_reports')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error creating defect report:', error);
        console.error('Error details:', error.details, error.message, error.hint);
        throw error;
      }

      console.log("Created defect report:", data);
      return data as DefectReport;
    } catch (error) {
      console.error('Error in defect report creation:', error);
      throw error;
    }
  },

  async update(id: string, report: Partial<DefectReport>) {
    console.log("Updating defect report with id:", id, "and data:", report);
    
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    // Format all fields correctly for the database
    const payload: Record<string, any> = {};
    
    if (report.dealerId !== undefined) payload.dealer_id = report.dealerId;
    if (report.dealerName !== undefined) payload.dealer_name = report.dealerName;
    if (report.vehicleId !== undefined) payload.vehicle_id = report.vehicleId;
    if (report.email !== undefined) payload.email = report.email;
    if (report.status !== undefined) payload.status = report.status;
    if (report.reason !== undefined) payload.reason = report.reason;
    if (report.description !== undefined) payload.description = report.description;
    if (report.vehicleReceiptDate !== undefined) payload.vehicle_receipt_date = report.vehicleReceiptDate;
    if (report.repairCost !== undefined) payload.repair_cost = report.repairCost;
    if (report.approvedRepairValue !== undefined) payload.approved_repair_value = report.approvedRepairValue;
    if (report.sparePartsRequest !== undefined) payload.spare_parts_request = report.sparePartsRequest;
    if (report.transportDocumentUrl !== undefined) payload.transport_document_url = report.transportDocumentUrl;
    if (report.photoReportUrls !== undefined) payload.photo_report_urls = report.photoReportUrls;
    if (report.repairQuoteUrl !== undefined) payload.repair_quote_url = report.repairQuoteUrl;
    if (report.adminNotes !== undefined) payload.admin_notes = report.adminNotes;
    if (report.paymentDate !== undefined) payload.payment_date = report.paymentDate;
    
    console.log("Submitting update payload to Supabase:", payload);
    
    try {
      const { data, error } = await supabase
        .from('defect_reports')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating defect report with id ${id}:`, error);
        console.error('Error details:', error.details, error.message, error.hint);
        throw error;
      }

      console.log("Updated defect report:", data);
      return data as DefectReport;
    } catch (error) {
      console.error('Error in defect report update:', error);
      throw error;
    }
  },

  async delete(id: string) {
    // Ensure user is authenticated before proceeding
    await getAuthenticatedSession();
    
    const { error } = await supabase
      .from('defect_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting defect report with id ${id}:`, error);
      throw error;
    }

    return true;
  },

  async getStats(): Promise<DefectReportStats> {
    // Ensure user is authenticated before proceeding
    try {
      await getAuthenticatedSession();
      
      // For open reports count
      const { count: openCount, error: openError } = await supabase
        .from('defect_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Aperta');

      // For closed reports count
      const { count: closedCount, error: closedError } = await supabase
        .from('defect_reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Approvata', 'Approvata Parzialmente', 'Respinta']);

      // For approved reports count
      const { count: approvedCount, error: approvedError } = await supabase
        .from('defect_reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Approvata', 'Approvata Parzialmente']);

      // For paid reports
      const { data: paidReports, error: paidError } = await supabase
        .from('defect_reports')
        .select('approved_repair_value')
        .not('payment_date', 'is', null);

      if (openError || closedError || paidError || approvedError) {
        console.error('Error fetching defect report stats:', openError || closedError || paidError || approvedError);
        throw openError || closedError || paidError || approvedError;
      }

      const totalPaid = paidReports?.reduce((sum, report) => sum + (report.approved_repair_value || 0), 0) || 0;

      return {
        openReports: openCount || 0,
        closedReports: closedCount || 0,
        approvedReports: approvedCount || 0,
        totalPaid
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        openReports: 0,
        closedReports: 0,
        approvedReports: 0,
        totalPaid: 0
      };
    }
  }
};
