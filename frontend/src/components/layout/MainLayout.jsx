import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Navbar from '../Navbar';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="py-3">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

