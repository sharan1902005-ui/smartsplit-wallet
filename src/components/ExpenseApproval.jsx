import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase/config";
import { CheckCircle, XCircle, Wallet } from "lucide-react";

export default function ExpenseApproval({ group }) {
  const requests = group.expenseRequests || [];
  const currentUser = auth.currentUser;
  const isAdmin = group.adminUid === currentUser?.uid;
  const [uploading, setUploading] = useState(false);

  const updateRequest = async (requestIndex, newStatus) => {
    const updatedRequests = [...requests];
    updatedRequests[requestIndex].status = newStatus;

    await updateDoc(doc(db, "groups", group.id), {
      expenseRequests: updatedRequests,
      activityTimeline: [
        ...(group.activityTimeline || []),
        {
          type: newStatus,
          text: `${
            currentUser.displayName || currentUser.email
          } ${newStatus} ${updatedRequests[requestIndex].title}`,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  };

  const markAsPaid = async (requestIndex, file) => {
    const request = requests[requestIndex];

    if (group.walletBalance < request.amount) {
      alert("Insufficient wallet balance");
      return;
    }

    if (!file) {
      alert("Upload payment proof first");
      return;
    }

    try {
      setUploading(true);

      const fileRef = ref(
        storage,
        `paymentProofs/${Date.now()}-${file.name}`
      );

      await uploadBytes(fileRef, file);
      const proofUrl = await getDownloadURL(fileRef);

      const updatedRequests = [...requests];
      updatedRequests[requestIndex].status = "paid";
      updatedRequests[requestIndex].paymentProof = proofUrl;

      await updateDoc(doc(db, "groups", group.id), {
        expenseRequests: updatedRequests,
        walletBalance: group.walletBalance - request.amount,
        transactions: [
          ...(group.transactions || []),
          {
            type: "expense",
            title: request.title,
            amount: request.amount,
            category: request.category,
            user: request.requestedBy,
            userName: request.requestedByName,
            source: "Admin Paid",
            proofUrl,
            createdAt: new Date().toISOString(),
          },
        ],
        activityTimeline: [
          ...(group.activityTimeline || []),
          {
            type: "paid",
            text: `${
              currentUser.displayName || currentUser.email
            } paid ₹${request.amount} for ${request.title}`,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      setUploading(false);
    } catch (err) {
      alert(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Expense Approval Center
      </h2>

      {requests.length === 0 ? (
        <p className="text-slate-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <div
              key={index}
              className="bg-[#fff8f2] border border-red-100 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {request.title}
                  </h3>
                  <p className="text-slate-500">{request.category}</p>
                  <p className="text-red-600 font-black text-xl mt-2">
                    ₹{request.amount}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Requested by {request.requestedByName}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : request.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : request.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              {isAdmin && request.status === "pending" && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => updateRequest(index, "approved")}
                    className="flex-1 bg-green-500 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    onClick={() => updateRequest(index, "rejected")}
                    className="flex-1 bg-red-500 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}

              {isAdmin && request.status === "approved" && (
                <div className="mt-5 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      request.selectedFile = e.target.files[0];
                    }}
                    className="w-full p-3 border border-red-100 rounded-2xl"
                  />

                  <button
                    onClick={() => markAsPaid(index, request.selectedFile)}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Wallet size={18} />
                    {uploading ? "Uploading..." : "Mark as Paid + Upload Proof"}
                  </button>
                </div>
              )}

              {request.paymentProof && (
                <a
                  href={request.paymentProof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm font-semibold mt-4 inline-block"
                >
                  View Payment Proof
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
