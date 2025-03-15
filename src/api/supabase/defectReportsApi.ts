
import { supabase } from './client';
import { DefectReport, DefectReportStats } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const defectReportsApi = {
  async getAll() {
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
    const { data, error } = await supabase
      .from('defect_reports')
      .insert([{
        id: uuidv4(),
        dealer_id: report.dealerId,
        dealer_name: report.dealerName,
        vehicle_id: report.vehicleId,
        email: report.email,
        status: report.status,
        reason: report.reason,
        description: report.description,
        vehicle_receipt_date: report.vehicleReceiptDate,
        repair_cost: report.repairCost,
        transport_document_url: report.transportDocumentUrl,
        photo_report_urls: report.photoReportUrls,
        repair_quote_url: report.repairQuoteUrl,
        admin_notes: report.adminNotes,
        payment_date: report.paymentDate
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating defect report:', error);
      throw error;
    }

    return data as DefectReport;
  },

  async update(id: string, report: Partial<DefectReport>) {
    const { data, error } = await supabase
      .from('defect_reports')
      .update({
        dealer_id: report.dealerId,
        dealer_name: report.dealerName,
        vehicle_id: report.vehicleId,
        email: report.email,
        status: report.status,
        reason: report.reason,
        description: report.description,
        vehicle_receipt_date: report.vehicleReceiptDate,
        repair_cost: report.repairCost,
        transport_document_url: report.transportDocumentUrl,
        photo_report_urls: report.photoReportUrls,
        repair_quote_url: report.repairQuoteUrl,
        admin_notes: report.adminNotes,
        payment_date: report.paymentDate
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating defect report with id ${id}:`, error);
      throw error;
    }

    return data as DefectReport;
  },

  async delete(id: string) {
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
    const { data: openReports, error: openError } = await supabase
      .from('defect_reports')
      .select('count', { count: 'exact' })
      .eq('status', 'Aperta');

    const { data: closedReports, error: closedError } = await supabase
      .from('defect_reports')
      .select('count', { count: 'exact' })
      .in('status', ['Approvata', 'Approvata Parzialmente', 'Respinta']);

    const { data: paidReports, error: paidError } = await supabase
      .from('defect_reports')
      .select('repair_cost')
      .not('payment_date', 'is', null);

    if (openError || closedError || paidError) {
      console.error('Error fetching defect report stats:', openError || closedError || paidError);
      throw openError || closedError || paidError;
    }

    const totalPaid = paidReports?.reduce((sum, report) => sum + (report.repair_cost || 0), 0) || 0;

    return {
      openReports: openReports?.count || 0,
      closedReports: closedReports?.count || 0,
      totalPaid
    };
  }
};
