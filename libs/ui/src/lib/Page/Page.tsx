import type { ContentType, TitleType } from './Content';

export interface PageProps {
  children: [TitleType, ContentType];
  className?: string;
}

export const Page = ({ children, className }: PageProps) => {
  const newClassName = `p-4 w-full flex flex-col gap-4 ${className ?? ''}`;
  const [title, content] = children;
  return (
    <main className={newClassName}>
      {title}
      {content}
    </main>
  );
};
