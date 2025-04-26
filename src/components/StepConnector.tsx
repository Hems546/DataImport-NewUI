
import { cn } from '@/lib/utils';

interface StepConnectorProps {
  isCompleted?: boolean;
}

const StepConnector = ({ isCompleted = false }: StepConnectorProps) => {
  return (
    <div className="flex-grow flex items-center justify-center mx-2">
      <div className={cn(
        "h-[1px] w-full", 
        isCompleted ? "bg-green-500" : "bg-gray-200"
      )} />
    </div>
  );
};

export default StepConnector;
