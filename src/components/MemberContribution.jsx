import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function MemberContribution({ group }) {
  const transactions = group.transactions || [];
  const deposits = transactions.filter((t) => t.type === "deposit");

  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    fetchUserNames();
  }, [group]);

  const fetchUserNames = async () => {
    const contributionUsers = [...new Set(deposits.map((d) => d.user))];

    const namesMap = {};

    for (const uid of contributionUsers) {
      try {
        const snap = await getDoc(doc(db, "users", uid));

        if (snap.exists()) {
          namesMap[uid] = snap.data().name;
        } else {
          namesMap[uid] = "Unknown User";
        }
      } catch {
        namesMap[uid] = "Unknown User";
      }
    }

    setUserNames(namesMap);
  };

  const contributions = {};

  deposits.forEach((deposit) => {
    const user = deposit.user;

    if (!contributions[user]) {
      contributions[user] = 0;
    }

    contributions[user] += deposit.amount;
  });

  const sorted = Object.entries(contributions).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        Member Contributions
      </h2>

      {sorted.length === 0 ? (
        <p className="text-slate-400">No contributions yet</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(([uid, amount], index) => (
            <div
              key={uid}
              className="bg-slate-800 p-5 rounded-2xl flex justify-between items-center"
            >
              <div>
                <p className="font-bold">
                  {userNames[uid] || "Loading..."}
                </p>

                <p className="text-slate-400 text-sm">
                  Contributor #{index + 1}
                </p>
              </div>

              <div className="text-2xl font-bold text-green-400">
                ₹{amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}