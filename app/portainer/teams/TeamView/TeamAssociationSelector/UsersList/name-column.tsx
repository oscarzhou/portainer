import { CellProps, Column } from 'react-table';

import { User } from '@/portainer/users/types';
import { Button } from '@/portainer/components/Button';

import { useRowContext } from './RowContext';

export const name: Column<User> = {
  Header: 'Name',
  accessor: (row) => row.Username,
  id: 'name',
  Cell: NameCell,
  disableFilters: true,
  Filter: () => null,
  canHide: false,
  sortType: 'string',
};

export function NameCell({
  value: name,
  row: { original: user },
}: CellProps<User, string>) {
  const { onClick } = useRowContext();
  return (
    <>
      {name}

      <Button
        color="link"
        className="space-left nopadding"
        onClick={() => onClick(user.Id)}
      >
        <i className="fa fa-plus-circle space-right" aria-hidden="true" />
        Add
      </Button>
    </>
  );
}
