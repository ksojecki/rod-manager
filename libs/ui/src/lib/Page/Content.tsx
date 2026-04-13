import type { ReactElement, ReactNode } from 'react';
import { Heading } from '../Typography';

export type ContentProps = { children: ReactNode | ReactNode[] };
export type TitleProps = { children: string };

export type TitleType = ReactElement<ContentProps>;
export type ContentType = ReactElement<TitleProps>;

export const Title = ({ children }: TitleProps): TitleType => (
  <Heading level={1}>{children}</Heading>
);

export const Content = ({ children }: ContentProps): ContentType => {
  return <>{children}</>;
};
