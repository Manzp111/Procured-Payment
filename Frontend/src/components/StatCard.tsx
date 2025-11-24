// src/components/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color: string;
}

const StatCard = ({ title, value, change, color }: StatCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            <div className="h-6 w-6 bg-white bg-opacity-20 rounded-full"></div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  {change.startsWith('+') ? '↑' : ''}{change}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;