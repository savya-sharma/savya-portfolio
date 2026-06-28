import { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Play from './pages/Play';
import Menu from './components/Menu';
import Projects from './components/Projects';
import Loader from './components/Loader';

function RootLayout() {
  return (
    <div className="overflow-x-hidden md:overflow-x-visible">
      <Menu />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <About /> },
      { path: 'play', element: <Play /> },
      { path: 'work', element: <Projects /> },
    ],
  },
]);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loader Timeout (simulate loading)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600); // adjust time if needed

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.03,
    });

    // Listen for the scroll event and log the event data
    lenis.on('scroll', (e) => {
      // console.log(e);
    });

    // Cleanup
    return () => {
      clearTimeout(timer);
      lenis.destroy();
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  return <RouterProvider router={router} />;
}

export default App;
