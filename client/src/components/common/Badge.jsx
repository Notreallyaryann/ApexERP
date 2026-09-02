import React from 'react';

export const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN:     'bg-purple-50 text-purple-600 border-purple-200',
    SALES:     'bg-[#fff0ed] text-[#e84b2c] border-[#ffd0c4]',
    WAREHOUSE: 'bg-amber-50 text-amber-600 border-amber-200',
    ACCOUNTS:  'bg-sky-50 text-sky-600 border-sky-200',
  };

  return (
    <span
      className={`badge ${styles[role] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
    >
      {role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    // Customer statuses
    ACTIVE:    'bg-green-50 text-green-700 border-green-200',
    LEAD:      'bg-blue-50 text-blue-600 border-blue-200',
    INACTIVE:  'bg-gray-100 text-gray-500 border-gray-200',

    // Challan statuses
    CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
    DRAFT:     'bg-amber-50 text-amber-600 border-amber-200',
    CANCELLED: 'bg-red-50 text-red-500 border-red-200',

    // Movement types
    IN:  'bg-green-50 text-green-700 border-green-200',
    OUT: 'bg-[#fff0ed] text-[#e84b2c] border-[#ffd0c4]',
  };

  return (
    <span
      className={`badge ${styles[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
    >
      {status}
    </span>
  );
};
