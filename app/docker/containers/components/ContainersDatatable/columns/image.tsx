import { Column } from 'react-table';
import { useSref } from '@uirouter/react';

import { EnvironmentStatus } from '@/portainer/environments/types';
import type { DockerContainer } from '@/docker/containers/types';

import { useRowContext } from '../RowContext';

export const image: Column<DockerContainer> = {
  Header: 'Image',
  accessor: 'Image',
  id: 'image',
  disableFilters: true,
  Cell: ImageCell,
  canHide: true,
  sortType: 'string',
  Filter: () => null,
};

interface Props {
  value: string;
}

function ImageCell({ value: imageName }: Props) {
  const { environment } = useRowContext();
  const offlineMode = environment.Status !== EnvironmentStatus.Up;

  const shortImageName = trimSHASum(imageName);

  const linkProps = useSref('docker.images.image', { id: imageName });
  if (offlineMode) {
    return shortImageName;
  }

  return (
    <a href={linkProps.href} onClick={linkProps.onClick}>
      {shortImageName}
    </a>
  );

  function trimSHASum(imageName: string) {
    if (!imageName) {
      return '';
    }

    if (imageName.indexOf('sha256:') === 0) {
      return imageName.substring(7, 19);
    }

    return imageName.split('@sha256')[0];
  }
}
