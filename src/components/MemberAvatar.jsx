import { useEffect, useState } from "react";
import { getInitials, getMemberName, getMemberPhoto } from "../utils/memberDisplay";

export default function MemberAvatar({
  member,
  name,
  src,
  className = "w-12 h-12",
  textClassName = "text-base",
}) {
  const displayName = name || getMemberName(member);
  const photo = src || getMemberPhoto(member);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [photo]);

  if (photo && !hasImageError) {
    return (
      <img
        src={photo}
        alt={displayName}
        onError={() => setHasImageError(true)}
        className={`${className} rounded-full object-cover border-2 border-[#F8F4EA] shadow-sm ring-1 ring-[#C7B98F] dark:border-[#221F1A] dark:ring-[#3a352b] shrink-0`}
      />
    );
  }

  return (
    <div
      aria-label={displayName}
      className={`${className} rounded-full bg-[#3F6B4F] text-[#F8F4EA] border-2 border-[#F8F4EA] shadow-sm ring-1 ring-[#C7B98F] dark:border-[#221F1A] dark:ring-[#3a352b] shrink-0 flex items-center justify-center font-black ${textClassName}`}
    >
      {getInitials(displayName)}
    </div>
  );
}

