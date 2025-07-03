import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import DateSelector from '@/components/ui/date-selector';
import { Button } from '@/components/ui/button';
// import HistogramAnalyzer from "@/components/ui/histogram-analyzer"
import TimeSeriesAnalyzer from '@/components/ui/time-series-analyzer';
import { Skeleton } from '@/renderer/components/ui/skeleton';
import { Logo } from '@/components/ui/logo';
import { getBackendUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Types for our data
interface DateOption {
	id: string;
	date: string;
	displayName: string;
}

export default function AnalysisPage() {
	const [dates, setDates] = useState<DateOption[]>([]);
	const [selectedDate, setSelectedDate] = useState<DateOption | null>(null);
	const [dateData, setDateData] = useState<any | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [dataLoading, setDataLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	// Fetch available dates on component mount
	useEffect(() => {
		const fetchDates = async () => {
			try {
				// Replace with your actual API endpoint
				const response = await fetch(
					`${getBackendUrl()}/api/py/available-dates`,
				);
				const { available_dates: data } = await response.json();

				// Format dates for display
				const formattedDates = data.map((date: string) => {
					const parsedDate = parseISO(date);
					return {
						id: date,
						date: date,
						displayName: format(parsedDate, 'PPP', { locale: es }),
					};
				});

				setDates(formattedDates);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching dates:', error);
				setLoading(false);
			}
		};

		fetchDates();
	}, []);

	const handleGoHomeAndClear = async () => {
		try {
			await fetch(`${getBackendUrl()}/api/py/clear-data`, {
				method: 'DELETE',
			});
			navigate('/');
		} catch (error) {
			console.error('Error clearing data:', error);
			alert('Error al limpiar los datos.');
		}
	};

	// Fetch data for selected date
	const fetchDateData = async (date: string) => {
		setDataLoading(true);
		try {
			// Replace with your actual API endpoint
			const response = await fetch(
				`${getBackendUrl()}/api/py/data-by-date?date=${encodeURIComponent(date)}`,
			);
			const data = await response.json();
			console.log('Fetched data for date:', date, data);
			setDateData(data);
			setDataLoading(false);
		} catch (error) {
			console.error('Error fetching date data:', error);
			setDataLoading(false);
		}
	};

	// Handle date selection
	const handleDateSelect = (date: DateOption) => {
		setSelectedDate(date);
		fetchDateData(date.date);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Logo className="h-10 w-10" />
						<h1 className="text-3xl font-bold text-gray-800 dark:text-white">
							Análisis de Datos
						</h1>
					</div>
					<h2 className="text-xl font-medium text-gray-600 dark:text-gray-300">
						Análisis de Datos
					</h2>
					
						<div className="flex justify-end mt-6">
							<Button  onClick={handleGoHomeAndClear}>
								Subir archivos
							</Button>
						</div>
				</header>

				<main className="space-y-8">
					<div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
						<h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
							Selecciona una fecha para analizar
						</h2>

						{loading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<DateSelector
								dates={dates}
								selectedDate={selectedDate}
								onSelectDate={handleDateSelect}
							/>
						)}
					</div>

					{selectedDate && (
						<div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
							<h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
								Análisis para {selectedDate.displayName}
							</h2>

							{dataLoading ? (
								<div className="space-y-4">
									<Skeleton className="h-8 w-1/3" />
									<Skeleton className="h-[400px] w-full" />
								</div>
							) : (
								dateData && <TimeSeriesAnalyzer data={dateData} />
							)}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
