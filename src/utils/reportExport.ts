import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import type { InterventionReport } from '../store/reportStore';

export function generatePDF(report: InterventionReport): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function for text wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Header
  doc.setFontSize(20);
  doc.text('E.S.T.T.M & Co', margin, y);
  y += 10;

  doc.setFontSize(16);
  doc.text('Rapport d\'Intervention', margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Gabon (Libreville)`, margin, y);
  y += 15;

  // Report details
  doc.setFontSize(10);
  doc.text(`N° Rapport: ${report.id}`, margin, y);
  doc.text(`Date: ${format(new Date(report.date), 'dd MMMM yyyy', { locale: fr })}`, pageWidth - 80, y);
  y += 15;

  // Client information
  doc.setFontSize(12);
  doc.text('Identification Client', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(`Client: ${report.clientName}`, margin, y, pageWidth - 2 * margin);
  y += 7;

  // Equipment information
  doc.setFontSize(12);
  y += 10;
  doc.text('Équipement', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(`Type: ${report.equipmentType}`, margin, y, pageWidth - 2 * margin);
  y = addWrappedText(`Marque: ${report.brand}`, margin, y + 7, pageWidth - 2 * margin);
  y = addWrappedText(`N° série: ${report.serialNumber}`, margin, y + 7, pageWidth - 2 * margin);
  y += 15;

  // Intervention details
  doc.setFontSize(12);
  doc.text('Détails de l\'intervention', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(report.description, margin, y, pageWidth - 2 * margin);
  y += 10;

  // Actions taken
  if (report.findings.length > 0) {
    doc.setFontSize(12);
    doc.text('Actions réalisées', margin, y);
    y += 7;
    doc.setFontSize(10);
    report.findings.forEach(finding => {
      y = addWrappedText(`• ${finding}`, margin, y, pageWidth - 2 * margin);
      y += 5;
    });
    y += 5;
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    doc.setFontSize(12);
    doc.text('Recommandations', margin, y);
    y += 7;
    doc.setFontSize(10);
    report.recommendations.forEach(recommendation => {
      y = addWrappedText(`• ${recommendation}`, margin, y, pageWidth - 2 * margin);
      y += 5;
    });
  }

  // Next maintenance
  if (report.nextMaintenanceDate) {
    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Prochaine maintenance prévue: ${format(new Date(report.nextMaintenanceDate), 'dd MMMM yyyy', { locale: fr })}`,
      margin,
      y
    );
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.text('E.S.T.T.M & Co - Maintenance et Services', margin, y);
  doc.text('Libreville, Gabon', margin, y + 5);

  return doc.output('blob');
}

export function generateExcel(reports: InterventionReport[]): Blob {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for the main sheet
  const mainData = reports.map(report => ({
    'N° Rapport': report.id,
    'Date': format(new Date(report.date), 'dd/MM/yyyy'),
    'Client': report.clientName,
    'Équipement': report.equipmentType,
    'Marque': report.brand,
    'N° Série': report.serialNumber,
    'Description': report.description,
    'Statut': report.status,
    'Prochaine Maintenance': report.nextMaintenanceDate ? 
      format(new Date(report.nextMaintenanceDate), 'dd/MM/yyyy') : 'N/A'
  }));

  // Create the main worksheet
  const mainWs = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(workbook, mainWs, 'Rapports');

  // Create a sheet for findings and recommendations
  const detailsData = reports.map(report => ({
    'N° Rapport': report.id,
    'Date': format(new Date(report.date), 'dd/MM/yyyy'),
    'Actions Réalisées': report.findings.join('\n'),
    'Recommandations': report.recommendations.join('\n')
  }));

  const detailsWs = XLSX.utils.json_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(workbook, detailsWs, 'Détails');

  // Generate the file
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  
  // Convert to Blob
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }
  
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}