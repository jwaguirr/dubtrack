import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ScanTrend = {
  scan_date: string;
  total_scans: number;
};

const ScanTrendsChart = ({ data }: { data: ScanTrend[] }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No scan data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="scan_date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total_scans" stroke="#007bff" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ScanTrendsChart;
