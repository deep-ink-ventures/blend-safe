import cn from 'classnames';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import Search from '../svg/components/Search';
import { formatDateTime, truncateMiddle } from '../utils';
import {
  Accordion,
  Pagination,
  Timeline,
  TransactionBadge,
  UserTally,
} from './index';

interface ITransactionsProps {
  address?: string;
}

const StatusStepMap: Record<string, number> = {
  REJECTED: 0,
  PENDING: 1,
  EXECUTABLE: 2,
  EXECUTED: 3,
};

const StatusBadgeMap: Record<string, string> = {
  EXECUTABLE: 'EXECUTABLE',
  PENDING: 'PENDING',
  EXECUTED: 'EXECUTED',
  REJECTED: 'REJECTED',
};

const AccordionHeaderColorMap: Record<any, string> = {
  [`${StatusBadgeMap.EXECUTED}`]: 'success',
  [`${StatusBadgeMap.REJECTED}`]: 'danger',
  [`${StatusBadgeMap.PENDING}`]: 'warning',
};

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const statusBadgeValues = Object.values(StatusBadgeMap);

const mockData = Array(5)
  .fill(null)
  .map(() => ({
    createdAt: dayjs().subtract(generateRandomNumber(2, 3), 'd').toString(),
    updatedAt: dayjs().subtract(generateRandomNumber(3, 4), 'd').toString(),
    executedAt: dayjs().subtract(generateRandomNumber(4, 5), 'd').toString(),
    callFunc:
      generateRandomNumber(0, 1) === 0
        ? 'Accept Transaction'
        : 'Change Threshold',
    approvals: Array(generateRandomNumber(0, 2))
      .fill(null)
      .map(() => ({})),
    signatories: Array(generateRandomNumber(3, 5))
      .fill(null)
      .map(() => ({})),
    callArgs: Array(generateRandomNumber(2, 5))
      .fill(null)
      .map((_v, i) => `param ${i + 1}`),
    status:
      statusBadgeValues[generateRandomNumber(0, statusBadgeValues.length - 1)],
  }));

const Transactions = ({ address }: ITransactionsProps) => {
  const [, setSearchTerm] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    offset: 0,
  });

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const displayButtons = (txn: any) => {
    switch (txn.status) {
      case 'EXECUTABLE':
        return (
          <div className='flex w-full justify-center'>
            <button
              className={cn('btn btn-primary min-w-[60%]', {
                disabled: generateRandomNumber(0, 1) === 0,
              })}>
              Execute
            </button>
          </div>
        );

      case 'PENDING':
        return (
          <div className='flex w-full justify-center gap-2'>
            <button className='btn btn-outline flex-1'>Reject</button>
            <button className='btn btn-primary flex-1'>Approve</button>
          </div>
        );

      case 'EXECUTED':
        return null;

      case 'REJECTED':
        return null;

      default:
        return null;
    }
  };
  return (
    <>
      <div className='flex text-center'>
        <div className='text-2xl font-semibold'>Transactions</div>
        <div className='relative ml-auto'>
          <Search className='absolute inset-y-0 left-2 my-auto h-4 w-4 fill-black' />
          <input
            className='my-auto rounded-lg px-3 py-2 pl-8 text-sm'
            placeholder='Search'
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className='space-y-3'>
        <>
          {mockData?.map((txn, index) => {
            return (
              <Accordion.Container
                key={index}
                id={index}
                onClick={() =>
                  setActiveAccordion(activeAccordion === index ? null : index)
                }
                color={
                  (AccordionHeaderColorMap[txn.status as any] as any) || 'base'
                }
                expanded={index === activeAccordion}>
                <Accordion.Header className='flex gap-2 text-sm'>
                  <div className='grow font-semibold'>{txn.callFunc}</div>
                  <div>{formatDateTime(txn.createdAt)}</div>
                  <UserTally
                    value={txn.approvals?.length}
                    over={txn.signatories?.length}
                  />
                  <TransactionBadge
                    status={StatusBadgeMap[txn.status as any] as any}
                  />
                </Accordion.Header>
                <Accordion.Content className='flex divide-x'>
                  <div className='flex w-2/3 flex-col space-y-3 px-2 pr-4'>
                    <div>
                      <div>
                        <p className='font-semibold'>
                          Required Confirmations to accept new transactions:{' '}
                        </p>
                        {txn.signatories.length - txn.approvals.length}
                      </div>
                    </div>
                    <div>
                      <div>
                        <p className='font-semibold'>{txn.callFunc}: </p>
                        {txn.callArgs
                          ?.map((item: any) => {
                            return truncateMiddle(item.toString());
                          })
                          .join(', ')}
                      </div>
                    </div>
                    <div>
                      <p className='font-semibold'>Created at: </p>
                      {formatDateTime(txn.createdAt)}
                    </div>
                    <div>
                      <p className='font-semibold'>Updated at: </p>
                      {formatDateTime(txn.updatedAt)}
                    </div>
                    {txn.status === 'EXECUTED' && (
                      <div>
                        <p className='font-semibold'>Executed at: </p>
                        {formatDateTime(txn.executedAt)}
                      </div>
                    )}
                  </div>
                  <div className='grow space-y-2 px-3'>
                    <Timeline>
                      {[
                        'Created',
                        `Confirmations ${txn.approvals.length} of ${txn.signatories.length}`,
                        'Executed',
                      ].map((step, stepIndex) => (
                        <Timeline.Item
                          key={`${stepIndex}-${step}`}
                          {...(stepIndex <=
                            (StatusStepMap[txn.status as any] as any) && {
                            status:
                              stepIndex === StatusStepMap[txn.status as any]
                                ? 'active'
                                : 'completed',
                          })}>
                          {step}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                    {txn.status !== 'EXECUTED' && (
                      <div>Can be executed once threshold is reached</div>
                    )}

                    <div className='flex justify-center'>
                      {displayButtons(txn)}
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Container>
            );
          })}
        </>
      </div>
      <div>
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={10}
          totalCount={mockData.length}
          onPageChange={(newPage, newOffset) =>
            setPagination({ currentPage: newPage, offset: newOffset })
          }
        />
      </div>
    </>
  );
};
export default Transactions;
