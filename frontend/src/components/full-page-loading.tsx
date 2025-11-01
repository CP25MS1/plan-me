import { Spinner } from './ui/spinner';

const FullPageLoading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Spinner className="size-8 text-primary" />
    </div>
  );
};

export default FullPageLoading;
