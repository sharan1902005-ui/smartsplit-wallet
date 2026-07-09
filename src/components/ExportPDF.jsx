import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown } from "lucide-react";

export default function ExportPDF({ group }) {
  const generatePDF = () => {
    const pdf = new jsPDF();

    const transactions = group.transactions || [];
    const members = group.members || [];

    pdf.setFontSize(22);
    pdf.text("SmartSplit Expense Report", 20, 20);

    pdf.setFontSize(14);
    pdf.text(`Group: ${group.name}`, 20, 35);
    pdf.text(`Wallet Balance: ₹${group.walletBalance}`, 20, 45);
    pdf.text(`Approval Mode: ${group.approvalMode}`, 20, 55);

    const memberRows = members.map((member) => [
      member.name || "User",
      member.email || "-",
      member.role || "member",
    ]);

    autoTable(pdf, {
      startY: 70,
      head: [["Name", "Email", "Role"]],
      body: memberRows,
    });

    const txRows = transactions.map((tx) => [
      tx.type,
      tx.userName || "User",
      tx.category || "-",
      `₹${tx.amount}`,
      tx.source || "-",
    ]);

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 15,
      head: [["Type", "User", "Category", "Amount", "Source"]],
      body: txRows,
    });

    pdf.save(`${group.name}-report.pdf`);
  };

  return (
    <div className="bg-[#F8F4EA] rounded-md shadow-xl border border-[#C7B98F] p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#B23A2E]">
            Export Reports
          </h2>

          <p className="text-[#6b6350] mt-2">
            Download complete expense report PDF
          </p>
        </div>

        <button
          onClick={generatePDF}
          className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] px-6 py-4 rounded-md font-bold shadow-xl flex items-center gap-2"
        >
          <FileDown size={20} />
          Download PDF
        </button>
      </div>
    </div>
  );
}

