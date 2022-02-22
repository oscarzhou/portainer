import { useCurrentStateAndParams } from '@uirouter/react';
import {
  useTable,
  useSortBy,
  useFilters,
  useGlobalFilter,
  usePagination,
  Row,
} from 'react-table';
import { useRowSelectColumn } from '@lineup-lite/hooks';

import { PaginationControls } from '@/portainer/components/pagination-controls';
import {
  QuickActionsSettings,
  buildAction,
} from '@/portainer/components/datatables/components/QuickActionsSettings';
import {
  Table,
  TableActions,
  TableContainer,
  TableHeaderRow,
  TableRow,
  TableSettingsMenu,
  TableTitle,
  TableTitleActions,
} from '@/portainer/components/datatables/components';
import { multiple } from '@/portainer/components/datatables/components/filter-types';
import { useTableSettings } from '@/portainer/components/datatables/components/useTableSettings';
import { ColumnVisibilityMenu } from '@/portainer/components/datatables/components/ColumnVisibilityMenu';
import {
  SearchBar,
  useSearchBarState,
} from '@/portainer/components/datatables/components/SearchBar';
import type {
  ContainersTableSettings,
  DockerContainer,
} from '@/docker/containers/types';
import { useRowSelect } from '@/portainer/components/datatables/components/useRowSelect';
import { Checkbox } from '@/portainer/components/form-components/Checkbox';
import { TableFooter } from '@/portainer/components/datatables/components/TableFooter';
import { SelectedRowsCount } from '@/portainer/components/datatables/components/SelectedRowsCount';
import { Environment } from '@/portainer/environments/types';
import { useContainers } from '@/docker/containers/queries';
import { Filters } from '@/docker/containers/containers.service';

import { ContainersDatatableActions } from './ContainersDatatableActions';
import { ContainersDatatableSettings } from './ContainersDatatableSettings';
import { useColumns } from './columns';
import { RowProvider } from './RowContext';

export interface Props {
  filters?: Filters;
  isAddActionVisible: boolean;
  isHostColumnVisible: boolean;
  isRefreshVisible: boolean;
  tableKey?: string;
  environment: Environment;
}

const actions = [
  buildAction('logs', 'Logs'),
  buildAction('inspect', 'Inspect'),
  buildAction('stats', 'Stats'),
  buildAction('exec', 'Console'),
  buildAction('attach', 'Attach'),
];

export function ContainersDatatable({
  isAddActionVisible,
  isHostColumnVisible,
  isRefreshVisible,
  environment,
  filters,
}: Props) {
  const { settings, setTableSettings } =
    useTableSettings<ContainersTableSettings>();
  const [searchBarValue, setSearchBarValue] = useSearchBarState('containers');

  const columns = useColumns(isHostColumnVisible);

  const {
    params: { endpointId },
  } = useCurrentStateAndParams();

  const containersQuery = useContainers(
    endpointId,
    true,
    filters,
    isRefreshVisible ? settings.autoRefreshRate * 1000 : undefined
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    selectedFlatRows,
    allColumns,
    gotoPage,
    setPageSize,
    setHiddenColumns,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable<DockerContainer>(
    {
      defaultCanFilter: false,
      columns,
      data: containersQuery.isSuccess ? containersQuery.data : [],
      filterTypes: { multiple },
      initialState: {
        pageSize: settings.pageSize || 10,
        hiddenColumns: settings.hiddenColumns,
        sortBy: [settings.sortBy],
        globalFilter: searchBarValue,
      },
      isRowSelectable(row: Row<DockerContainer>) {
        return !row.original.IsPortainer;
      },
      selectCheckboxComponent: Checkbox,
      autoResetSelectedRows: false,
      autoResetGlobalFilter: false,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowSelectColumn
  );

  const columnsToHide = allColumns.filter((colInstance) => {
    const columnDef = columns.find((c) => c.id === colInstance.id);
    return columnDef?.canHide;
  });

  if (containersQuery.isLoading || !containersQuery.data) {
    return null;
  }

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  return (
    <TableContainer>
      <TableTitle icon="fa-cubes" label="Containers">
        <TableTitleActions>
          <ColumnVisibilityMenu<DockerContainer>
            columns={columnsToHide}
            onChange={handleChangeColumnsVisibility}
            value={settings.hiddenColumns}
          />

          <TableSettingsMenu
            quickActions={<QuickActionsSettings actions={actions} />}
          >
            <ContainersDatatableSettings isRefreshVisible={isRefreshVisible} />
          </TableSettingsMenu>
        </TableTitleActions>
      </TableTitle>

      <TableActions>
        <ContainersDatatableActions
          selectedItems={selectedFlatRows.map((row) => row.original)}
          isAddActionVisible={isAddActionVisible}
          endpointId={environment.Id}
        />
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
              <TableHeaderRow<DockerContainer>
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
                <RowProvider context={{ environment }} key={key}>
                  <TableRow<DockerContainer>
                    cells={row.cells}
                    className={className}
                    role={role}
                    style={style}
                    key={key}
                  />
                </RowProvider>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted">
                No container available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <TableFooter>
        <SelectedRowsCount value={selectedFlatRows.length} />
        <PaginationControls
          showAll
          pageLimit={pageSize}
          page={pageIndex + 1}
          onPageChange={(p) => gotoPage(p - 1)}
          totalCount={containersQuery.data ? containersQuery.data.length : 0}
          onPageLimitChange={handlePageSizeChange}
        />
      </TableFooter>
    </TableContainer>
  );

  function handlePageSizeChange(pageSize: number) {
    setPageSize(pageSize);
    setTableSettings((settings) => ({ ...settings, pageSize }));
  }

  function handleChangeColumnsVisibility(hiddenColumns: string[]) {
    setHiddenColumns(hiddenColumns);
    setTableSettings((settings) => ({ ...settings, hiddenColumns }));
  }

  function handleSearchBarChange(value: string) {
    setSearchBarValue(value);
    setGlobalFilter(value);
  }

  function handleSortChange(id: string, desc: boolean) {
    setTableSettings((settings) => ({
      ...settings,
      sortBy: { id, desc },
    }));
  }
}
