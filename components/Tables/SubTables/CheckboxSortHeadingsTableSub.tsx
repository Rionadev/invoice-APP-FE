import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  formatNameForID,
  formatNumber,
  formatPhoneNumber,
} from '@/lib/utility/formatter';
import {
  checkExpirationDate,
  formatDate,
  sortTableData,
} from '@/lib/utility/tableHelpers';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import Button from '../../UI/Buttons/Button';
import ModalConfirm from '@/components/UI/Modal/ModalConfirm';
import Link from 'next/link';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface CheckBoxItems {
  label: string;
  buttonPath: string;
  disabled?: boolean;
}

interface Props<T, H extends Partial<T>> {
  rows: T[] | null;
  headings: H;
  projectId: string;
  selectedRowId?: string | undefined | null;
  checkboxButtons?: CheckBoxItems[];
  showExpiration?: boolean;
  baseUrl?: string;
  preSortKey?: keyof H;
  onConfirmModal?: (selected: T[]) => void;
  onRowClick?: (uuid: string, projectId: string) => void;
}

export default function CheckboxSubTable<T, H extends Partial<T>>(
  props: Props<T, H>
) {
  const {
    headings,
    rows,
    checkboxButtons,
    projectId,
    selectedRowId,
    showExpiration,
    baseUrl,
    preSortKey,
    onConfirmModal,
    onRowClick,
  } = props;

  const checkbox = useRef<HTMLInputElement | null>(null);

  const [activeHeading, setActiveHeading] = useState<keyof H | null>(null);
  const [sortKey, setSortKey] = useState<keyof H | undefined>(preSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selected, setSelected] = useState<T[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const modalMessage = 'Please confirm that you want to delete.';

  useLayoutEffect(() => {
    if (!rows) return;
    const isIndeterminate =
      selected.length > 0 && selected.length < rows.length;
    setChecked(selected.length === rows.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selected]);

  function toggleAll() {
    if (!rows) return;
    setSelected(checked || indeterminate ? [] : rows);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  const handleHeadingClick = useCallback(
    (heading: keyof H) => {
      const entry = Object.entries(headings).find(
        ([_, value]) => value === heading
      );
      const key = entry ? (entry[0] as keyof H) : undefined;
      if (sortKey === key) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      }
      setActiveHeading(heading);
      setSortKey(key);
    },
    [sortOrder, sortKey]
  );

  const buttonClickHandler = (label: string) => {
    if (label === 'Delete') {
      setOpenModal(true);
    }
  };

  const closeModalHandler = () => {
    setOpenModal(false);
  };

  const stopPropClickHandler: React.MouseEventHandler<
    HTMLButtonElement | HTMLDivElement
  > = (e) => {
    e.stopPropagation();
  };

  const filteredSortedData: T[] | null = useMemo(() => {
    if (!rows) return null;
    const filteredData = rows;
    if (sortKey === undefined) {
      return filteredData;
    }
    return sortTableData(filteredData, sortKey, sortOrder);
  }, [rows, sortKey, sortOrder]);

  const commonHeadingClasses =
    'sticky w-fit max-w-[17rem] top-0 z-10 border-b border-gray-300 bg-white bg-opacity-80 text-left text-sm uppercase font-bold backdrop-blur backdrop-filter text-stak-dark-green';
  const firstHeadingClasses = 'py-3.5 pl-4 pr-3 rounded-tl-lg sm:pl-6 lg:pl-8';
  const middleHeadingClasses = 'px-3 py-3.5';
  const lastHeadingClasses = 'py-3.5 pl-3 pr-3 rounded-tr-lg sm:pr-6 lg:pr-6';

  const commonColClasses =
    'border-b max-w-[10rem] overflow-x-scroll border-gray-200 whitespace-nowrap text-sm text-gray-500';
  const firstColClasses = 'py-2 pl-4 pr-3  sm:pl-6 lg:pl-8';
  const middleColClasses = 'py-1 px-3';
  const lastColClasses = 'py-2 pr-4 pl-3 sm:pr-6 lg:pr-6';
  return (
    <>
      <ModalConfirm
        onCloseModal={closeModalHandler}
        openModal={openModal}
        onConfirm={() => {
          onConfirmModal && onConfirmModal(selected);
          toggleAll();
        }}
        message={modalMessage}
        title="Delete"
      />

      <div className="px-4 grow sm:px-6 lg:px-8">
        <div className="mt-2 flow-root">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle">
              <div className="relative">
                {selected && selected.length > 0 && (
                  <div className="sticky top-0 z-20">
                    <div className="z-20 absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                      {checkboxButtons &&
                        checkboxButtons.map((button, i) => {
                          return (
                            <Button
                              key={i}
                              buttonText={button.label}
                              disabled={button.disabled}
                              onClick={() => buttonClickHandler(button.label)}
                              className="inline-flex items-center px-2 py-1 text-sm font-semibold disabled:cursor-not-allowed"
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-100 px-7 rounded-tl-lg overflow-hidden sm:w-12 sm:px-6 "
                      >
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-stak-dark-green focus:ring-0 focus:ring-offset-0"
                          ref={checkbox}
                          checked={checked}
                          onChange={toggleAll}
                        />
                      </th>
                      {Object.values(headings).map((heading: any, i) => {
                        return (
                          <th
                            key={`${i}`}
                            scope="col"
                            id={formatNameForID(heading)}
                            className={classNames(
                              i === 0
                                ? firstHeadingClasses
                                : i === Object.values(headings).length - 1
                                ? lastHeadingClasses
                                : middleHeadingClasses,
                              commonHeadingClasses
                            )}
                          >
                            <div
                              onClick={() => handleHeadingClick(heading)}
                              className="group inline-flex hover:cursor-pointer"
                            >
                              {heading}
                              <span
                                className={classNames(
                                  activeHeading === heading ? '' : 'invisible',
                                  'ml-2 flex-none rounded bg-gray-100 text-gray-400 group-hover:visible group-focus:visible'
                                )}
                              >
                                {sortOrder === 'desc' ? (
                                  <ChevronDownIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ChevronUpIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  {filteredSortedData && (
                    <tbody>
                      {filteredSortedData.map((element: any, i) => {
                        return (
                          <tr
                            key={`${element.uuid as string}_${i}`}
                            className={`active:bg-slate-300 hover:cursor-pointer ${
                              selected.includes(element) ? 'bg-slate-50' : ''
                            } ${
                              element.uuid === selectedRowId
                                ? 'bg-slate-200 hover:bg-slate-300'
                                : 'hover:bg-slate-50'
                            }`}
                            onClick={() => {
                              onRowClick &&
                                onRowClick(
                                  element.uuid as string,
                                  projectId as string
                                );
                            }}
                          >
                            <td
                              onClick={stopPropClickHandler}
                              className="relative border-b border-gray-300 px-7 sm:w-12 sm:px-6"
                            >
                              {selected.includes(element) && (
                                <div className="absolute inset-y-0 left-0 w-0.5 bg-stak-dark-green" />
                              )}
                              <input
                                type="checkbox"
                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-stak-dark-green focus:ring-0 focus:ring-offset-0"
                                value={element.uuid as string}
                                checked={selected.includes(element)}
                                onChange={(e) =>
                                  setSelected(
                                    e.target.checked
                                      ? [...selected, element]
                                      : selected.filter((el) => el !== element)
                                  )
                                }
                              />
                            </td>
                            {Object.keys(headings).map((headingsKey, j) => {
                              {
                                if (headingsKey === 'numItems') {
                                  return (
                                    <td
                                      key={`${headingsKey}_${j}`}
                                      className={classNames(
                                        j === 0
                                          ? firstColClasses
                                          : j === filteredSortedData.length - 1
                                          ? lastColClasses
                                          : middleColClasses,
                                        commonColClasses,
                                        showExpiration &&
                                          checkExpirationDate(
                                            headingsKey,
                                            element
                                          )
                                          ? 'text-red-500'
                                          : ''
                                      )}
                                    >
                                      {element.numItems && element.numItems}
                                    </td>
                                  );
                                } else {
                                  return (
                                    <td
                                      key={`${headingsKey}_${j}`}
                                      className={classNames(
                                        j === 0
                                          ? firstColClasses
                                          : j === filteredSortedData.length - 1
                                          ? lastColClasses
                                          : middleColClasses,
                                        commonColClasses,
                                        showExpiration &&
                                          checkExpirationDate(
                                            headingsKey,
                                            element
                                          )
                                          ? 'text-red-500'
                                          : ''
                                      )}
                                    >
                                      {baseUrl && (
                                        <Link
                                          href={`${baseUrl}/${element.uuid}`}
                                          className="block h-full w-full"
                                        >
                                          {headingsKey.endsWith('Amt')
                                            ? formatNumber(
                                                element[headingsKey] as string
                                              )
                                            : headingsKey.endsWith('Phone')
                                            ? formatPhoneNumber(
                                                element[headingsKey] as string
                                              )
                                            : headingsKey
                                                .toLowerCase()
                                                .includes('date')
                                            ? formatDate(
                                                element[headingsKey] as string
                                              )
                                            : element[headingsKey]}
                                        </Link>
                                      )}
                                      {!baseUrl &&
                                        (headingsKey.endsWith('Amt')
                                          ? formatNumber(
                                              element[headingsKey] as string
                                            )
                                          : headingsKey.endsWith('Phone')
                                          ? formatPhoneNumber(
                                              element[headingsKey] as string
                                            )
                                          : headingsKey
                                              .toLowerCase()
                                              .includes('date')
                                          ? formatDate(
                                              element[headingsKey] as string
                                            )
                                          : element[headingsKey])}
                                    </td>
                                  );
                                }
                              }
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
