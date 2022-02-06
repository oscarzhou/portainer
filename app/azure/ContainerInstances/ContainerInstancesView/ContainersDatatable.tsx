import { useEffect } from 'react';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import { useRowSelectColumn } from '@lineup-lite/hooks';

import { PaginationControls } from '@/portainer/components/pagination-controls';
import {
  Table,
  TableActions,
  TableContainer,
  TableHeaderRow,
  TableRow,
  TableTitle,
} from '@/portainer/components/datatables/components';
import { multiple } from '@/portainer/components/datatables/components/filter-types';
import { useTableSettings } from '@/portainer/components/datatables/components/useTableSettings';
import { useDebounce } from '@/portainer/hooks/useDebounce';
import {
  SearchBar,
  useSearchBarState,
} from '@/portainer/components/datatables/components/SearchBar';
import { useRowSelect } from '@/portainer/components/datatables/components/useRowSelect';
import { Checkbox } from '@/portainer/components/form-components/Checkbox';
import { TableFooter } from '@/portainer/components/datatables/components/TableFooter';
import { SelectedRowsCount } from '@/portainer/components/datatables/components/SelectedRowsCount';
import { ContainerGroup } from '@/azure/types';
import { Button } from '@/portainer/components/Button';
import { Authorized } from '@/portainer/hooks/useUser';
import { Link } from '@/portainer/components/Link';

import { TableSettings } from './types';
import { useColumns } from './columns';

export interface Props {
  tableKey: string;
  dataset: ContainerGroup[];
  onRemoveClick(containers: ContainerGroup[]): void;
}

export function ContainersDatatable({
  dataset,
  tableKey,
  onRemoveClick,
}: Props) {
  const { settings, setTableSettings } = useTableSettings<TableSettings>();
  const [searchBarValue, setSearchBarValue] = useSearchBarState(tableKey);

  const columns = useColumns();
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
  } = useTable<ContainerGroup>(
    {
      defaultCanFilter: false,
      columns,
      data: dataset,
      filterTypes: { multiple },
      initialState: {
        pageSize: settings.pageSize || 10,
        sortBy: [settings.sortBy],
        globalFilter: searchBarValue,
      },
      selectCheckboxComponent: Checkbox,
      autoResetSelectedRows: false,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowSelectColumn
  );

  const debouncedSearchValue = useDebounce(searchBarValue);

  useEffect(() => {
    setGlobalFilter(debouncedSearchValue);
  }, [debouncedSearchValue, setGlobalFilter]);

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  return (
    <div className="row">
      <div className="col-sm-12">
        <TableContainer>
          <TableTitle icon="fa-cubes" label="Containers" />

          <TableActions>
            <Authorized authorizations="AzureContainerGroupDelete">
              <Button
                color="danger"
                size="small"
                disabled={selectedFlatRows.length === 0}
                onClick={() =>
                  onRemoveClick(selectedFlatRows.map((row) => row.original))
                }
              >
                <i className="fa fa-trash-alt space-right" aria-hidden="true" />
                Remove
              </Button>
            </Authorized>

            <Authorized authorizations="AzureContainerGroupCreate">
              <Link to="azure.containerinstances.new" className="space-left">
                <Button>
                  <i className="fa fa-plus space-right" aria-hidden="true" />
                  Add container
                </Button>
              </Link>
            </Authorized>
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
                  <TableHeaderRow<ContainerGroup>
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
                    <TableRow<ContainerGroup>
                      cells={row.cells}
                      key={key}
                      className={className}
                      role={role}
                      style={style}
                    />
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-muted"
                  >
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
              totalCount={dataset.length}
              onPageLimitChange={handlePageSizeChange}
            />
          </TableFooter>
        </TableContainer>
      </div>
    </div>
  );

  function handlePageSizeChange(pageSize: number) {
    setPageSize(pageSize);
    setTableSettings((settings) => ({ ...settings, pageSize }));
  }

  function handleSearchBarChange(value: string) {
    setSearchBarValue(value);
  }

  function handleSortChange(id: string, desc: boolean) {
    setTableSettings((settings) => ({
      ...settings,
      sortBy: { id, desc },
    }));
  }
}
