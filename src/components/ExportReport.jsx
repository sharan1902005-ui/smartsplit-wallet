import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportReport({ group }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("SmartSplit Wallet Report", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(80);

    doc.text(`Group: ${group.name}`, 14, 32);
    doc.text(`Type: ${group.type}`, 14, 40);
    doc.text(`Wallet Balance: ₹${group.walletBalance}`, 14, 48);

    // Members
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Members", 14, 65);

    const memberRows = (group.members || []).map((m, i) => [
      i + 1,
      typeof m === "string" ? m : m.name || m.email || "Member",
    ]);

    autoTable(doc, {
      startY: 72,
      head: [["#", "Member"]],
      body: memberRows.length
        ? memberRows
        : [["-", "No members"]],
    });

    // Transactions
    const txnRows = (group.transactions || []).map((t) => [
      t.type,
      t.title || "-",
      t.userName || "User",
      `₹${t.amount}`,
      t.createdAt
        ? new Date(t.createdAt).toLocaleString()
        : "-",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Type", "Title", "User", "Amount", "Date"]],
      body: txnRows.length
        ? txnRows
        : [["-", "-", "-", "-", "-"]],
    });

    // Expense Requests
    const requestRows = (group.expenseRequests || []).map((r) => [
      r.title,
      r.category,
      r.requestedByName || "User",
      `₹${r.amount}`,
      r.status,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Title", "Category", "Requested By", "Amount", "Status"]],
      body: requestRows.length
        ? requestRows
        : [["-", "-", "-", "-", "-"]],
    });

    doc.save(`${group.name}-report.pdf`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-4">
        Export Reports
      </h2>

      <p className="text-slate-500 mb-6">
        Download complete expense summary PDF
      </p>

      <button
        onClick={generatePDF}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold"
      >
        Download Expense Report PDF
      </button>
    </div>
  );
}
