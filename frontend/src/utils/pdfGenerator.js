// PDF Generator for Bank Statements
export const generateTransactionPDF = (transactions, user, filters = {}) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals
  const totalCredit = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebit = transactions
    .filter(t => t.type === 'Debit' || t.type === 'Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bank Statement - Bankify</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          color: #333;
          padding: 20px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 3px solid #667eea;
          margin-bottom: 20px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: #667eea;
        }
        .statement-info {
          text-align: right;
        }
        .statement-info h2 {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .statement-info p {
          color: #6b7280;
          font-size: 11px;
        }
        .account-section {
          display: flex;
          justify-content: space-between;
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .account-info h3 {
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .account-info p {
          font-size: 11px;
          color: #6b7280;
          margin: 2px 0;
        }
        .summary-section {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .summary-card {
          flex: 1;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card.credit {
          background: #d1fae5;
        }
        .summary-card.debit {
          background: #fee2e2;
        }
        .summary-card.net {
          background: #dbeafe;
        }
        .summary-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .summary-value {
          font-size: 18px;
          font-weight: 700;
        }
        .summary-card.credit .summary-value {
          color: #059669;
        }
        .summary-card.debit .summary-value {
          color: #dc2626;
        }
        .summary-card.net .summary-value {
          color: #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background: #667eea;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
        }
        th:first-child {
          border-radius: 6px 0 0 0;
        }
        th:last-child {
          border-radius: 0 6px 0 0;
          text-align: right;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 11px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        tr:hover {
          background: #f3f4f6;
        }
        .amount-credit {
          color: #059669;
          font-weight: 600;
          text-align: right;
        }
        .amount-debit {
          color: #dc2626;
          font-weight: 600;
          text-align: right;
        }
        .txn-id {
          font-family: monospace;
          font-size: 10px;
          color: #6b7280;
        }
        .category-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e5e7eb;
          border-radius: 10px;
          font-size: 9px;
          color: #374151;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
        }
        .footer p {
          margin: 3px 0;
        }
        .no-print {
          margin-bottom: 20px;
          text-align: center;
        }
        .print-btn {
          padding: 10px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 10px;
        }
        .close-btn {
          padding: 10px 30px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="close-btn" onclick="window.close()">Close</button>
      </div>

      <div class="header">
        <div class="logo">
          <div class="logo-icon">B</div>
          <span class="logo-text">Bankify</span>
        </div>
        <div class="statement-info">
          <h2>Account Statement</h2>
          <p>Generated on: ${formatDateTime(new Date())}</p>
          ${filters.startDate ? `<p>Period: ${formatDate(filters.startDate)} to ${formatDate(filters.endDate || new Date())}</p>` : ''}
        </div>
      </div>

      <div class="account-section">
        <div class="account-info">
          <h3>Account Holder</h3>
          <p><strong>${user?.fullName || 'Account Holder'}</strong></p>
          <p>Email: ${user?.email || 'N/A'}</p>
          <p>Phone: ${user?.phoneNumber || 'N/A'}</p>
        </div>
        <div class="account-info" style="text-align: right;">
          <h3>Statement Details</h3>
          <p>Total Transactions: ${transactions.length}</p>
          ${filters.category ? `<p>Category: ${filters.category}</p>` : ''}
          ${filters.type ? `<p>Type: ${filters.type}</p>` : ''}
        </div>
      </div>

      <div class="summary-section">
        <div class="summary-card credit">
          <div class="summary-label">Total Credit</div>
          <div class="summary-value">${formatCurrency(totalCredit)}</div>
        </div>
        <div class="summary-card debit">
          <div class="summary-label">Total Debit</div>
          <div class="summary-value">${formatCurrency(totalDebit)}</div>
        </div>
        <div class="summary-card net">
          <div class="summary-label">Net Balance</div>
          <div class="summary-value">${formatCurrency(totalCredit - totalDebit)}</div>
        </div>
      </div>

      <h3 style="margin-bottom: 10px; color: #1f2937;">Transaction Details</h3>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction ID</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(txn => `
            <tr>
              <td>${formatDateTime(txn.date)}</td>
              <td class="txn-id">${txn.transactionId || txn._id?.slice(-8) || 'N/A'}</td>
              <td>${txn.description || txn.recipient?.name || '-'}</td>
              <td><span class="category-badge">${txn.category || 'Other'}</span></td>
              <td>${txn.type}</td>
              <td class="${txn.type === 'Credit' ? 'amount-credit' : 'amount-debit'}">
                ${txn.type === 'Credit' ? '+' : '-'}${formatCurrency(txn.amount)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>Bankify - Digital Banking Made Simple</strong></p>
        <p>This is a computer generated statement and does not require signature.</p>
        <p>For any queries, contact support@bankify.com | 1800-XXX-XXXX</p>
        <p>© ${new Date().getFullYear()} Bankify. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Export transactions as CSV
export const exportToCSV = (transactions, filename = 'transactions') => {
  const headers = ['Date', 'Transaction ID', 'Description', 'Category', 'Type', 'Amount'];
  
  const rows = transactions.map(txn => [
    new Date(txn.date).toLocaleString('en-IN'),
    txn.transactionId || txn._id || 'N/A',
    txn.description || txn.recipient?.name || '-',
    txn.category || 'Other',
    txn.type,
    (txn.type === 'Credit' ? '+' : '-') + txn.amount
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};