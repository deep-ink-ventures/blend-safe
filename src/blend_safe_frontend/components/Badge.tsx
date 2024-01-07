import React from 'react';

export const statusColors = {
  PENDING: 'bg-warning text-warning-content',
  EXECUTED: 'bg-success text-neutral-content',
  EXECUTABLE: 'bg-warning text-warning-content',
  REJECTED: 'bg-error text-error-content',
  undefined: 'bg-neutral text-base-100',
  ACTIVE: 'bg-success text-neutral-content',
  INACTIVE: 'bg-error text-error-content',
};

interface IBadge {
  status?: keyof typeof statusColors;
}

export const TransactionBadge = ({ status }: IBadge) => {
  return (
    <div
      className={`rounded-full ${
        !status ? '' : statusColors[status]
      } h-7 rounded-3xl px-3 text-center text-[0.625rem] leading-7`}>
      {status}
    </div>
  );
};
