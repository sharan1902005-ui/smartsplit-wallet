import { Crown, Mail } from "lucide-react";

export default function MemberProfiles({ group }) {
  const members = group.members || [];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Group Members
      </h2>

      <div className="space-y-4">
        {members.map((member, index) => {
          const isAdmin =
            member.uid === group.adminUid;

          return (
            <div
              key={member.uid || index}
              className="bg-[#fff8f2] border border-red-100 rounded-2xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    member.photo ||
                    "https://ui-avatars.com/api/?name=User"
                  }
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover border"
                />

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {member.name || "Member"}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail size={14} />
                    {member.email}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                  <Crown size={16} />
                  Admin
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
