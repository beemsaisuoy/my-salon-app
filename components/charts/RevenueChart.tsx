'use client';

interface DataPoint {
    label: string;
    value: number;
}

interface RevenueChartProps {
    data: DataPoint[];
    height?: number;
}

export default function RevenueChart({ data, height = 300 }: RevenueChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                ไม่มีข้อมูล
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const padding = 40;
    const chartWidth = 100;
    const chartHeight = 70;

    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - (d.value / maxValue) * (chartHeight - padding * 2);
        return { x, y, ...d };
    });

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

    return (
        <div className="chart-container">
            <h3 className="font-kanit font-semibold text-gray-800 mb-4">📈 รายได้</h3>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ height }}>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((pct) => (
                    <line
                        key={pct}
                        x1={padding}
                        y1={chartHeight - padding - (pct / 100) * (chartHeight - padding * 2)}
                        x2={chartWidth - padding}
                        y2={chartHeight - padding - (pct / 100) * (chartHeight - padding * 2)}
                        stroke="#f3f4f6"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Area fill */}
                <path
                    d={areaD}
                    fill="url(#goldGradient)"
                    opacity="0.3"
                />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill="white"
                            stroke="#F59E0B"
                            strokeWidth="2"
                        />
                        {/* Label on x-axis */}
                        <text
                            x={p.x}
                            y={chartHeight - padding + 12}
                            textAnchor="middle"
                            className="text-[6px] fill-gray-500"
                        >
                            {p.label}
                        </text>
                    </g>
                ))}

                {/* Y-axis labels */}
                <text x={padding - 5} y={chartHeight - padding} textAnchor="end" className="text-[6px] fill-gray-500">
                    0
                </text>
                <text x={padding - 5} y={padding} textAnchor="end" className="text-[6px] fill-gray-500">
                    ฿{maxValue.toLocaleString()}
                </text>

                {/* Gradient def */}
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
