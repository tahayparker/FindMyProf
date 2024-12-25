import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const styles = {
  timeInput: {
    WebkitAppearance: 'none',
    MozAppearance: 'textfield'
  },
  selectInput: {
    paddingRight: "30px",
    marginRight: "1rem",
    backgroundPosition: "right 1rem center",
    backgroundRepeat: "no-repeat",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
    MozAppearance: "none",
    WebkitAppearance: "none"
  },
  glowButton: {
    position: "relative",
    overflow: "hidden"
  }
};

const CheckAvailability = () => {
  const [professor, setProfessor] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch professor names from the database
    const fetchProfessors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/professor');
        if (!response.ok) {
          throw new Error('Failed to fetch professors');
        }
        const data = await response.json();
        if (data.length > 0) {
          setProfessors(data);
        }
      } catch (err) {
        setError('Failed to load professors list. Please try again later.');
        console.error('Error fetching professors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    // Filter professors based on user input
    setFilteredProfessors(
      professors.filter((p) => p.toLowerCase().includes(professor.toLowerCase()))
    );
  }, [professor, professors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const buttons = document.querySelectorAll('.glow-button');

    const handleMouseMove = (e, button) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    const handleMouseLeave = (button) => {
      button.style.setProperty('--x', '50%');
      button.style.setProperty('--y', '50%');
    };

    buttons.forEach(button => {
      const mouseMoveHandler = (e) => handleMouseMove(e, button);
      const mouseLeaveHandler = () => handleMouseLeave(button);

      button.addEventListener('mousemove', mouseMoveHandler);
      button.addEventListener('mouseleave', mouseLeaveHandler);

      return () => {
        button.removeEventListener('mousemove', mouseMoveHandler);
        button.removeEventListener('mouseleave', mouseLeaveHandler);
      };
    });
  }, []);

  const handleCheck = async (e) => {
    e.preventDefault();
    // Clear previous results
    setAvailability(null);
    
    if (!professor || !day || !startTime || !endTime) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    try {
      const response = await fetch(`/api/check-availability?teacher=${encodeURIComponent(professor)}&day=${day}&startTime=${startTime}&endTime=${endTime}`);
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError('Failed to check availability. Please try again.');
      console.error('Error checking availability:', err);
    }
  };

  const handleReset = () => {
    setProfessor('');
    setDay('');
    setStartTime('');
    setEndTime('');
    setAvailability(null);
    setError('');
  };

  const handleNow = () => {
    const now = new Date();
    const dayOptions = { weekday: 'long' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    setDay(now.toLocaleDateString('en-US', dayOptions));
    setStartTime(now.toLocaleTimeString('en-US', timeOptions).slice(0, 5));
    setEndTime(now.toLocaleTimeString('en-US', timeOptions).slice(0, 5));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <Header />
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col items-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E555C]"></div>
            <p className="text-white text-lg mt-4">Loading professors...</p>
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
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-red-950/50 border-red-600 border-l-4 p-8 rounded-md max-w-lg mx-4">
            <div className="flex items-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM6.75 3.75H8.25V8.25H6.75V3.75ZM6.75 9.75H8.25V11.25H6.75V9.75ZM1.5 7.5C1.5 10.815 4.185 13.5 7.5 13.5C10.815 13.5 13.5 10.815 13.5 7.5C13.5 4.185 10.815 1.5 7.5 1.5C4.185 1.5 1.5 4.185 1.5 7.5Z"
                  fill="#EF4444"
                />
              </svg>
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900/75 text-red-200 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white">Check Professor Availability</h1>
        <div className="max-w-3xl w-full mx-auto mt-16 pb-16">
          <form onSubmit={handleCheck} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="relative form-element" ref={dropdownRef} style={{ animationDelay: '0.1s' }}>
              <label htmlFor="professor" className="block text-sm font-medium text-gray-300">Professor</label>
              <input
                type="text"
                id="professor"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                onFocus={() => setDropdownVisible(true)}
                placeholder="Enter professor name"
                className="w-full px-6 py-3 border border-[#D69F7E] rounded-md bg-[#121212] text-white transition-all duration-200 hover:border-[#1E555C] focus:border-[#1E555C] focus:outline-none focus:ring-1 focus:ring-[#1E555C]"
              />
              {dropdownVisible && filteredProfessors.length > 0 && (
                <ul className="absolute z-10 w-full bg-[#121212] border border-[#D69F7E] rounded-md mt-1 max-h-48 overflow-y-auto scrollbar-hide">
                  {filteredProfessors.map((p, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setProfessor(p);
                        setDropdownVisible(false);
                      }}
                      className="px-6 py-3 cursor-pointer text-white transition-all duration-200 hover:text-[#1E555C] border-l-2 border-transparent hover:border-[#1E555C]"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-element" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="day" className="block text-sm font-medium text-gray-300">Day</label>
              <select
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-6 py-3 border border-[#D69F7E] rounded-md bg-[#121212] text-white transition-all duration-200 hover:border-[#1E555C] focus:border-[#1E555C] focus:outline-none focus:ring-1 focus:ring-[#1E555C]"
                style={styles.selectInput}
              >
                <option value="">Select a day</option>
                <option value="Monday" className="hover:text-[#1E555C]">Monday</option>
                <option value="Tuesday" className="hover:text-[#1E555C]">Tuesday</option>
                <option value="Wednesday" className="hover:text-[#1E555C]">Wednesday</option>
                <option value="Thursday" className="hover:text-[#1E555C]">Thursday</option>
                <option value="Friday" className="hover:text-[#1E555C]">Friday</option>
                <option value="Saturday" className="hover:text-[#1E555C]">Saturday</option>
                <option value="Sunday" className="hover:text-[#1E555C]">Sunday</option>
              </select>
            </div>
            <div className="form-element" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-6 py-3 border border-[#D69F7E] rounded-md bg-[#121212] text-white transition-all duration-200 hover:border-[#1E555C] focus:border-[#1E555C] focus:outline-none focus:ring-1 focus:ring-[#1E555C]"
                style={styles.timeInput}
              />
            </div>
            <div className="form-element" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">End time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-6 py-3 border border-[#D69F7E] rounded-md bg-[#121212] text-white transition-all duration-200 hover:border-[#1E555C] focus:border-[#1E555C] focus:outline-none focus:ring-1 focus:ring-[#1E555C]"
                style={styles.timeInput}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 form-element" style={{ animationDelay: '0.5s' }}>
              <button
                type="submit"
                className="glow-button flex-1 px-6 py-3 border-2 border-green-700 text-green-700 rounded-full hover:text-green-700 transition-all duration-200"
                style={styles.glowButton}
              >
                Check Availability
              </button>
              <button
                type="button"
                onClick={handleNow}
                className="glow-button w-full md:w-auto px-6 py-3 border-2 border-[#D69F7E] text-white rounded-full hover:text-white transition-all duration-200"
                style={styles.glowButton}
              >
                Now
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="glow-button w-full md:w-auto px-6 py-3 border-2 border-red-700 text-red-700 rounded-full hover:text-red-700 transition-all duration-200"
                style={styles.glowButton}
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-8 p-4 rounded-md bg-yellow-950/50 border-yellow-600 border-l-4 animate-[slideIn_0.3s_ease-out]">
              <div className="flex items-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM6.75 3.75H8.25V8.25H6.75V3.75ZM6.75 9.75H8.25V11.25H6.75V9.75ZM1.5 7.5C1.5 10.815 4.185 13.5 7.5 13.5C10.815 13.5 13.5 10.815 13.5 7.5C13.5 4.185 10.815 1.5 7.5 1.5C4.185 1.5 1.5 4.185 1.5 7.5Z"
                    fill="#EAB308"
                  />
                </svg>
                <p className="text-yellow-200 ml-2">{error}</p>
              </div>
            </div>
          )}

          {availability !== null && (
            <div className={`mt-8 p-4 rounded-md animate-[slideIn_0.3s_ease-out] ${availability.available
                ? 'bg-[#1E555C]/50 border-[#1E555C]'
                : 'bg-red-950/50 border-red-600'
              } border-l-4`}>
              <div className="flex items-center">
                {availability.available ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM6 11.25L2.25 7.5L3.315 6.435L6 9.12L11.685 3.435L12.75 4.5L6 11.25Z"
                        fill="#22C55E"
                      />
                    </svg>
                    <p className="text-[#1E555C] ml-2">Professor is available</p>
                  </>
                ) : (
                  <div className="flex flex-col w-full">
                    <div className="flex items-center">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM11.25 10.185L10.185 11.25L7.5 8.565L4.815 11.25L3.75 10.185L6.435 7.5L3.75 4.815L4.815 3.75L7.5 6.435L10.185 3.75L11.25 4.815L8.565 7.5L11.25 10.185Z"
                          fill="#EF4444"
                        />
                      </svg>
                      <p className="text-red-200 font-medium ml-2">Professor is not available</p>
                    </div>
                    {availability.classes && availability.classes.length > 0 ? (
                      <ul className="mt-3 space-y-3">
                        {availability.classes.map((classInfo, index) => (
                          <li key={index} className="text-red-200/80 text-sm pl-3 border-l border-red-800">
                            <div className="font-medium">{classInfo.SubCode} | {classInfo.Room}</div>
                            <div className="text-red-200/60 text-xs mt-0.5">
                              {classInfo.StartTime} - {classInfo.EndTime}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-red-200/80 text-sm mt-2">No class details available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer className="mt-auto" />
      <style jsx>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          background: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: contain;
          width: 12px;
          height: 12px;
          opacity: 0.7;
          cursor: pointer;
          padding-right: 3px;
          margin-right: -0.7rem;
          display: block !important;
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="time"] {
          color-scheme: dark;
          -webkit-appearance: none;
          appearance: none;
        }
        /* For Firefox */
        input[type="time"]::-moz-calendar-picker-indicator {
          background: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/%3E%3C/svg%3E");
          width: 16px;
          height: 16px;
        }
        select {
          background-position: right 1rem center !important;
        }
        select option {
          background-color: #121212;
          color: white;
        }
        select option:hover {
          background-color: transparent;
          color: #1E555C;
        }
        @media (max-width: 768px) {
          input[type="time"]::-webkit-calendar-picker-indicator {
            display: block !important;
            opacity: 0.7;
            background: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-size: contain;
            width: 12px;
            height: 12px;
            opacity: 0.7;
            cursor: pointer;
            padding-right: 3px;
            margin-right: -0.7rem;
            display: block !important;
            -webkit-appearance: none;
            appearance: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckAvailability;