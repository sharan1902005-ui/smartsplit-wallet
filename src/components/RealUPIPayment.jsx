import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Smartphone,
  Wallet,
  CheckCircle,
  Trophy,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { cleanDisplayName } from "../utils/memberDisplay";

export default function RealUPIPayment({ group }) {
  const [amount, setAmount] = useState("");
  const [paymentStarted, setPaymentStarted] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [notice, setNotice] = useState(null);

  const adminUpi = group?.adminUpi || "";

  const upiUrl =
    amount && adminUpi
      ? `upi://pay?pa=${encodeURIComponent(
          adminUpi
        )}&pn=${encodeURIComponent(
          group.name || "SmartSplit"
        )}&am=${encodeURIComponent(
          amount
        )}&cu=INR`
      : "";

  const payOnPhone = () => {
    if (!amount || Number(amount) <= 0) {
      setNotice({
        type: "error",
        text: "Enter a valid amount",
      });
      return;
    }

    if (!adminUpi) {
      setNotice({
        type: "error",
        text: "Admin UPI not configured",
      });
      return;
    }

    setNotice(null);
    setPaymentStarted(true);
    window.location.href = upiUrl;
  };

  const confirmPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setNotice({
        type: "error",
        text: "Enter a valid amount",
      });
      return;
    }

    try {
      setLoading(true);

      const groupRef = doc(
        db,
        "groups",
        group.id
      );

      await updateDoc(groupRef, {
        walletBalance:
          (group.walletBalance || 0) +
          Number(amount),

        transactions: arrayUnion({
          type: "deposit",
          amount: Number(amount),
          title: "Wallet Deposit",
          userName:
            cleanDisplayName(
              auth.currentUser?.displayName || auth.currentUser?.email,
              "Member"
            ),
          userId:
            auth.currentUser?.uid || "",
          createdAt:
            new Date().toISOString(),
        }),
      });

      setNotice({
        type: "success",
        text: "Confirmed",
      });

      setAmount("");
      setPaymentStarted(false);
      setTimeout(() => setNotice(null), 2000);
    } catch (error) {
      console.error(error);
      setNotice({
        type: "error",
        text: "Failed to update wallet",
      });
    } finally {
      setLoading(false);
    }
  };

  const depositTransactions =
    group?.transactions?.filter(
      (t) => t.type === "deposit"
    ) || [];

  const contributorsMap = {};

  depositTransactions.forEach((txn) => {
    const name =
      cleanDisplayName(txn.userName, "Unknown");

    contributorsMap[name] =
      (contributorsMap[name] || 0) +
      txn.amount;
  });

  const contributors =
    Object.entries(contributorsMap)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort(
        (a, b) => b.total - a.total
      );

  const getAvatar = (name) =>
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name || "user")}`;

  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] rounded-md shadow-xl border border-[#C7B98F] dark:border-[#3a352b] p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md">
          <Wallet size={24} />
        </div>

        <div>
          <h2 className="font-['Big_Shoulders_Display'] text-4xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
            Add Money
          </h2>

          <p className="text-[#6b6350] dark:text-[#a89a6d]">
            Pay directly to shared wallet UPI
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-5 flex items-center justify-between gap-3 rounded-md border bg-[#EAE1CC] p-4 dark:bg-[#171512] ${
            notice.type === "success"
              ? "border-[#3F6B4F] text-[#3F6B4F]"
              : "border-[#B23A2E] text-[#B23A2E]"
          }`}
        >
          <div className="-rotate-6 flex items-center gap-2 rounded-md border border-current px-3 py-1">
            {notice.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="font-['Big_Shoulders_Display'] text-2xl font-extrabold uppercase tracking-tight">
              {notice.type === "success" ? "Confirmed" : "Notice"}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#24322E] dark:text-[#EFE7D6]">
            {notice.text}
          </p>
        </div>
      )}

      <div className="rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-6 mb-5 dark:border-[#3a352b] dark:bg-[#171512]">
        <p className="text-[#6b6350] dark:text-[#a89a6d] text-sm">
          Wallet Balance
        </p>

        <p className="font-['IBM_Plex_Mono'] text-4xl font-black text-[#B23A2E] mt-2">
          {"\u20B9"}{group.walletBalance || 0}
        </p>

        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d] mt-4">
          Admin UPI:
          <span className="font-['IBM_Plex_Mono'] font-bold ml-2 text-[#24322E] dark:text-[#EFE7D6]">
            {adminUpi || "Not configured"}
          </span>
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#F8F4EA] dark:bg-[#221F1A]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#F8F4EA] dark:bg-[#221F1A]" />
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
        className="w-full p-4 rounded-md border border-[#C7B98F] dark:border-[#3a352b] bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] mb-6 font-['IBM_Plex_Mono']"
      />

      {amount &&
        Number(amount) > 0 &&
        adminUpi && (
          <div className="bg-[#EAE1CC] dark:bg-[#171512] border-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 mb-6 flex flex-col items-center">
            <p className="font-['IBM_Plex_Mono'] text-xs font-bold uppercase tracking-widest text-[#6b6350] dark:text-[#a89a6d] mb-4">
              QR Boarding Stub
            </p>

            <div className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-4 dark:border-[#3a352b] dark:bg-[#221F1A]">
              <QRCodeCanvas
                value={upiUrl}
                size={220}
              />
            </div>

            <p className="text-xs text-[#6b6350] dark:text-[#a89a6d] mt-4 text-center">
              Scan with Google Pay / PhonePe / Paytm
            </p>
          </div>
        )}

      <button
        onClick={payOnPhone}
        className="w-full bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md font-bold flex items-center justify-center gap-3 transition hover:scale-[1.01] active:scale-[0.99]"
      >
        <Smartphone size={20} />
        Pay on This Phone
      </button>

      {paymentStarted && (
        <>
          <div className="mt-4 bg-[#EAE1CC] dark:bg-[#171512] border border-[#D9A441] rounded-md p-4 flex items-center gap-3">
            <CheckCircle className="text-[#D9A441]" />
            <p className="text-sm text-[#24322E] dark:text-[#a89a6d]">
              After completing payment, click confirm payment.
            </p>
          </div>

          <button
            onClick={confirmPayment}
            disabled={loading}
            className="w-full mt-4 bg-[#3F6B4F] text-[#F8F4EA] p-4 rounded-md font-bold flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading
              ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              )
              : "Confirm Payment"}
          </button>
        </>
      )}

      <div className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="text-[#D9A441]" />
          <h3 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
            Shared Wallet Contributors
          </h3>
        </div>

        {contributors.length === 0 ? (
          <div className="bg-[#EAE1CC] dark:bg-[#171512] border border-dashed border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 text-center text-[#6b6350] dark:text-[#a89a6d]">
            No contributions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map(
              (contributor, index) => (
                <div
                  key={index}
                  className="bg-[#EAE1CC] dark:bg-[#171512] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getAvatar(
                        contributor.name
                      )}
                      alt={
                        contributor.name
                      }
                      className="w-14 h-14 rounded-full"
                    />

                    <div>
                      <p className="font-bold text-[#24322E] dark:text-[#EFE7D6]">
                        {contributor.name}
                      </p>

                      <p className="text-sm text-[#6b6350]">
                        Contributor
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[#B23A2E] font-['IBM_Plex_Mono'] font-black text-xl">
                      {"\u20B9"}
                      {
                        contributor.total
                      }
                    </p>

                    {index === 0 && (
                      <p className="text-xs text-[#D9A441] font-bold">
                        Top Contributor
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


