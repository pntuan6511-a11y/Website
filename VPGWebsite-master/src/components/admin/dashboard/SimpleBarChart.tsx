import React from 'react';

interface BarData {
    name: string;
    value: number;
}

interface SimpleBarChartProps {
    data: BarData[];
    title?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, title }) => {
    const max = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="space-y-4">
            {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center">
                        <span className="w-24 text-sm text-gray-600">{item.name}</span>
                        <div className="flex-1 h-4 bg-gray-200 rounded mx-2">
                            <div
                                className="h-4 bg-indigo-500 rounded"
                                style={{ width: `${(item.value / max) * 100}%` }}
                            ></div>
                        </div>
                        <span className="w-12 text-sm font-medium text-gray-800">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleBarChart;
