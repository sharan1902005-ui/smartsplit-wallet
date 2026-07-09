import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowRight, Calculator, ChevronLeft } from "lucide-react";
import { db } from "../firebase/config";
import { calculateSettlements } from "../utils/settlement";
import MemberAvatar from "../components/MemberAvatar";
import { getMemberName } from "../utils/memberDisplay";

export default function Settlement() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "groups", id), (snap) => {
      if (snap.exists()) setGroup({ id: snap.id, ...snap.data() });
    });

    return unsub;
  }, [id]);

  if (!group) {
    return (
      <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] flex items-center justify-center">
        <div className="text-2xl font-black text-[#B23A2E] animate-pulse">
          Loading settlement...
        </div>
      </div>
    );
  }

  const members = group.members || [];
  const membersMap = Object.fromEntries(members.map((member) => [member.uid, member]));
  const transactions = calculateSettlements(
    group.expenses || [],
    Object.fromEntries(members.map((member) => [member.uid, getMemberName(member)]))
  );

  return (
    <div className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/group/${id}`}
          className="inline-flex items-center gap-2 text-[#B23A2E] font-bold mb-6"
        >
          <ChevronLeft size={18} />
          Back to {group.name}
        </Link>

        <div className="bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] rounded-md shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-4 rounded-md shadow-xl">
              <Calculator size={26} />
            </div>
            <div>
              <h1 className="font-['Big_Shoulders_Display'] text-5xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
                Settlement Itinerary
              </h1>
              <p className="text-[#6b6350] dark:text-[#a89a6d] mt-1">
                Connecting-flight routes for settling all debts
              </p>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-6">
            <div className="absolute -left-11 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
            <div className="absolute -right-11 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
          </div>

          {transactions.length === 0 ? (
            <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-8 text-center">
              <p className="text-lg font-bold text-[#3F6B4F]">
                Everyone is settled up.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-[#EAE1CC] dark:bg-[#171512] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5 grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center"
                >
                  <Person member={membersMap[transaction.from]} name={transaction.fromName} />

                  <div className="flex items-center justify-center gap-3 text-[#B23A2E] font-['IBM_Plex_Mono'] font-black">
                    <ArrowRight size={22} />
                    <span>Rs. {transaction.amount.toFixed(2)}</span>
                  </div>

                  <Person member={membersMap[transaction.to]} name={transaction.toName} alignRight />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Person({ member, name, alignRight = false }) {
  return (
    <div className={`flex items-center gap-3 ${alignRight ? "md:justify-end" : ""}`}>
      <MemberAvatar member={member} name={name} className="w-10 h-10" />
      <span className="font-bold text-[#24322E] dark:text-[#EFE7D6]">{name}</span>
    </div>
  );
}

