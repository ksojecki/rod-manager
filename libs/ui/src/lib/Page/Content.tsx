import type { ReactElement, ReactNode } from 'react';

export type ContentProps = { children: ReactNode | ReactNode[] };
export type TitleProps = { children: string };

export type TitleType = ReactElement<ContentProps>;
export type ContentType = ReactElement<TitleProps>;

export const Title = ({ children }: TitleProps): TitleType => (
  <h1 className="text-3xl">{children}</h1>
);

export const Content = ({ children }: ContentProps): ContentType => {
  return <>{children}</>;
};
