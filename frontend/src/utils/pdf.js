import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadOrdersPdf(orders) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Rapport des ventes', 14, 18);
  const rows = (orders || []).map(o => [
    `#${o.id}`,
    o.User?.name || '-',
    `${o.total} €`,
    o.status,
    o.address || ''
  ]);
  autoTable(doc, {
    startY: 24,
    head: [['ID','Client','Total','Status','Adresse']],
    body: rows,
    styles: { fontSize: 10 }
  });
  doc.save('ventes.pdf');
}

export function downloadInvoicePdf(order) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Facture', 14, 18);
  doc.setFontSize(12);
  doc.text(`Commande: #${order.id}`, 14, 26);
  doc.text(`Client: ${order.User?.name || ''}`, 14, 32);
  doc.text(`Adresse: ${order.address || ''}`, 14, 38);
  const rows = (order.items || []).map(it => [it.Product?.name || '', it.quantity, `${it.price} €`, `${(it.quantity*it.price).toFixed(2)} €`]);
  autoTable(doc, {
    startY: 44,
    head: [['Produit','Qté','Prix','Total']],
    body: rows,
    styles: { fontSize: 10 }
  });
  const endY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 44;
  doc.text(`Total: ${order.total} €`, 14, endY + 10);
  doc.save(`facture-${order.id}.pdf`);
}


