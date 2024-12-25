import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;            /* Chrome, Safari and Opera */
  }
`;

const ProfessorDetails = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState('');

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 2000); // Reset after 2 seconds
  };

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/professorDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch professors');
        }
        const data = await response.json();
        
        // Ensure data is an array and has the expected structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        // Sort professors by name, with null check
        const sortedProfessors = [...data].sort((a, b) => {
          if (!a?.Name || !b?.Name) return 0;
          return a.Name.localeCompare(b.Name);
        });

        setProfessors(sortedProfessors);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = scrollbarHideStyles;
    document.head.appendChild(styleSheet);

    // Cleanup function
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const filteredProfessors = professors.filter(professor =>
    professor.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    professor.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <Header />
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-16 pt-24">
          <div className="flex items-center justify-center">
            <div className="animate-spin mt-12 rounded-full h-12 w-12 border-b-2 border-[#1E555C]"></div>
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <Header />
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-16 pt-24">
          <div className="text-red-600 text-center">
            Error loading professors: {error}
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 pb-16 pt-24 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white animate-[slideUp_0.5s_ease-out]">Professor Details</h1>
        
        {/* Search Input */}
        <div className="w-full max-w-4xl mb-6">
          <input
            type="text"
            placeholder="Search professors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#D69F7E] w-full max-w-4xl scrollbar-hide">
          <table className="min-w-full shadow-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-[#D69F7E] border-r border-r-[#D69F7E]">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-[#D69F7E]">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D69F7E]">
              {filteredProfessors.map((professor, index) => (
                <tr 
                  key={index} 
                  className="hover:shadow-[0_0_10px_rgba(0,109,91,0.3)] transition-all duration-150"
                  style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-[#D69F7E]">
                    {professor.Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex justify-between items-center">
                      {professor.Email ? (
                        <>
                          <a 
                            href={`mailto:${professor.Email}`}
                            className="text-gray-300 hover:text-[#1E555C] transition-colors duration-200"
                          >
                            {professor.Email}
                          </a>
                          <button
                            onClick={() => handleCopyEmail(professor.Email)}
                            className="ml-2 p-1.5 rounded-md hover:bg-[#1E555C] transition-colors duration-200 group"
                            title="Copy email"
                          >
                            {copiedEmail === professor.Email ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1E555C]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

// Add the keyframes for the animations
const styles = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ProfessorDetails; 