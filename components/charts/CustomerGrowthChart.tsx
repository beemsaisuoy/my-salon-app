'use client';

interface DataPoint {
    label: string;
    newCustomers: number;
    returningCustomers: number;
}

interface CustomerGrowthChartProps {
    data: DataPoint[];
    height?: number;
}

export default function CustomerGrowthChart({ data, height = 300 }: CustomerGrowthChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                ไม่มีข้อมูล
            </div>
        );
    }

    const maxValue = Math.max(
        ...data.map(d => Math.max(d.newCustomers, d.returningCustomers)),
        1
    );
    const padding = 40;
    const chartWidth = 100;
    const chartHeight = 70;

    const getPoints = (values: number[]) => {
        return values.map((v, i) => {
            const x = padding + (i / (values.length - 1 || 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - (v / maxValue) * (chartHeight - padding * 2);
            return { x, y };
        });
    };

    const newPoints = getPoints(data.map(d => d.newCustomers));
    const returningPoints = getPoints(data.map(d => d.returningCustomers));

    const createPath = (points: { x: number; y: number }[]) =>
        points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className="chart-container">
            <h3 className="font-kanit font-semibold text-gray-800 mb-4">👥 ลูกค้าใหม่ vs ลูกค้าเก่า</h3>

            {/* Legend */}
            <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-pink-primary" />
                    <span className="text-gray-600">ลูกค้าใหม่</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gold-primary" />
                    <span className="text-gray-600">ลูกค้าเก่า</span>
                </div>
            </div>

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

                {/* Returning customers line (background) */}
                <path
                    d={createPath(returningPoints)}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                />

                {/* New customers line (foreground) */}
                <path
                    d={createPath(newPoints)}
                    fill="none"
                    stroke="#F9A8D4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points for new customers */}
                {newPoints.map((p, i) => (
                    <circle
                        key={`new-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="2.5"
                        fill="white"
                        stroke="#F9A8D4"
                        strokeWidth="1.5"
                    />
                ))}

                {/* Points for returning customers */}
                {returningPoints.map((p, i) => (
                    <circle
                        key={`ret-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="2.5"
                        fill="white"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                    />
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => {
                    const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={chartHeight - padding + 10}
                            textAnchor="middle"
                            className="text-[5px] fill-gray-500"
                        >
                            {d.label}
                        </text>
                    );
                })}

                {/* Y-axis labels */}
                <text x={padding - 5} y={chartHeight - padding} textAnchor="end" className="text-[6px] fill-gray-500">
                    0
                </text>
                <text x={padding - 5} y={padding} textAnchor="end" className="text-[6px] fill-gray-500">
                    {maxValue}
                </text>
            </svg>
        </div>
    );
}
