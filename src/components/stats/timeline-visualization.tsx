"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AggregatedTimelineData,
  GranularityType,
  MetricType,
  TimeRange,
  formatChartDate,
  formatPercentage,
  getMetricData,
  aggregateDataByGranularity,
} from "@/lib/spaced-repetition/timeline-utils";
import { useTimelineStats } from "@/lib/spaced-repetition/hooks/use-timeline-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface TooltipData {
  payload: {
    name: string;
    value: number;
    color: string;
  }[];
  label: string;
  active?: boolean;
}

// Custom tooltip for the charts
const CustomTooltip = ({ active, payload, label }: TooltipData) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}:{" "}
            {entry.value.toString().includes("%")
              ? entry.value
              : entry.value.toFixed(0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Progress Metrics Chart Component
const ProgressMetricsChart = ({
  data,
  metric,
  granularity,
}: {
  data: AggregatedTimelineData;
  metric: MetricType;
  granularity: GranularityType;
}) => {
  // Apply granularity to data
  const processedData = aggregateDataByGranularity(
    data.progressOverTime,
    granularity,
  );
  const chartData = getMetricData(processedData, metric).map((item) => ({
    date: formatChartDate(item.date),
    [metric]: item.value,
  }));

  // Determine y-axis domain and label based on metric
  const isPercentage = metric === "accuracy";
  const yAxisLabel =
    metric === "learned"
      ? "Flags Learned"
      : metric === "reviewed"
        ? "Flags Reviewed"
        : "Accuracy (%)";
  const yAxisDomain = isPercentage ? [0, 100] : undefined;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs fill-foreground" />
          <YAxis
            domain={yAxisDomain}
            tickFormatter={isPercentage ? formatPercentage : undefined}
            className="text-xs fill-foreground"
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              className: "fill-foreground text-xs",
            }}
          />
          <Tooltip
            content={<CustomTooltip active={false} payload={[]} label="" />}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
            name={
              metric === "learned"
                ? "Flags Learned"
                : metric === "reviewed"
                  ? "Flags Reviewed"
                  : "Accuracy"
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Daily Activity Chart Component
const DailyActivityChart = ({ data }: { data: AggregatedTimelineData }) => {
  // Format data for the activity chart
  const chartData = data.dailyActivity.map((item) => ({
    date: formatChartDate(item.date),
    learned: item.flagsLearned,
    reviewed: item.flagsReviewed,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs fill-foreground" />
          <YAxis className="text-xs fill-foreground" />
          <Tooltip
            content={<CustomTooltip active={false} payload={[]} label="" />}
          />
          <Legend />
          <Bar
            dataKey="learned"
            name="Flags Learned"
            fill="var(--chart-2)"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="reviewed"
            name="Flags Reviewed"
            fill="var(--chart-4)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Weekday Breakdown Chart Component
const WeekdayBreakdownChart = ({ data }: { data: AggregatedTimelineData }) => {
  const chartData = data.weekdayBreakdown.map((item) => ({
    day: item.day,
    learned: item.flagsLearned,
    reviewed: item.flagsReviewed,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="day" className="text-xs fill-foreground" />
          <YAxis className="text-xs fill-foreground" />
          <Tooltip
            content={<CustomTooltip active={false} payload={[]} label="" />}
          />
          <Legend />
          <Bar
            dataKey="learned"
            name="Flags Learned"
            fill="var(--chart-2)"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="reviewed"
            name="Flags Reviewed"
            fill="var(--chart-4)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Timeline Visualization Component
export function TimelineVisualization() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [metric, setMetric] = useState<MetricType>("learned");
  const [granularity, setGranularity] = useState<GranularityType>("daily");

  // Use our new hook to get timeline data
  const { data: timelineData, isLoading, error } = useTimelineStats(timeRange);

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !timelineData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Time Range</label>
          <Select
            value={timeRange}
            onValueChange={(value: string) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Metric</label>
          <Select
            value={metric}
            onValueChange={(value: string) => setMetric(value as MetricType)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learned">Flags Learned</SelectItem>
              <SelectItem value="reviewed">Flags Reviewed</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Granularity</label>
          <Select
            value={granularity}
            onValueChange={(value: string) =>
              setGranularity(value as GranularityType)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Granularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="weekday">By Day of Week</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressMetricsChart
                data={timelineData}
                metric={metric}
                granularity={granularity}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Daily Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyActivityChart data={timelineData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekday">
          <Card>
            <CardHeader>
              <CardTitle>Learning Activity by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              <WeekdayBreakdownChart data={timelineData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Flags Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineData.progressOverTime[
                timelineData.progressOverTime.length - 1
              ]?.flagsLearned || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineData.progressOverTime[
                timelineData.progressOverTime.length - 1
              ]?.flagsReviewed || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                timelineData.progressOverTime[
                  timelineData.progressOverTime.length - 1
                ]?.accuracy || 0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
