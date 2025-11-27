import { Empty, EmptyDescription, EmptyTitle } from '../ui/empty';

type Props = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: Props) => {
  return (
    <Empty>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </Empty>
  );
};

export default EmptyState;
