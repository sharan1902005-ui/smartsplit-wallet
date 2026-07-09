import { Calculator } from "lucide-react";
import { getMemberName } from "../utils/memberDisplay";

export default function SettlementCalculator({
  group,
}) {
  const members = group?.members || [];

  const deposits =
    (group?.transactions || []).filter(
      (txn) => txn.type === "deposit"
    );

  if (members.length <= 1) {
    return (
      <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
        <div className="flex items-center gap-4 mb-6">
          <Calculator className="text-[#B23A2E]" />
          <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
            Settlement Calculator
          </h2>
        </div>

        <div className="bg-[#EAE1CC] dark:bg-[#171512] rounded-md border border-[#C7B98F] dark:border-[#3a352b] p-6 text-center">
          <p className="text-[#6b6350] dark:text-[#a89a6d] text-lg font-semibold">
            No settlements needed.
          </p>

          <p className="text-[#a89a6d] mt-2">
            Add more members to split balances.
          </p>
        </div>
      </section>
    );
  }

  const contributions = {};

  members.forEach((member) => {
    const key = member.uid || member.email || getMemberName(member);

    contributions[key] = {
      name: getMemberName(member),
      total: 0,
    };
  });

  deposits.forEach((txn) => {
    const key =
      txn.userId ||
      txn.user ||
      txn.userName ||
      "Unknown";

    if (!contributions[key]) {
      contributions[key] = {
        name: getMemberName({ name: txn.userName || key }),
        total: 0,
      };
    }

    contributions[key].total +=
      txn.amount || 0;
  });

  const totals =
    Object.values(contributions);

  const totalContributed =
    totals.reduce(
      (sum, member) =>
        sum + member.total,
      0
    );

  const fairShare =
    totalContributed / members.length;

  const settlements = [];

  const creditors = totals
    .filter(
      (m) => m.total > fairShare
    )
    .map((m) => ({
      ...m,
      extra:
        m.total - fairShare,
    }));

  const debtors = totals
    .filter(
      (m) => m.total < fairShare
    )
    .map((m) => ({
      ...m,
      owed:
        fairShare - m.total,
    }));

  debtors.forEach((debtor) => {
    creditors.forEach(
      (creditor) => {
        if (
          debtor.owed > 0 &&
          creditor.extra > 0 &&
          debtor.name !==
            creditor.name
        ) {
          const amount = Math.min(
            debtor.owed,
            creditor.extra
          );

          settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount:
              Math.round(amount),
          });

          debtor.owed -= amount;
          creditor.extra -= amount;
        }
      }
    );
  });

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="flex items-center gap-4 mb-6">
        <Calculator className="text-[#B23A2E]" />
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Settlement Calculator
        </h2>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="bg-[#EAE1CC] dark:bg-[#171512] rounded-md border border-[#C7B98F] dark:border-[#3a352b] p-6 mb-6 grid gap-3 sm:grid-cols-2">
        <p className="text-[#6b6350] dark:text-[#a89a6d]">
          Total contributed:
          <span className="font-['IBM_Plex_Mono'] font-bold text-[#B23A2E] ml-2">
            ₹{totalContributed}
          </span>
        </p>

        <p className="text-[#6b6350] dark:text-[#a89a6d] mt-2">
          Fair share per member:
          <span className="font-['IBM_Plex_Mono'] font-bold text-[#D9A441] ml-2">
            ₹
            {Math.round(
              fairShare
            )}
          </span>
        </p>
      </div>

      {settlements.length === 0 ? (
        <div className="bg-[#EAE1CC] dark:bg-[#171512] rounded-md border border-[#3F6B4F] p-6 text-center">
          <p className="font-semibold text-[#3F6B4F]">
            Everyone is settled.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map(
            (
              settlement,
              index
            ) => (
              <div
                key={index}
                className="bg-[#EAE1CC] dark:bg-[#171512] rounded-md p-5 border border-[#C7B98F] dark:border-[#3a352b]"
              >
                <p className="font-semibold">
                  {
                    settlement.from
                  }{" "}
                  owes{" "}
                  {
                    settlement.to
                  }
                </p>

                <p className="text-[#B23A2E] font-['IBM_Plex_Mono'] font-black text-xl mt-2">
                  ₹
                  {
                    settlement.amount
                  }
                </p>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

