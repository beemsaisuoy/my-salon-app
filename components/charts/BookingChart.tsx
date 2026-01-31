'use client';

interface DataPoint {
    label: string;
    value: number;
}

interface BookingChartProps {
    data: DataPoint[];
    height?: number;
}

export default function BookingChart({ data, height = 250 }: BookingChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                ไม่มีข้อมูล
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="chart-container">
            <h3 className="font-kanit font-semibold text-gray-800 mb-4">📊 จำนวนจองรายวัน</h3>
            <div className="flex items-end justify-around gap-2" style={{ height }}>
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 max-w-16">
                        {/* Value label */}
                        <span className="text-xs font-semibold text-gray-600 mb-1">
                            {d.value}
                        </span>
                        {/* Bar */}
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-pink-primary to-pink-300 transition-all duration-500 hover:from-pink-dark hover:to-pink-primary"
                            style={{
                                height: `${(d.value / maxValue) * 100}%`,
                                minHeight: d.value > 0 ? '20px' : '4px',
                            }}
                        />
                        {/* Label */}
                        <span className="text-xs text-gray-500 mt-2 text-center">
                            {d.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
