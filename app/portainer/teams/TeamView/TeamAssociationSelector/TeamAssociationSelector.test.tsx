import { render } from '@/react-tools/test-utils';

import { TeamAssociationSelector } from './TeamAssociationSelector';

test('renders correctly', () => {
  const queries = renderComponent();

  expect(queries).toBeTruthy();
});

function renderComponent() {
  return render(
    <TeamAssociationSelector
      onAddUsers={() => {}}
      onRemoveUsers={() => {}}
      users={[]}
      onUpdateRoleClick={() => {}}
      memberships={[]}
    />
  );
}
