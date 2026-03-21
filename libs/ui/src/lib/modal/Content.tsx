import type { ReactElement, ReactNode } from 'react';

export type TitleType = ReactElement<{ children: string }>;
export type ContentType = ReactElement<{ children: string | ReactNode }>;

type ContentProps = { children: string | ReactNode };
type TitleProps = { children: string };

export const Title = ({ children }: TitleProps): TitleType => (
  <h3 className="font-bold text-lg">{children}</h3>
);

export const Content = ({ children }: ContentProps): ContentType => {
  return <div className="py-4">{children}</div>;
};
