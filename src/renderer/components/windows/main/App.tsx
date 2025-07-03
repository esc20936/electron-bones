// todo: menubar ellipsis on overflow
import { MainLayout } from '@/renderer/components/layout/MainLayout';
import { Home } from '@/renderer/components/views/Home';
import {
    Route,
    RouterProvider,
    createHashRouter,
    createRoutesFromElements,
} from 'react-router-dom';

import Analysis from '../../views/analysis/analysis';
import ErrorPage from '@/renderer/components/views/ErrorPage';
import '@/renderer/styles/globals.scss';

export default function App() {
	const routes = (
		<Route path="/" element={<MainLayout />} errorElement={<ErrorPage />}>
			<Route index element={<Home />} />
			<Route path="/" element={<Home />} />

			<Route path="/analysis" element={<Analysis />} />
		</Route>
	);

	const router = createHashRouter(createRoutesFromElements(routes));

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}
