const ID_PREFIX_PATTERN = /^\s*\d+\s*[-:]\s*/;

function titleCaseIfAllCaps(value) {
  if (!value || value !== value.toUpperCase() || !/[A-Z]/.test(value)) {
    return value;
  }

  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) =>
      part.length <= 1 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)
    )
    .join(" ");
}

export function cleanDisplayName(value, fallback = "Member") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  return titleCaseIfAllCaps(raw.replace(ID_PREFIX_PATTERN, "").trim()) || fallback;
}

export function getMemberName(member, fallback = "Member") {
  if (typeof member === "string") {
    return cleanDisplayName(member, fallback);
  }

  return cleanDisplayName(
    member?.name || member?.displayName || member?.userName || member?.email,
    fallback
  );
}

export function getMemberPhoto(member) {
  return member?.photo || member?.photoURL || member?.avatarUrl || member?.avatar || "";
}

export function getInitials(name) {
  const cleanName = cleanDisplayName(name, "Member");
  return cleanName.slice(0, 1).toUpperCase();
}

export function normalizeMemberRecord(member) {
  const name = getMemberName(member);
  const photo = getMemberPhoto(member);

  return {
    ...member,
    name,
    ...(member?.displayName ? { displayName: name } : {}),
    ...(photo ? { photo } : {}),
  };
}
