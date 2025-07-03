'use client';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

import { useState, useMemo } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Brush,
	ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define a set of colors for the lines
const COLORS = [
	'#10b981',
	'#3b82f6',
	'#ef4444',
	'#f59e0b',
	'#8b5cf6',
	'#ec4899',
	'#06b6d4',
	'#84cc16',
	'#f97316',
	'#6366f1',
];

interface AnalysisStats {
	avg: number;
	min: number;
	max: number;
	std: number;
}

interface TimeSeriesAnalyzerProps {
	data: {
		date: string;
		data: Array<Record<string, any>>; // ← the new format
		stats: Record<string, AnalysisStats>;
	};
}

export default function TimeSeriesAnalyzer({ data }: TimeSeriesAnalyzerProps) {
	const chartRef = useRef<HTMLDivElement>(null);

	const columns = useMemo(() => {
		if (!data || !data.data || data.data.length === 0) return [];
		return Object.keys(data.data[0]).filter((key) => key !== 'time');
	}, [data]);

	const [selectedColumn, setSelectedColumn] = useState<string>('all');
	const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
		columns.reduce((acc, col) => ({ ...acc, [col]: true }), {}),
	);

	const handleDownloadImage = async () => {
		if (!chartRef.current) return;
		const canvas = await html2canvas(chartRef.current);
		const link = document.createElement('a');
		link.download = `chart-${new Date().toISOString()}.png`;
		link.href = canvas.toDataURL();
		link.click();
	};

	const toggleColumnVisibility = (column: string) => {
		setVisibleColumns((prev) => ({
			...prev,
			[column]: !prev[column],
		}));
	};

	const showAllColumns = () => {
		setVisibleColumns(
			columns.reduce((acc, col) => ({ ...acc, [col]: true }), {}),
		);
	};

	const hideAllColumns = () => {
		setVisibleColumns(
			columns.reduce((acc, col) => ({ ...acc, [col]: false }), {}),
		);
	};

	const formattedData = useMemo(() => {
		if (!data || !data.data || !Array.isArray(data.data)) return [];

		return data.data.map((item) => {
			const timeObj = parseISO(item.time as string);
			const formattedTime = format(timeObj, 'HH:mm:ss');
			return { ...item, formattedTime };
		});
	}, [data]);

	const statistics = useMemo(() => {
		if (!data || !data.stats) return null;

		if (selectedColumn === 'all') {
			return columns.reduce(
				(acc, column) => {
					if (data.stats[column]) acc[column] = data.stats[column];
					return acc;
				},
				{} as Record<string, AnalysisStats>,
			);
		}

		return data.stats[selectedColumn]
			? { [selectedColumn]: data.stats[selectedColumn] }
			: null;
	}, [data, selectedColumn, columns]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="rounded-md bg-white p-3 shadow-md dark:bg-gray-800">
					<p className="mb-2 font-medium">{label}</p>
					{payload.map((entry: any, index: number) => (
						<div key={`item-${index}`} className="flex items-center gap-2">
							<div
								className="h-3 w-3 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<p className="text-sm">
								{entry.name}:{' '}
								<span className="font-medium">{entry.value.toFixed(2)}</span>
							</p>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="w-full md:w-1/3">
					<label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Seleccionar variable para analizar
					</label>
					<Select value={selectedColumn} onValueChange={setSelectedColumn}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Seleccionar variable" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								Todas las variables{' '}
								<span className="text-xs text-red-500">(puede ser lento)</span>
							</SelectItem>
							{columns.map((column) => (
								<SelectItem key={column} value={column}>
									{column}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={showAllColumns}
						disabled={Object.values(visibleColumns).every((v) => v)}
						className="flex items-center gap-1"
					>
						<Eye className="h-4 w-4" />
						<span className="hidden sm:inline">Mostrar todo</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={hideAllColumns}
						disabled={Object.values(visibleColumns).every((v) => !v)}
						className="flex items-center gap-1"
					>
						<EyeOff className="h-4 w-4" />
						<span className="hidden sm:inline">Ocultar todo</span>
					</Button>
					<Badge
						variant="outline"
						className="flex items-center gap-1 px-3 py-1"
					>
						<Info className="h-3 w-3" />
						{formattedData.length} puntos de datos
					</Badge>
				</div>
			</div>

			{selectedColumn === 'all' && (
				<div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{columns.map((column, index) => (
							<div key={column} className="flex items-center space-x-2">
								<Switch
									id={`switch-${column}`}
									checked={visibleColumns[column]}
									onCheckedChange={() => toggleColumnVisibility(column)}
								/>
								<Label
									htmlFor={`switch-${column}`}
									className="flex items-center gap-1 text-sm"
								>
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: COLORS[index % COLORS.length] }}
									/>
									<span className="truncate">{column}</span>
								</Label>
							</div>
						))}
					</div>
				</div>
			)}

			<Tabs defaultValue="chart" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="chart">Gráfico</TabsTrigger>
					<TabsTrigger value="statistics">Estadísticas</TabsTrigger>
				</TabsList>

				<TabsContent value="chart" className="pt-4">
					<div className="flex justify-end pb-2">
						<Button size="sm" onClick={handleDownloadImage}>
							Descargar imagen
						</Button>
					</div>
					<div
						ref={chartRef}
						className="h-[500px] w-full bg-white dark:bg-gray-900 p-4 rounded-lg"
					>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={formattedData}
								margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="formattedTime"
									label={{
										value: 'Tiempo',
										position: 'insideBottom',
										offset: -10,
										fill: '#666',
									}}
									angle={-45}
									textAnchor="end"
									height={70}
								/>
								<YAxis
									label={{
										value: 'Valor',
										angle: -90,
										position: 'insideLeft',
										fill: '#666',
									}}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend />
								<Brush dataKey="formattedTime" height={30} stroke="#10b981" />

								{selectedColumn === 'all' ? (
									columns.map(
										(column, index) =>
											visibleColumns[column] && (
												<Line
													key={column}
													type="monotone"
													dataKey={column}
													name={column}
													stroke={COLORS[index % COLORS.length]}
													dot={false}
													activeDot={{ r: 6 }}
												/>
											),
									)
								) : (
									<Line
										type="monotone"
										dataKey={selectedColumn}
										name={selectedColumn}
										stroke="#10b981"
										dot={false}
										activeDot={{ r: 6 }}
									/>
								)}

								{selectedColumn !== 'all' &&
									statistics &&
									statistics[selectedColumn] && (
										<ReferenceLine
											y={statistics[selectedColumn].avg}
											stroke="#ff7300"
											strokeDasharray="3 3"
											label={{
												value: `Promedio: ${statistics[selectedColumn].avg.toFixed(2)}`,
												position: 'insideBottomRight',
											}}
										/>
									)}
							</LineChart>
						</ResponsiveContainer>
					</div>
				</TabsContent>

				<TabsContent value="statistics" className="pt-4">
					{statistics && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{Object.entries(statistics).map(([column, stats]) => (
								<Card key={column}>
									<CardHeader className="pb-2">
										<CardTitle className="flex items-center gap-2 text-lg">
											<div
												className="h-3 w-3 rounded-full"
												style={{
													backgroundColor:
														COLORS[columns.indexOf(column) % COLORS.length],
												}}
											/>
											{column}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<dl className="space-y-2">
											<div className="flex justify-between">
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Media
												</dt>
												<dd className="font-medium">{stats.avg.toFixed(4)}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Desviación estándar
												</dt>
												<dd className="font-medium">{stats.std.toFixed(4)}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Mínimo
												</dt>
												<dd className="font-medium">{stats.min.toFixed(4)}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Máximo
												</dt>
												<dd className="font-medium">{stats.max.toFixed(4)}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Rango
												</dt>
												<dd className="font-medium">
													{(stats.max - stats.min).toFixed(4)}
												</dd>
											</div>
										</dl>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
