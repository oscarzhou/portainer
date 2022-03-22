import clsx from 'clsx';
import { PropsWithChildren } from 'react';

interface Props {
  className?: string;
}

export function TableActions({
  children,
  className,
}: PropsWithChildren<Props>) {
  return <div className={clsx('actionBar', className)}>{children}</div>;
}
