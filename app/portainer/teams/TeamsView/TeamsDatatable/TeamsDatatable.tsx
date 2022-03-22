import { useRowSelectColumn } from '@lineup-lite/hooks';
import {
  Column,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';
import { useMutation, useQueryClient } from 'react-query';

import { notifySuccess } from '@/portainer/services/notifications';
import { r2a } from '@/react-tools/react2angular';
import { Checkbox } from '@/portainer/components/form-components/Checkbox';
import {
  Table,
  TableActions,
  TableContainer,
  TableHeaderRow,
  TableRow,
  TableTitle,
} from '@/portainer/components/datatables/components';
import { Button } from '@/portainer/components/Button';
import {
  SearchBar,
  useSearchBarState,
} from '@/portainer/components/datatables/components/SearchBar';
import { TableFooter } from '@/portainer/components/datatables/components/TableFooter';
import { SelectedRowsCount } from '@/portainer/components/datatables/components/SelectedRowsCount';
import { PaginationControls } from '@/portainer/components/pagination-controls';
import { buildNameColumn } from '@/portainer/components/datatables/components/NameCell';
import {
  TableSettingsProvider,
  useTableSettings,
} from '@/portainer/components/datatables/components/useTableSettings';
import { promiseSequence } from '@/portainer/helpers/promise-utils';
import { TableContent } from '@/portainer/components/datatables/components/TableContent';
import { Team, TeamId } from '@/portainer/teams/types';
import { deleteTeam } from '@/portainer/teams/teams.service';
import { confirmDeletionAsync } from '@/portainer/services/modal.service/confirm';

import { TableSettings } from './types';

const tableKey = 'teams';

const columns: readonly Column<Team>[] = [
  buildNameColumn('Name', 'Id', 'portainer.teams.team'),
] as const;

interface Props {
  teams: Team[];
}

export function TeamsDatatable({ teams }: Props) {
  const { handleRemove } = useRemoveMutation();

  const [searchBarValue, setSearchBarValue] = useSearchBarState(tableKey);
  const { settings, setTableSettings } = useTableSettings<TableSettings>();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    selectedFlatRows,
    gotoPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable<Team>(
    {
      defaultCanFilter: false,
      columns,
      data: teams,

      initialState: {
        pageSize: settings.pageSize || 10,
        sortBy: [settings.sortBy],
        globalFilter: searchBarValue,
      },
      selectCheckboxComponent: Checkbox,
    },

    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowSelectColumn
  );

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  return (
    <div className="row">
      <div className="col-sm-12">
        <TableContainer>
          <TableTitle icon="fa-users" label="Teams" />

          <TableActions>
            <Button color="danger" onClick={handleRemoveClick}>
              <i className="fa fa-trash-alt space-right" aria-hidden="true" />
              Remove
            </Button>
          </TableActions>

          <SearchBar value={searchBarValue} onChange={handleSearchBarChange} />

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
                  <TableHeaderRow<Team>
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
              <TableContent
                prepareRow={prepareRow}
                renderRow={(row, { key, className, role, style }) => (
                  <TableRow<Team>
                    cells={row.cells}
                    key={key}
                    className={className}
                    role={role}
                    style={style}
                  />
                )}
                rows={page}
                emptyContent="No teams found"
              />
            </tbody>
          </Table>

          <TableFooter>
            <SelectedRowsCount value={selectedFlatRows.length} />
            <PaginationControls
              showAll
              pageLimit={pageSize}
              page={pageIndex + 1}
              onPageChange={(p) => gotoPage(p - 1)}
              totalCount={teams.length}
              onPageLimitChange={handlePageSizeChange}
            />
          </TableFooter>
        </TableContainer>
      </div>
    </div>
  );

  function handlePageSizeChange(pageSize: number) {
    setPageSize(pageSize);
    setTableSettings({ pageSize });
  }

  function handleSearchBarChange(value: string) {
    setSearchBarValue(value);
    setGlobalFilter(value);
  }

  function handleSortChange(id: string, desc: boolean) {
    setTableSettings({ sortBy: { id, desc } });
  }

  function handleRemoveClick() {
    const ids = selectedFlatRows.map((row) => row.original.Id);
    handleRemove(ids);
  }
}

const defaultSettings: TableSettings = {
  pageSize: 10,
  sortBy: { id: 'name', desc: false },
};

export function TeamsDatatableContainer(props: Props) {
  return (
    <TableSettingsProvider<TableSettings>
      defaults={defaultSettings}
      storageKey={tableKey}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <TeamsDatatable {...props} />
    </TableSettingsProvider>
  );
}

export const TeamsDatatableAngular = r2a(TeamsDatatableContainer, [
  'teams',
  'isLoading',
]);

function useRemoveMutation() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    async (ids: TeamId[]) =>
      promiseSequence(ids.map((id) => () => deleteTeam(id))),
    {
      meta: {
        error: { title: 'Failure', message: 'Unable to remove team' },
      },
      onSuccess() {
        return queryClient.invalidateQueries(['teams']);
      },
    }
  );

  return { handleRemove };

  async function handleRemove(teams: TeamId[]) {
    const confirmed = await confirmDeletionAsync(
      'Are you sure you want to remove the selected teams?'
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(teams, {
      onSuccess: () => {
        notifySuccess('Teams successfully removed', '');
      },
    });
  }
}
