import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import { useMemo, useState } from 'react';

import { Button } from '@/portainer/components/Button';
import {
  Table,
  TableHeaderRow,
  TableRow,
} from '@/portainer/components/datatables/components';
import {
  Widget,
  WidgetBody,
  WidgetTaskbar,
  WidgetTitle,
} from '@/portainer/components/widget';
import { User, UserId } from '@/portainer/users/types';
import { TableFooter } from '@/portainer/components/datatables/components/TableFooter';
import { PageSelector } from '@/portainer/components/pagination-controls/PageSelector';
import { Input } from '@/portainer/components/form-components/Input';
import { TeamRole } from '@/portainer/teams/types';

import { name } from './name-column';
import { RowContext, RowProvider } from './RowContext';
import { teamRole } from './team-role-column';

const columns = [name, teamRole];

interface Props {
  users: User[];
  roles: Record<UserId, TeamRole>;
  onRemoveUsers(userIds: UserId[]): void;
  onUpdateRoleClick(userId: UserId, role: TeamRole): void;
}

export function TeamMembersList({
  users,
  onRemoveUsers,
  roles,
  onUpdateRoleClick,
}: Props) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const isAdmin = true;
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    setPageSize: setPageSizeInternal,
    setGlobalFilter: setGlobalFilterInternal,
    state: { pageIndex },
    setSortBy,
    rows,
  } = useTable<User>(
    {
      defaultCanFilter: false,
      columns,
      data: users,
      initialState: {
        pageSize,

        sortBy: [{ id: 'name', desc: false }],
        globalFilter: search,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();
  const rowContext = useMemo<RowContext>(
    () => ({
      onRemoveClick: (userId: UserId) => onRemoveUsers([userId]),
      onUpdateRoleClick,
      getRole(userId: UserId) {
        return roles[userId];
      },
    }),
    [onRemoveUsers, onUpdateRoleClick, roles]
  );
  return (
    <Widget>
      <WidgetTitle icon="fa-users" title="Team members">
        Items per page:
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="space-left"
        >
          <option value={Number.MAX_SAFE_INTEGER}>All</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </WidgetTitle>
      <WidgetTaskbar className="col-sm-12 nopadding">
        <div className="col-sm-12 col-md-6 nopadding">
          {isAdmin && (
            <Button
              onClick={() =>
                onRemoveUsers(rows.map(({ original }) => original.Id))
              }
              disabled={users.length === 0}
            >
              <i className="fa fa-user-plus space-right" aria-hidden="true" />
              Remove all users
            </Button>
          )}
        </div>
        <div className="col-sm-12 col-md-6 nopadding">
          <Input
            type="text"
            id="filter-users"
            value={search}
            onChange={handleSearchBarChange}
            placeholder="Filter..."
            className="input-sm"
          />
        </div>
      </WidgetTaskbar>
      <WidgetBody className="nopadding">
        <Table
          className={tableProps.className}
          role={tableProps.role}
          style={tableProps.style}
        >
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key, className, role, style } =
                headerGroup.getHeaderGroupProps();

              return (
                <TableHeaderRow<User>
                  key={key}
                  className={className}
                  role={role}
                  style={style}
                  headers={headerGroup.headers}
                  onSortChange={handleSortChange}
                />
              );
            })}
          </thead>
          <tbody
            className={tbodyProps.className}
            role={tbodyProps.role}
            style={tbodyProps.style}
          >
            {page.length > 0 ? (
              page.map((row) => {
                prepareRow(row);
                const { key, className, role, style } = row.getRowProps();
                return (
                  <RowProvider context={rowContext} key={key}>
                    <TableRow<User>
                      cells={row.cells}
                      key={key}
                      className={className}
                      role={role}
                      style={style}
                    />
                  </RowProvider>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <TableFooter>
          {pageSize !== 0 && (
            <div className="pagination-controls">
              <PageSelector
                maxSize={5}
                onPageChange={(p) => gotoPage(p - 1)}
                currentPage={pageIndex + 1}
                itemsPerPage={pageSize}
                totalCount={rows.length}
              />
            </div>
          )}
        </TableFooter>
      </WidgetBody>
    </Widget>
  );

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pageSize = parseInt(e.target.value, 10);
    setPageSize(pageSize);
    setPageSizeInternal(pageSize);
  }

  function handleSearchBarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSearch(value);
    setGlobalFilterInternal(value);
  }

  function handleSortChange(id: string, desc: boolean) {
    setSortBy([{ id, desc }]);
  }
}
