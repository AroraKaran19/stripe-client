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

const labels = Array.from({ length: 24 }, (_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i === 12 ? 12 : i;
  const period = i < 12 ? "AM" : "PM";
  const minutes = hour === 11 && period === "PM" ? "59" : "00";
  return `${hour}:${minutes} ${period}`;
});

export const options: ChartOptions<"line"> = {
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
    y: {
      display: false,
    },
  },
};

// Static data for Dataset 1 (Purple line)
// Starts low, rises early morning, plateaus most of the day, sharp increase at end
const dataset1Data = [
  50, // 12:00 AM - starts low
  50, // 1:00 AM - gradual rise
  120, // 2:00 AM - continues rising
  150, // 3:00 AM - reaches plateau
  150, // 4:00 AM
  150, // 5:00 AM
  150, // 6:00 AM
  150, // 7:00 AM
  150, // 8:00 AM
  150, // 9:00 AM
  150, // 10:00 AM
  150, // 11:00 AM
  150, // 12:00 PM
  150, // 1:00 PM
  150, // 2:00 PM
  150, // 3:00 PM
];

// Static data for Dataset 2 (Gray line)
// Stays near zero most of the day, sharp increase at end
const dataset2Data = [
  25, // 12:00 AM
  25, // 1:00 AM
  25, // 2:00 AM
  25, // 3:00 AM
  25, // 4:00 AM
  25, // 5:00 AM
  25, // 6:00 AM
  25, // 7:00 AM
  25, // 8:00 AM
  25, // 9:00 AM
  25, // 10:00 AM
  25, // 11:00 AM
  25, // 12:00 PM
  25, // 1:00 PM
  25, // 2:00 PM
  25, // 3:00 PM
  25, // 4:00 PM
  25, // 5:00 PM
  25, // 6:00 PM
  25, // 7:00 PM
	25, // 8:00 PM
	25, // 9:00 PM
	950, // 10:00 PM - sharp increase to max
	950, // 11:59 PM
];

export const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: dataset1Data,
      borderColor: "#9966ff",
      backgroundColor: "rgba(153, 102, 255, 0.5)",
      borderWidth: 1,
      pointRadius: 0,
    },
    {
      label: "Dataset 2",
      data: dataset2Data,
      borderColor: "rgb(156, 163, 175)",
      backgroundColor: "rgba(107, 114, 128, 0.5)",
      borderWidth: 1,
      pointRadius: 0,
    },
  ],
};

const LineChart = () => {
  return (
    <Line options={options} data={data} className="h-full max-h-[168px]" />
  );
};

export default LineChart;
