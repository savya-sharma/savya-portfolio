import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Play from './pages/Play';
import Menu from './components/Menu';
import Projects from './components/Projects';

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
  useEffect(() => {
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
      lenis.destroy();
    };
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
