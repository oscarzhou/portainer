import { render } from '@/react-tools/test-utils';

import { TeamMembersList } from './TeamMembersList';

test('renders correctly', () => {
  const queries = renderComponent();

  expect(queries).toBeTruthy();
});

function renderComponent() {
  return render(
    <TeamMembersList
      users={[]}
      onRemoveUsers={() => {}}
      onUpdateRoleClick={() => {}}
      roles={{}}
    />
  );
}

test.todo('when users list is empty, add all users button is disabled');
test.todo('filter displays expected users');
