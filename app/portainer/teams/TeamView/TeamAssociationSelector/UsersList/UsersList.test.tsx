import { render } from '@/react-tools/test-utils';

import { UsersList } from './UsersList';

test('renders correctly', () => {
  const queries = renderComponent();

  expect(queries).toBeTruthy();
});

function renderComponent() {
  return render(<UsersList users={[]} onAddUsers={() => {}} />);
}

test.todo('when users list is empty, add all users button is disabled');
test.todo('filter displays expected users');
