'use client';

interface DataPoint {
    label: string;
    value: number;
    color: string;
}

interface ProductSalesChartProps {
    data: DataPoint[];
    size?: number;
}

const colors = [
    '#F9A8D4', // pink
    '#F59E0B', // gold
    '#60A5FA', // blue
    '#34D399', // green
    '#A78BFA', // purple
    '#FB923C', // orange
    '#9CA3AF', // gray (others)
];

export default function ProductSalesChart({ data, size = 200 }: ProductSalesChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                ไม่มีข้อมูล
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;

    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (currentAngle - 90) * (Math.PI / 180);

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return {
            ...d,
            pathD,
            color: colors[i % colors.length],
            percentage: ((d.value / total) * 100).toFixed(1),
        };
    });

    return (
        <div className="chart-container">
            <h3 className="font-kanit font-semibold text-gray-800 mb-4">🥧 สินค้าขายดี</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Pie */}
                <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
                    {slices.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.pathD}
                            fill={slice.color}
                            stroke="white"
                            strokeWidth="1"
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                    ))}
                    {/* Center circle for doughnut effect */}
                    <circle cx="50" cy="50" r="25" fill="white" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-gray-800">
                        {total}
                    </text>
                    <text x="50" y="58" textAnchor="middle" className="text-[6px] fill-gray-500">
                        ชิ้น
                    </text>
                </svg>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {slices.map((slice, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: slice.color }}
                            />
                            <span className="flex-1 text-gray-700 truncate">{slice.label}</span>
                            <span className="text-gray-500">{slice.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
