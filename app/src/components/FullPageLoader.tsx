import { Spinner } from '@/components/ui/spinner';

type FullPageLoaderProps = {
  label?: string;
};

const FullPageLoader = ({ label = 'Loading...' }: FullPageLoaderProps) => {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-12 text-lime" />
        <p className="text-sm text-dark/70">{label}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
