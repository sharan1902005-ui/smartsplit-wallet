import { Crown } from "lucide-react";

export default function MemberContribution({ group }) {
  const members = group.members || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Group Members
      </h2>

      {members.length === 0 ? (
        <p className="text-slate-500">
          No members yet.
        </p>
      ) : (
        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="bg-[#fff8f2] border border-red-100 rounded-2xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    member.photo ||
                    "https://ui-avatars.com/api/?name=User"
                  }
                  alt="profile"
                  className="w-14 h-14 rounded-full border"
                />

                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {member.name}

                    {member.role === "admin" && (
                      <Crown
                        size={16}
                        className="text-yellow-500"
                      />
                    )}
                  </h3>

                  <p className="text-slate-500 text-sm">
                    {member.email}
                  </p>
                </div>
              </div>

              <span className="text-sm font-semibold text-red-500 capitalize">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
