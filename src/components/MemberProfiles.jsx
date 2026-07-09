import { Crown, Mail } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import { getMemberName } from "../utils/memberDisplay";

export default function MemberProfiles({ group }) {
  const members = group.members || [];

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Group Members
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          People currently included in this wallet
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="space-y-4">
        {members.map((member, index) => {
          const isAdmin =
            member.uid === group.adminUid;
          const memberName = getMemberName(member);

          return (
            <div
              key={member.uid || index}
              className="bg-[#EAE1CC] dark:bg-[#171512] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <MemberAvatar
                  member={member}
                  name={memberName}
                  className="w-14 h-14"
                />

                <div>
                  <h3 className="font-bold text-[#24322E] dark:text-[#EFE7D6] text-lg">
                    {memberName}
                  </h3>

                  <div className="flex items-center gap-2 text-[#6b6350] dark:text-[#a89a6d] text-sm">
                    <Mail size={14} />
                    {member.email}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="-rotate-6 flex items-center gap-2 rounded-md border border-[#D9A441] bg-[#F8F4EA] px-4 py-2 text-sm font-semibold uppercase text-[#D9A441] dark:bg-[#221F1A]">
                  <Crown size={16} />
                  Admin
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

