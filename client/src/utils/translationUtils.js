/**
 * Utility functions for translation of dynamic database values
 */

/**
 * Maps a department name to its translation key
 * @param {string} dept - The department name in English
 * @returns {string} - The translation key
 */
export const getDeptKey = (dept) => {
  if (!dept) return '';
  const d = dept.toLowerCase();
  if (d.includes('municipal')) return 'form.depts.municipal';
  if (d.includes('road')) return 'form.depts.road';
  if (d.includes('sewage')) return 'form.depts.sewage';
  if (d.includes('waste')) return 'form.depts.waste';
  if (d.includes('water')) return 'form.depts.water';
  if (d.includes('electric')) return 'form.depts.electric';
  if (d.includes('public works') || d.includes('pwd')) return 'form.depts.pwd';
  return dept;
};

/**
 * Maps a status to its translation key
 * @param {string} status - The status in English
 * @returns {string} - The translation key
 */
export const getStatusKey = (status) => {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'pending') return 'admin.pending';
  if (s === 'in progress') return 'admin.inProgress';
  if (s === 'resolved') return 'admin.resolved';
  return status;
};

/**
 * Maps a priority to its translation key
 * @param {string} priority - The priority in English
 * @returns {string} - The translation key
 */
export const getPriorityKey = (priority) => {
  if (!priority) return '';
  return 'user.priorityLabel'; // We can use it like: t('user.priorityLabel') + ': ' + t(`common.${priority.toLowerCase()}`)
};

/**
 * Helper to translate department names
 * @param {string} dept - Dept name
 * @param {Function} t - i18next translation function
 */
export const translateDept = (dept, t) => {
  const key = getDeptKey(dept);
  return key.includes('.') ? t(key) : dept;
};

/**
 * Helper to translate status
 * @param {string} status - Status
 * @param {Function} t - i18next translation function
 */
export const translateStatus = (status, t) => {
  const key = getStatusKey(status);
  return key.includes('.') ? t(key) : status;
};
