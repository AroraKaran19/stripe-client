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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { TimeSeriesPoint } from "../../../services/analytics.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsLineChartProps {
  currentData: TimeSeriesPoint[];
  previousData: TimeSeriesPoint[];
  currency?: string;
  showYAxis?: boolean;
}

const AnalyticsLineChart = ({
  currentData,
  previousData,
  currency = "US$",
  showYAxis = true,
}: AnalyticsLineChartProps) => {
  // Format dates for labels - format like "26 Oct" for daily, or "26 Oct, 00:00" for hourly
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      // Check if it's hourly format (contains time component)
      if (dateString.includes("T") && dateString.includes(":00:00")) {
        // Hourly format: "26 Oct, 00:00" (date + time in 24-hour format)
        // Use UTC methods to avoid timezone shifts
        const day = date.getUTCDate();
        const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        return `${day} ${month}, ${hours}:${minutes}`;
      }
      
      // Daily format: "26 Oct" or "1 Nov"
      const day = date.getUTCDate();
      const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
      return `${day} ${month}`;
    } catch {
      return dateString;
    }
  };

  // Use ONLY current period dates for x-axis labels (overlay approach)
  const allDates = currentData.map(d => d.date).sort();

  // Create labels - only show first and last date on X-axis
  const labels = allDates.map(formatDate);
  
  // Map data points to match labels
  const currentValues = allDates.map(
    (date) => currentData.find((d) => d.date === date)?.value || 0
  );

  // For previous data, we need to shift the dates to match current period's timeline
  // If current is Sep 26-Oct 2 and previous is Sep 19-Sep 25, we display previous data
  // over the same Sep 26-Oct 2 dates on the chart (overlay style)
  const previousValues = allDates.map((_, index) => {
    // Use the same index position from previous data (which has same length)
    return previousData[index]?.value || 0;
  });

  const maxValue = Math.max(
    ...currentValues,
    ...previousValues,
    100 // minimum to show some scale
  );

  // Calculate nice Y-axis steps (0, 200, 400, 600, etc.)
  const calculateYTicks = () => {
    if (maxValue === 0) return [0, 100, 200];
    
    // Calculate a tighter range - add 15% padding above max value
    const paddedMax = Math.ceil(maxValue * 1.15);
    
    // Find appropriate step size based on the actual data range
    let step = 200;
    
    if (paddedMax <= 50) {
      step = 10;
    } else if (paddedMax <= 100) {
      step = 20;
    } else if (paddedMax <= 200) {
      step = 50;
    } else if (paddedMax <= 500) {
      step = 100;
    } else if (paddedMax <= 600) {
      step = 200;
    } else if (paddedMax <= 1000) {
      step = 200;
    } else if (paddedMax <= 2000) {
      step = 500;
    } else if (paddedMax <= 5000) {
      step = 1000;
    } else if (paddedMax <= 10000) {
      step = 2000;
    } else if (paddedMax <= 50000) {
      step = 10000;
    } else {
      // For very large values, use logarithmic-like steps
      const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
      step = Math.ceil(paddedMax / 5 / magnitude) * magnitude;
    }
    
    const ticks: number[] = [];
    let currentValue = 0;
    // Generate ticks up to paddedMax, but cap at reasonable number
    while (currentValue <= paddedMax && ticks.length < 6) {
      ticks.push(currentValue);
      currentValue += step;
    }
    
    // Ensure we have at least the max value in ticks
    if (ticks.length === 0 || ticks[ticks.length - 1] < paddedMax) {
      ticks.push(Math.ceil(paddedMax / step) * step);
    }
    
    return ticks.length > 0 ? ticks : [0, step];
  };

  const yTicks = calculateYTicks();

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          size: 11,
        },
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            if (value === null || value === undefined || isNaN(value)) {
              return currency ? `${currency}0` : "0";
            }
            if (currency) {
              // Format like "US$235.00"
              const formatted = value.toFixed(2);
              // Remove trailing zeros if whole number
              return `${currency}${parseFloat(formatted).toString()}`;
            }
            return value.toString();
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: "#f3f4f6",
          drawOnChartArea: true,
          drawTicks: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          color: "#6b7280",
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          // Only show first and last labels
          callback: function (value: string | number | null) {
            if (value === null || value === undefined) return "";
            const index = typeof value === "number" ? value : parseInt(value as string);
            if (isNaN(index) || index < 0 || index >= labels.length) return "";
            if (index === 0 || index === labels.length - 1) {
              return labels[index];
            }
            return "";
          },
          padding: 4,
        },
      },
      y: {
        display: showYAxis,
        position: "right" as const, // Y-axis on the right side
        border: {
          display: false,
        },
        grid: {
          display: false, // Hide grid lines for Y-axis (only show X-axis grid)
          color: "#f3f4f6",
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          color: "#6b7280",
          padding: 4,
          maxTicksLimit: 6,
          stepSize: undefined, // Will use calculated ticks
          callback: function (value) {
            const numValue = Number(value);
            // Only show ticks that match our calculated values
            if (yTicks.includes(numValue)) {
              if (currency) {
                // Format large numbers with abbreviations (K, M)
                if (numValue >= 1000000) {
                  return `${currency}${(numValue / 1000000).toFixed(1)}M`;
                } else if (numValue >= 1000) {
                  return `${currency}${(numValue / 1000).toFixed(1)}K`;
                }
                return `${currency}${numValue.toLocaleString()}`;
              }
              // For non-currency, format large numbers
              if (numValue >= 1000000) {
                return `${(numValue / 1000000).toFixed(1)}M`;
              } else if (numValue >= 1000) {
                return `${(numValue / 1000).toFixed(1)}K`;
              }
              return numValue.toLocaleString();
            }
            return "";
          },
        },
        max: yTicks.length > 0 ? yTicks[yTicks.length - 1] : Math.ceil(maxValue * 1.15),
        min: 0,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Current Period",
        data: currentValues,
        borderColor: "#9966ff", // Purple for current period (solid line)
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "#9966ff",
        pointHoverBorderColor: "#ffffff",
        fill: false,
        tension: 0.4,
        spanGaps: false,
      },
      {
        label: "Previous Period",
        data: previousValues,
        borderColor: "#9ca3af", // Light grey for previous period (dashed line)
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line pattern
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "#9ca3af",
        pointHoverBorderColor: "#ffffff",
        fill: false,
        tension: 0.4,
        spanGaps: false,
      },
    ],
  };

  // Use key prop to force re-render when data changes
  const chartKey = `${currentData.length}-${previousData.length}-${JSON.stringify(currentData.slice(0, 2))}`;

  return (
    <div className="w-full" style={{ height: "180px", position: "relative", paddingBottom: "0" }}>
      <Line key={chartKey} options={options} data={data} />
    </div>
  );
};

export default AnalyticsLineChart;

