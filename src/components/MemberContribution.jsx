import { Crown } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import { getMemberName } from "../utils/memberDisplay";

export default function MemberContribution({ group }) {
  const members = group.members || [];

  return (
    <div>
      <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#B23A2E] mb-6">
        Group Members
      </h2>

      {members.length === 0 ? (
        <p className="text-[#6b6350]">
          No members yet.
        </p>
      ) : (
        <div className="space-y-4">
          {members.map((member, index) => {
            const memberName = getMemberName(member);

            return (
              <div
                key={member.uid || index}
                className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5 flex items-center justify-between"
              >
              <div className="flex items-center gap-4">
                <MemberAvatar
                  member={member}
                  name={memberName}
                  className="w-14 h-14 rounded-full border"
                />

                <div>
                  <h3 className="font-bold text-[#24322E] flex items-center gap-2">
                    {memberName}

                    {member.role === "admin" && (
                      <Crown
                        size={16}
                        className="text-[#D9A441]"
                      />
                    )}
                  </h3>

                  <p className="text-[#6b6350] text-sm">
                    {member.email}
                  </p>
                </div>
              </div>

              <span className="-rotate-6 rounded-md border border-[#B23A2E] px-3 py-1 text-sm font-semibold text-[#B23A2E] capitalize">
                {member.role}
              </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

