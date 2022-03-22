import { Meta } from '@storybook/react';

import { createMockUsers } from '@/react-tools/test-mocks';

import { UsersList } from './UsersList';

const meta: Meta = {
  title: 'Teams/TeamAssociationSelector/UsersList',
  component: UsersList,
};

export default meta;

export { Example };

function Example() {
  const users = createMockUsers(20);

  return (
    <UsersList
      users={users}
      onAddUsers={(userIds) =>
        alert(
          `add ${userIds
            .map((userId) => users.find((u) => u.Id === userId)?.Username)
            .join(',')}`
        )
      }
    />
  );
}

Example.args = {};
