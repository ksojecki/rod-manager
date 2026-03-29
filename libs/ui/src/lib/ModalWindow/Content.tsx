import type { ReactElement, ReactNode } from 'react';
import type { ActionButtonProps } from './ActionButton';

export type ActionButtonType = ReactElement<ActionButtonProps>;

export type ContentProps = { children: string | ReactNode };
export type TitleProps = { children: string };
export type ActionsProps = { children: ActionButtonType[] | ActionButtonType };

export type TitleType = ReactElement<ContentProps>;
export type ContentType = ReactElement<TitleProps>;
export type ActionType = ReactElement<ActionsProps>;

export const Title = ({ children }: TitleProps): TitleType => (
  <h3 className="font-bold text-lg">{children}</h3>
);

export const Content = ({ children }: ContentProps): ContentType => {
  return <div className="py-4">{children}</div>;
};

export const Actions = ({ children }: ActionsProps): ActionType => {
  return <>{children}</>;
};
