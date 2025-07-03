import { Logo } from '@/components/ui/logo';
import FileUploader from '@/components/ui/file-uploader';

export function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8 flex items-center justify-center">
					<div className="flex items-center gap-3">
						<Logo className="h-10 w-10" />
						<h1 className="text-3xl font-bold text-gray-800 dark:text-white">
							Data Handler
						</h1>
					</div>
				</header>
				<main>
					<div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
						<h2 className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-white">
							Carga tus archivos CSV
						</h2>
						<FileUploader />
					</div>
				</main>
			</div>
		</div>
	);
}
