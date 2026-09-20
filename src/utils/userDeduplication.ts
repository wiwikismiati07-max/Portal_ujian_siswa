import { User } from '../types';

export const normalizeNip = (nip?: string): string => {
  if (!nip) return '';
  return nip.replace(/[^0-9a-zA-Z]/g, '').trim();
};

export const normalizeName = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const normalizeUsername = (username?: string): string => {
  if (!username) return '';
  return username
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[\s\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim();
};

export interface DeduplicationResult {
  cleanedUsers: User[];
  removedUserIds: string[];
  duplicateCount: number;
}

/**
 * Identifies and removes duplicate users based on NIP, Name, or Username.
 * Keeps the best/most complete record and marks others for deletion.
 */
export const cleanAndDeduplicateUsers = (users: User[]): DeduplicationResult => {
  const seenNip = new Map<string, User>();
  const seenName = new Map<string, User>();
  const seenUsername = new Map<string, User>();

  const finalUsers: User[] = [];
  const removedUserIds: string[] = [];

  for (const user of users) {
    // Specifically remove legacy demo user Budi Santoso
    if (
      user.id === 'user_guru_1' ||
      user.username === 'budi_guru' ||
      user.nipOrNis === '198305142008011012' ||
      user.name?.toLowerCase().includes('budi santoso, s.kom')
    ) {
      removedUserIds.push(user.id);
      continue;
    }

    // Never remove or merge admin accounts
    if (user.role === 'admin') {
      finalUsers.push(user);
      continue;
    }

    const nipKey = user.nipOrNis ? `${user.role}_nip_${normalizeNip(user.nipOrNis)}` : null;
    const nameKey = user.name ? `${user.role}_name_${normalizeName(user.name)}` : null;
    const userKey = user.username ? `${user.role}_user_${normalizeUsername(user.username)}` : null;

    let duplicateOf: User | undefined;

    if (nipKey && seenNip.has(nipKey)) {
      duplicateOf = seenNip.get(nipKey);
    } else if (nameKey && seenName.has(nameKey)) {
      duplicateOf = seenName.get(nameKey);
    } else if (userKey && seenUsername.has(userKey)) {
      duplicateOf = seenUsername.get(userKey);
    }

    if (duplicateOf) {
      // It's a duplicate! Decide whether to enrich the existing record or keep this one
      removedUserIds.push(user.id);

      // Merge better attributes into the kept record
      if (!duplicateOf.nipOrNis && user.nipOrNis) duplicateOf.nipOrNis = user.nipOrNis;
      if (!duplicateOf.classGroup && user.classGroup) duplicateOf.classGroup = user.classGroup;
      if (!duplicateOf.subjectName && user.subjectName) duplicateOf.subjectName = user.subjectName;
      if (!duplicateOf.password || duplicateOf.password === '123456') {
        if (user.password && user.password !== '123456') duplicateOf.password = user.password;
      }
    } else {
      // Clean up username format
      const cleanedUser: User = {
        ...user,
        username: normalizeUsername(user.username) || user.username
      };

      finalUsers.push(cleanedUser);

      if (nipKey) seenNip.set(nipKey, cleanedUser);
      if (nameKey) seenName.set(nameKey, cleanedUser);
      if (userKey) seenUsername.set(userKey, cleanedUser);
    }
  }

  return {
    cleanedUsers: finalUsers,
    removedUserIds,
    duplicateCount: removedUserIds.length
  };
};

/**
 * Merges newly imported users with existing users according to the chosen strategy:
 * 1. 'replace_role': Deletes all existing users with the same role and inserts new ones.
 * 2. 'merge_upsert': Updates existing matching records (by NIP, Name, or Username) and adds non-existing ones.
 */
export const mergeImportedUsers = (
  existingUsers: User[],
  newUsers: User[],
  targetRole: 'siswa' | 'guru',
  mode: 'replace_role' | 'merge_upsert'
): { mergedUsers: User[]; usersToSync: User[]; deletedUserIds: string[] } => {
  if (mode === 'replace_role') {
    // Keep users from other roles (e.g. admin, and the other role)
    const otherUsers = existingUsers.filter(u => u.role !== targetRole);
    const targetOldUsers = existingUsers.filter(u => u.role === targetRole);
    const deletedUserIds = targetOldUsers.map(u => u.id);

    // Deduplicate the new list internally
    const { cleanedUsers: deduplicatedNew } = cleanAndDeduplicateUsers(newUsers);

    return {
      mergedUsers: [...otherUsers, ...deduplicatedNew],
      usersToSync: deduplicatedNew,
      deletedUserIds
    };
  }

  // mode === 'merge_upsert' (Tindih / Perbarui Data Sama)
  const otherUsers = existingUsers.filter(u => u.role !== targetRole);
  const currentRoleUsers = [...existingUsers.filter(u => u.role === targetRole)];
  const updatedOrNewUsers: User[] = [];

  for (const newUser of newUsers) {
    const newNipNorm = normalizeNip(newUser.nipOrNis);
    const newNameNorm = normalizeName(newUser.name);
    const newUsernameNorm = normalizeUsername(newUser.username);

    // Find if user already exists
    const matchIndex = currentRoleUsers.findIndex(existing => {
      const existNipNorm = normalizeNip(existing.nipOrNis);
      const existNameNorm = normalizeName(existing.name);
      const existUsernameNorm = normalizeUsername(existing.username);

      if (newNipNorm && existNipNorm && newNipNorm === existNipNorm) return true;
      if (newNameNorm && existNameNorm && newNameNorm === existNameNorm) return true;
      if (newUsernameNorm && existUsernameNorm && newUsernameNorm === existUsernameNorm) return true;
      return false;
    });

    if (matchIndex >= 0) {
      // OVERWRITE / TINDIH existing record while preserving its stable ID
      const existingUser = currentRoleUsers[matchIndex];
      const updatedUser: User = {
        ...existingUser,
        name: newUser.name || existingUser.name,
        username: normalizeUsername(newUser.username) || existingUser.username,
        password: newUser.password || existingUser.password,
        nipOrNis: newUser.nipOrNis || existingUser.nipOrNis,
        classGroup: newUser.classGroup || existingUser.classGroup,
        subjectName: newUser.subjectName || existingUser.subjectName
      };
      currentRoleUsers[matchIndex] = updatedUser;
      updatedOrNewUsers.push(updatedUser);
    } else {
      // Add new record
      currentRoleUsers.push(newUser);
      updatedOrNewUsers.push(newUser);
    }
  }

  // Deduplicate once more to ensure absolute cleanliness
  const { cleanedUsers: finalRoleUsers } = cleanAndDeduplicateUsers(currentRoleUsers);

  return {
    mergedUsers: [...otherUsers, ...finalRoleUsers],
    usersToSync: updatedOrNewUsers,
    deletedUserIds: []
  };
};
