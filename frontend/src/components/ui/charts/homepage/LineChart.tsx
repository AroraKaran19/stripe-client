import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  currentData: TimeSeriesPoint[];
  previousData: TimeSeriesPoint[];
  currency?: string;
}

const generateLabels = (data: TimeSeriesPoint[]) => {
  if (data.length === 0) {
    // Default to 24-hour labels for hourly view
    return Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      return `${hour}:00`;
    });
  }

  // Check if data is hourly (has time component)
  const firstDate = data[0]?.date || "";
  const isHourly = firstDate.includes("T") && firstDate.includes(":");

  if (isHourly) {
    // For hourly data, show hour labels
    return data.map((point) => {
      const date = new Date(point.date);
      const hour = String(date.getHours()).padStart(2, "0");
      return `${hour}:00`;
    });
  } else {
    // For daily data, show date labels
    return data.map((point) => {
      const date = new Date(point.date);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      return `${day} ${month}`;
    });
  }
};

const baseOptions: ChartOptions<"line"> = {
  responsive: true,
  interaction: {
    intersect: false,
    mode: "index" as const,
    axis: "x" as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      intersect: false,
    },
  },
  scales: {
    x: {
      border: {
        display: false,
      },
      grid: {
        display: true,
        drawOnChartArea: true,
      },
      ticks: {
        maxRotation: 0,
        align: "inner",
        minRotation: 0,
        autoSkip: false,
        stepSize: 1,
      },
    },
    y: {
      display: false,
    },
  },
};

const LineChart = ({ currentData, previousData, currency = "US$" }: LineChartProps) => {
  const labels = generateLabels(currentData.length > 0 ? currentData : previousData);
  
  // Extract values from time series data
  const currentValues = currentData.map(point => point.value || 0);
  const previousValues = previousData.map(point => point.value || 0);

  // Ensure both datasets have the same length as labels
  const padData = (data: number[], length: number) => {
    if (data.length >= length) return data.slice(0, length);
    return [...data, ...Array(length - data.length).fill(0)];
  };

  const paddedCurrent = padData(currentValues, labels.length);
  const paddedPrevious = padData(previousValues, labels.length);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Current",
        data: paddedCurrent,
        borderColor: "#533afd",
        backgroundColor: "rgba(83, 58, 253, 0.5)",
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: "Previous",
        data: paddedPrevious,
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
        pointRadius: 0,
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (currency) {
              return `${currency}${value.toFixed(2)}`;
            }
            return value.toString();
          },
        },
      },
    },
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales?.x,
        ticks: {
          ...baseOptions.scales?.x?.ticks,
          maxTicksLimit: labels.length,
          callback: function (value: string | number) {
            const labelIndex =
              typeof value === "number" ? value : parseInt(value as string);
            // Show only first and last labels, but grid lines will show for all
            if (labelIndex === 0 || labelIndex === labels.length - 1) {
              return labels[labelIndex];
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <Line options={chartOptions} data={chartData} className="h-full max-h-[168px]" />
  );
};

export default LineChart;
