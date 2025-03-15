import { supabase } from '@/integrations/supabase/client';
import { DefectReport, DefectReportStats } from '@/types';

// Helper function to convert snake_case DB response to camelCase for our app
const mapDefectReport = (dbReport: any): DefectReport => {
  return {
    id: dbReport.id,
    caseNumber: dbReport.case_number,
    dealerId: dbReport.dealer_id,
    dealerName: dbReport.dealer_name,
    vehicleId: dbReport.vehicle_id,
    email: dbReport.email || '',
    status: dbReport.status,
    reason: dbReport.reason,
    description: dbReport.description,
    vehicleReceiptDate: dbReport.vehicle_receipt_date,
    repairCost: dbReport.repair_cost || 0,
    approvedRepairValue: dbReport.approved_repair_value || 0,
    sparePartsRequest: dbReport.spare_parts_request || '',
    transportDocumentUrl: dbReport.transport_document_url || '',
    photoReportUrls: dbReport.photo_report_urls || [],
    repairQuoteUrl: dbReport.repair_quote_url || '',
    adminNotes: dbReport.admin_notes || '',
    paymentDate: dbReport.payment_date || null,
    createdAt: dbReport.created_at,
    updatedAt: dbReport.updated_at
  };
};

export const defectReportsApi = {
  async getAll() {
    console.log('Fetching all defect reports');
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching defect reports:', error);
      throw error;
    }

    return data.map(mapDefectReport);
  },

  async getById(id: string) {
    console.log('Fetching defect report with id:', id);
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching defect report with id ${id}:`, error);
      throw error;
    }

    return mapDefectReport(data);
  },

  async getByDealerId(dealerId: string) {
    console.log('Fetching defect reports for dealer:', dealerId);
    
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching defect reports for dealer ${dealerId}:`, error);
      throw error;
    }

    return data.map(mapDefectReport);
  },

  async create(report: Omit<DefectReport, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) {
    console.log("Creating defect report with data:", report);
    
    // Convert from camelCase to snake_case for the database
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
      // The buckets are already created and configured with open permissions
      // We can proceed directly to inserting the record
      
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
      return mapDefectReport(data);
    } catch (error) {
      console.error('Error in defect report creation:', error);
      throw error;
    }
  },

  async update(id: string, report: Partial<DefectReport>) {
    console.log("Updating defect report with id:", id, "and data:", report);
    
    // Format all fields correctly for the database (camelCase to snake_case)
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
      return mapDefectReport(data);
    } catch (error) {
      console.error('Error in defect report update:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log("Deleting defect report with id:", id);
    
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
    console.log("Fetching defect report stats");
    
    try {
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
