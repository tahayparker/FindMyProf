import { useState, useEffect } from 'react';
import ProfessorsList from '../components/ProfessorsList';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CurrentlyAvailable = () => {
  const [loading, setLoading] = useState(true);
  const [professors, setProfessors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current day and time
        const now = new Date();
        const day = now.toLocaleString('en-US', { weekday: 'long' });
        const time = now.toLocaleTimeString('en-US', { hour12: false });

        const response = await fetch(`/api/professors?day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const filteredProfessors = data.filter(room => !room.includes('Consultation') && !room.includes('Online'));
        setProfessors(filteredProfessors);
      } catch (err) {
        console.error('Error fetching professors:', err);
        setError(`Failed to load available professors: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-0 pb-16 pt-24">
        <div className="w-full flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin mt-12 rounded-full h-12 w-12 border-b-2 border-[#1E555C]"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 mt-12 text-center p-4 bg-red-50 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <ProfessorsList professors={professors} />
          )}
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default CurrentlyAvailable;