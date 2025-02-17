import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#007bff", "#6c757d", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6610f2"]; // Extendable colors

const DonutChart = ({ data }: { data: { os: string; percentage: number }[] }) => {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]); // Updates when data changes

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="percentage"
          nameKey="os"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
