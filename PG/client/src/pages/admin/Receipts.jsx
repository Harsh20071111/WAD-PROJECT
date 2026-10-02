import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import DataTable from '../../components/DataTable';
import Icon from '../../components/Icon';
import { getReceipts } from '../../services/management';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getReceipts();
      setReceipts(data);
    } catch (err) {
      setError('Unable to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async (receipt) => {
    try {
      setDownloadingId(receipt._id);

      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(33, 37, 41);
      doc.text(receipt.pgSnapshot?.name || 'PG Management', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(receipt.pgSnapshot?.address || '', 14, 28);

      // Receipt Title
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41);
      doc.text('PAYMENT RECEIPT', 14, 45);

      doc.setFontSize(12);
      doc.text(`Receipt No: ${receipt.receiptNumber}`, 14, 55);
      doc.text(`Date: ${new Date(receipt.paidAt).toLocaleDateString('en-IN')}`, 14, 62);

      // Resident Details
      doc.setFontSize(14);
      doc.text('Billed To:', 14, 75);

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`Name: ${receipt.residentSnapshot.name}`, 14, 83);
      doc.text(`Room: ${receipt.residentSnapshot.roomNumber || 'N/A'} (Bed ${receipt.residentSnapshot.bedLabel || 'N/A'})`, 14, 90);
      doc.text(`Email: ${receipt.residentSnapshot.email}`, 14, 97);
      if (receipt.residentSnapshot.phone) {
        doc.text(`Phone: ${receipt.residentSnapshot.phone}`, 14, 104);
      }

      // Payment Details
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text('Payment Details:', 14, 120);

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`Month: ${receipt.month}`, 14, 128);
      doc.text(`Amount Paid: Rs. ${receipt.amount.toLocaleString('en-IN')}`, 14, 135);
      doc.text(`Payment Method: ${receipt.paymentId?.method || 'N/A'}`, 14, 142);
      if (receipt.transactionId) {
        doc.text(`Transaction ID: ${receipt.transactionId}`, 14, 149);
      }

      // Line Items
      if (receipt.lineItems && receipt.lineItems.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(33, 37, 41);
        doc.text('Breakdown:', 14, 165);

        doc.setFontSize(11);
        doc.setTextColor(80);
        let yPos = 173;
        receipt.lineItems.forEach(li => {
          doc.text(`${li.label}: Rs. ${li.amount.toLocaleString('en-IN')}`, 14, yPos);
          yPos += 7;
        });
      }

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('This is a computer-generated receipt and does not require a physical signature.', 14, 280);

      doc.save(`payment-receipt-${receipt.receiptNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: 'receiptNumber', label: 'Receipt #', render: (v) => <span className="font-semibold text-primary">{v}</span> },
    {
      key: 'resident', label: 'Resident',
      render: (_, row) => (
        <div>
          <p className="font-medium text-on-surface text-body-sm">{row.residentSnapshot?.name}</p>
          <p className="text-label-sm text-on-surface-variant">Room {row.residentSnapshot?.roomNumber || 'N/A'}</p>
        </div>
      ),
    },
    { key: 'month', label: 'Month' },
    { key: 'amount', label: 'Amount', render: (v) => <span className="tabular-nums font-semibold">₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'method', label: 'Method', render: (_, row) => <span>{row.paymentId?.method || 'N/A'}</span> },
    { key: 'paidAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <button
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors disabled:opacity-50"
          title="Download PDF"
          disabled={downloadingId === row._id}
          onClick={() => handleDownload(row)}
        >
          {downloadingId === row._id ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            <Icon name="file_download" size={16} />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Payment Receipts</h1>
          <p className="text-body-md text-on-surface-variant">Download and manage all generated rent receipts</p>
        </div>
        {loading && <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
      </div>

      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}

      <div className="section-card">
        <DataTable columns={columns} data={receipts} emptyMessage="No receipts yet" emptyIcon="receipt_long" />
      </div>
    </div>
  );
};

export default Receipts;
