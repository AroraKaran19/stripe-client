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
  showPrevious?: boolean; // if false, hide dotted previous series
  startDate?: Date;
  endDate?: Date;
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
  const lastDate = data[data.length - 1]?.date || "";
  const isHourly = firstDate.includes("T") && firstDate.includes(":");

  if (isHourly) {
    // Check if it's a single day or multiple days
    const firstDay = new Date(firstDate).toISOString().split('T')[0];
    const lastDay = new Date(lastDate).toISOString().split('T')[0];
    const isSingleDay = firstDay === lastDay;

    if (isSingleDay) {
      // Single day: show only hours (00:00, 01:00, etc.)
      return Array.from({ length: 24 }, (_, i) => {
        const hour = String(i).padStart(2, "0");
        return `${hour}:00`;
      });
    } else {
      // Multiple days: show date + hour for key points
      // Show labels at day boundaries and every few hours
      return data.map((point, index) => {
        const date = new Date(point.date);
        const hour = date.getUTCHours();
        const day = date.getUTCDate();
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        
        // Show label at midnight (00:00) or every 6 hours
        if (hour === 0 || hour % 6 === 0 || index === 0 || index === data.length - 1) {
          return `${day} ${month}, ${String(hour).padStart(2, '0')}:00`;
        }
        return ''; // Empty label for other hours
      });
    }
  } else {
    // For daily/weekly/monthly/yearly data, show date labels
    return data.map((point) => {
      const date = new Date(point.date);
      const day = date.getUTCDate();
      const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      return `${day} ${month}`;
    });
  }
};

const baseOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
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
      type: 'category',
      border: {
        display: false,
      },
      grid: {
        display: true,
        drawOnChartArea: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
        maxTicksLimit: 100,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
    },
  },
};

const LineChart = ({ currentData, previousData, currency = "US$", showPrevious = true, startDate, endDate }: LineChartProps) => {
  // Check if data is hourly (has time component)
  const firstDate = (currentData.length > 0 ? currentData[0]?.date : previousData[0]?.date) || "";
  const isHourly = firstDate.includes("T") && firstDate.includes(":");
  
  // Generate labels from data (backend guarantees correct order)
  const dataForLabels = currentData.length > 0 ? currentData : previousData;
  const labels = generateLabels(dataForLabels);
  
  // Debug: Log data length for hourly charts
  if (isHourly) {
    console.log("LineChart - Hourly data:", {
      currentDataLength: currentData.length,
      previousDataLength: previousData.length,
      labelsLength: labels.length,
      firstLabel: labels[0],
      lastLabel: labels[labels.length - 1],
      allLabels: labels,
      sampleCurrentData: currentData.slice(0, 5),
      sampleCurrentValues: currentData.slice(0, 5).map(d => d.value)
    });
    
    if (currentData.length !== 24) {
      console.warn("⚠️ Expected 24 data points for hourly chart, got:", currentData.length);
    }
  }
  
  // Format date range for display
  // Use UTC date methods to avoid timezone conversion issues
  const formatDateLabel = (date: Date): string => {
    // Extract UTC date parts to ensure consistent display
    const day = date.getUTCDate();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    return `${day} ${month}`;
  };

  const startDateLabel = startDate ? formatDateLabel(startDate) : "";
  const endDateLabel = endDate ? formatDateLabel(endDate) : "";
  
  // For hourly data, ensure we have exactly 24 data points
  const ensureHourlyData = (data: TimeSeriesPoint[]): number[] => {
    if (!isHourly) {
      return data.map(point => point.value || 0);
    }
    
    // Create array of 24 zeros
    const hourlyValues = Array(24).fill(0);
    
    // Fill in actual values from data
    data.forEach(point => {
      const date = new Date(point.date);
      const hour = date.getUTCHours();
      if (hour >= 0 && hour < 24) {
        hourlyValues[hour] = point.value || 0;
      }
    });
    
    return hourlyValues;
  };

  const currentValues = ensureHourlyData(currentData);
  const previousValues = ensureHourlyData(previousData);

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
      ...(showPrevious
        ? [
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
          ]
        : []),
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            
            // For hourly data, show full date and time
            if (isHourly && currentData[index]) {
              const date = new Date(currentData[index].date);
              const day = date.getUTCDate();
              const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
              const hour = String(date.getUTCHours()).padStart(2, '0');
              return `${day} ${month}, ${hour}:00`;
            }
            
            // For other frequencies, use the label
            return labels[index];
          },
          label: (context) => {
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return '';
            }
            const label = context.dataset.label || '';
            if (currency) {
              return `${label}: ${currency}${value.toFixed(2)}`;
            }
            return `${label}: ${value.toString()}`;
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
          callback: function (value: string | number) {
            const labelIndex =
              typeof value === "number" ? value : parseInt(value as string);
            
            // For hourly data, show hour labels at start and end
            if (isHourly) {
              if (labelIndex === 0) {
                return labels[0]; // Show 00:00
              }
              if (labelIndex === labels.length - 1) {
                return labels[labels.length - 1]; // Show 23:00
              }
              return "";
            }
            
            // For daily/weekly/monthly data, show date labels
            if (labelIndex === 0) {
              return startDateLabel || labels[labelIndex];
            }
            if (labelIndex === labels.length - 1) {
              return endDateLabel || labels[labelIndex];
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
