import { capitalizeFirstChar } from "@/lib/utils";
import { StripeInvoice } from "@/types";
import dayjs from "dayjs";

/**
 * Downloads a file from a URL
 */
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a PDF from the invoice_pdf URL
 */
export const downloadInvoicePDF = async (invoice: StripeInvoice): Promise<void> => {
  if (invoice.invoice_pdf) {
    return new Promise((resolve, reject) => {
      try {
        downloadFile(invoice.invoice_pdf, `invoice-${invoice.number}.pdf`);
        // Add a small delay to ensure download starts
        setTimeout(() => resolve(), 100);
      } catch (error) {
        reject(error);
      }
    });
  } else {
    throw new Error('PDF not available for this invoice');
  }
};

/**
 * Downloads multiple PDFs from invoice_pdf URLs
 */
export const downloadMultipleInvoicePDFs = async (invoices: StripeInvoice[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      let completed = 0;
      const total = invoices.filter(invoice => invoice.invoice_pdf).length;
      
      if (total === 0) {
        resolve();
        return;
      }

      invoices.forEach((invoice, index) => {
        if (invoice.invoice_pdf) {
          // Add a small delay to prevent browser blocking
          setTimeout(() => {
            try {
              downloadFile(invoice.invoice_pdf, `invoice-${invoice.number}.pdf`);
              completed++;
              if (completed === total) {
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          }, index * 100);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Converts invoice data to CSV format
 */
export const convertInvoicesToCSV = (invoices: StripeInvoice[]): string => {
  const headers = [
    'id',
    'Invoice Number',
    'Status',
    'Currency',
    'Subtotal',
    'Total',
    'Amount Paid ($)',
    'Amount Remaining',
    'Billing Reason',
    'Created Date',
    'Due Date',
    'Period Start',
    'Period End',
    'Payment Intent ID',
    'Charge ID'
  ];

  const csvRows = [headers.join(',')];

  invoices.forEach(invoice => {
    const row = [
      `"${invoice.id}"`,
      `"${invoice.number}"`,
      `"${capitalizeFirstChar(invoice.status)}"`,
      `"${invoice.currency?.toUpperCase()}"`,
      invoice.subtotal / 100,
      invoice.total / 100,
      invoice.amount_paid / 100,
      invoice.amount_remaining / 100,
      `"${invoice.billing_reason?.replace(/_/g, ' ').toLowerCase()}"`,
      `"${dayjs(invoice.created).format('YYYY-MM-DD')}"`,
      invoice.due_date ? `"${dayjs(invoice.due_date).format('YYYY-MM-DD')}"` : '""',
      `"${dayjs(invoice.period_start).format('YYYY-MM-DD')}"`,
      `"${dayjs(invoice.period_end).format('YYYY-MM-DD')}"`,
      invoice.payment_intent_id ? `"${invoice.payment_intent_id}"` : '""',
      invoice.charge_id ? `"${invoice.charge_id}"` : '""'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

/**
 * Downloads CSV data as a file
 */
export const downloadCSV = (csvContent: string, filename: string = 'invoices.csv'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Add a small delay to ensure download starts
      setTimeout(() => resolve(), 100);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Downloads invoices as CSV
 */
export const downloadInvoicesAsCSV = async (invoices: StripeInvoice[], filename?: string): Promise<void> => {
  const csvContent = convertInvoicesToCSV(invoices);
  const defaultFilename = invoices.length === 1 
    ? `invoice-${invoices[0].number}.csv` 
    : `invoices-${dayjs().format('YYYY-MM-DD')}.csv`;
  
  return downloadCSV(csvContent, filename || defaultFilename);
};

/**
 * Creates a zip file with multiple PDFs (for future implementation)
 * This would require a library like JSZip
 */
export const downloadMultiplePDFsAsZip = async (invoices: StripeInvoice[]) => {
  // This would require JSZip library
  // For now, we'll download them individually
  downloadMultipleInvoicePDFs(invoices);
};
