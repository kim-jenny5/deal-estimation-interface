import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageShell from '@/components/PageShell';
import { getCurrentUser, getOrderByIdOrFirst } from '@/util/queries';

export default async function Dashboard() {
	const user = await getCurrentUser();
	const order = await getOrderByIdOrFirst(user);

	return (
		<>
			<Navbar user={user.name} />
			<PageShell order={{ ...order }} />
			<Footer />
		</>
	);
}
