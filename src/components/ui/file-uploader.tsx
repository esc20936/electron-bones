'use client';

import { useState, useCallback, useRef } from 'react';
import {
	Upload,
	X,
	AlertCircle,
	CheckCircle2,
	FileSpreadsheet,
	Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn, getBackendUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';


// File with additional metadata for tracking
interface FileWithStatus {
	file: File;
	id: string;
	progress: number;
	status: FileStatus;
	error?: string;
}

// Response data structure
export interface AnalysisData {
	available_dates: string[];
	stats_per_day: {
		[date: string]: {
			[column: string]: {
				avg: number;
				min: number;
				max: number;
				std: number;
			};
		};
	};
	data_per_day: {
		[date: string]: Array<{
			time: string;
			[column: string]: number | string;
		}>;
	};
}

type FileStatus = 'waiting' | 'uploading' | 'uploaded' | 'failed';

interface FileWithStatus {
	file: File;
	id: string;
	progress: number;
	status: FileStatus;
	error?: string;
}

export default function FileUploader() {
	const [files, setFiles] = useState<FileWithStatus[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const MAX_FILES = 55;

	const resetFiles = () => {
		setFiles([]);
	};

	const handleFileSelect = useCallback(
		(selectedFiles: FileList | null) => {
			if (!selectedFiles) return;

			if (files.length + selectedFiles.length > MAX_FILES) {
				toast.error(`Solo puedes subir hasta ${MAX_FILES} archivos.`, {
					description: `Actualmente tienes ${files.length} archivos cargados.`,
				});
				return;
			}

			const newFiles = Array.from(selectedFiles)
				.filter((file) => {
					const isCSV =
						file.name.toLowerCase().endsWith('.csv') ||
						file.type === 'text/csv';
					if (!isCSV) {
						toast.error('El archivo debe ser un CSV.', {
							description: `${file.name} no es un archivo CSV.`,
						});
					}
					return isCSV;
				})
				.map((file) => ({
					file,
					id: `${file.name}-${Date.now()}-${Math.random()
						.toString(36)
						.substr(2, 9)}`,
					progress: 0,
					status: 'waiting' as FileStatus,
				}));

			setFiles((prev) => [...prev, ...newFiles]);
		},
		[files.length],
	);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e.target.files);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const removeFile = (id: string) => {
		setFiles((prev) => prev.filter((file) => file.id !== id));
	};

	//   const uploadMutation = useMutation({
	//     mutationFn: ({ file }: { file: File[] }) => uploadFile(file),
	//   });

	const uploadFiles = async () => {
		const filesToUpload = files.filter((f) => f.status === 'waiting');

		if (filesToUpload.length === 0) {
			toast('No hay archivos pendientes para subir.', {
				description: 'Selecciona archivos CSV para subir.',
			});
			return;
		}

		filesToUpload.forEach((fileData) => {
			setFiles((prev) =>
				prev.map((f) =>
					f.id === fileData.id ? { ...f, status: 'uploading', progress: 0 } : f,
				),
			);
		});

		const formData = new FormData();
		filesToUpload.forEach((fileData) => {
			formData.append('files', fileData.file);
		});

		try {
			const res = await fetch(`${getBackendUrl()}/api/py/merge-csvs`, {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				throw new Error(`Error al subir los archivos: ${res.statusText}`);
			}

			const data = await res.json();
			console.log('Respuesta del servidor:', data);

			setFiles((prev) =>
				prev.map((f) =>
					filesToUpload.some((ftu) => ftu.id === f.id)
						? { ...f, status: 'uploaded', progress: 100 }
						: f,
				),
			);

			toast.success('Archivos subidos y fusionados exitosamente.');

			// Navigate to the analysis page with the response data
			navigate('/analysis', { state: { analysisData: data } });

		} catch (error) {
			setFiles((prev) =>
				prev.map((f) =>
					filesToUpload.some((ftu) => ftu.id === f.id)
						? {
								...f,
								status: 'failed',
								error:
									error instanceof Error ? error.message : 'Error desconocido',
							}
						: f,
				),
			);
		}
	};
	const statusCounts = files.reduce(
		(acc, file) => {
			acc[file.status] = (acc[file.status] || 0) + 1;
			return acc;
		},
		{} as Record<FileStatus, number>,
	);

	return (
		<div className="space-y-6">
			<div
				className={cn(
					'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors',
					isDragging
						? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
						: 'border-gray-300 dark:border-gray-700',
				)}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
					<Upload className="h-8 w-8" />
				</div>
				<h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-200">
					Arrastra y suelta archivos CSV aquí
				</h3>
				<p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
					o haz clic en el botón para seleccionar archivos
				</p>
				<Button
					onClick={handleButtonClick}
					className="bg-blue-500 hover:bg-blue-600"
				>
					Seleccionar archivos
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept=".csv,text/csv"
					onChange={handleInputChange}
					className="hidden"
				/>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					Máximo {MAX_FILES} archivos CSV
				</p>
			</div>

			{files.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-medium text-gray-800 dark:text-white">
							Archivos ({files.length}/{MAX_FILES})
						</h3>
						<div className="flex gap-2 text-sm">
							{statusCounts.waiting > 0 && (
								<span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
									Pendientes: {statusCounts.waiting}
								</span>
							)}
							{statusCounts.uploading > 0 && (
								<span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
									Subiendo: {statusCounts.uploading}
								</span>
							)}
							{statusCounts.uploaded > 0 && (
								<span className="rounded-full bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-300">
									Completados: {statusCounts.uploaded}
								</span>
							)}
							{statusCounts.failed > 0 && (
								<span className="rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-900/30 dark:text-red-300">
									Fallidos: {statusCounts.failed}
								</span>
							)}
						</div>
					</div>

					<div className="max-h-80 overflow-y-auto rounded-lg border dark:border-gray-700">
						<ul className="divide-y dark:divide-gray-700">
							{files.map((fileData) => (
								<li
									key={fileData.id}
									className="flex items-center justify-between p-4"
								>
									<div className="flex flex-1 items-center overflow-hidden pr-4">
										<div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
											<FileSpreadsheet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
												{fileData.file.name}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{(fileData.file.size / 1024).toFixed(2)} KB
											</p>
											{fileData.status === 'failed' && fileData.error && (
												<p className="mt-1 text-xs text-red-500">
													Error: {fileData.error}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2">
										{fileData.status === 'waiting' && (
											<span className="flex h-6 items-center rounded-full bg-gray-100 px-2 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
												Pendiente
											</span>
										)}
										{fileData.status === 'uploading' && (
											<span className="flex h-6 items-center rounded-full bg-blue-100 px-2 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
												<Loader2 className="mr-1 h-3 w-3 animate-spin" />
												Subiendo
											</span>
										)}
										{fileData.status === 'uploaded' && (
											<span className="flex h-6 items-center rounded-full bg-green-100 px-2 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-200">
												<CheckCircle2 className="mr-1 h-3 w-3" />
												Completado
											</span>
										)}
										{fileData.status === 'failed' && (
											<span className="flex h-6 items-center rounded-full bg-red-100 px-2 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-200">
												<AlertCircle className="mr-1 h-3 w-3" />
												Fallido
											</span>
										)}

										<button
											onClick={() => removeFile(fileData.id)}
											className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div className="flex justify-end gap-4">
						{/* only visibile if i havent uploaded */}
							<Button
								onClick={uploadFiles}
								className="bg-blue-500 hover:bg-blue-600"
								disabled={!files.some((f) => f.status === 'waiting')}
							>
								Subir archivos
							</Button>

						{(statusCounts.uploaded > 0 || statusCounts.failed > 0) && (
							<Button
								onClick={resetFiles}
								variant="outline"
								className="border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
							>
								Reiniciar
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
