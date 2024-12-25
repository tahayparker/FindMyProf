import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CheckAvailability() {
  const [professor, setProfessor] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch professor names from the database
    const fetchProfessors = async () => {
      try {
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
    // Handle clicking outside of dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white animate-[slideUp_0.5s_ease-out]">
            Check Professor Availability
          </h1>

          <form onSubmit={handleCheck} className="space-y-6">
            {/* Professor Selection */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-white mb-2">Professor Name</label>
              <input
                type="text"
                value={professor}
                onChange={(e) => {
                  setProfessor(e.target.value);
                  setDropdownVisible(true);
                }}
                onFocus={() => setDropdownVisible(true)}
                placeholder="Start typing professor's name..."
                className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
              />
              {dropdownVisible && filteredProfessors.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border-2 border-[#D69F7E] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProfessors.map((prof, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-[#1E555C]/20 text-white"
                      onClick={() => {
                        setProfessor(prof);
                        setDropdownVisible(false);
                      }}
                    >
                      {prof}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day Selection */}
            <div>
              <label className="block text-white mb-2">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min="08:30"
                  max="22:00"
                  step="1800"
                  className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min="08:30"
                  max="22:00"
                  step="1800"
                  className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center animate-[slideUp_0.5s_ease-out]">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#1E555C] text-white hover:bg-[#1E555C]/80 transition-all duration-200"
              >
                Check Availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 rounded-full border-2 border-[#D69F7E] text-white hover:border-[#1E555C] transition-all duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleNow}
                className="px-6 py-2 rounded-full border-2 border-[#D69F7E] text-white hover:border-[#1E555C] transition-all duration-200"
              >
                Use Current Time
              </button>
            </div>
          </form>

          {/* Results */}
          {availability && (
            <div className="mt-8 p-6 rounded-lg border-2 border-[#D69F7E] animate-[slideUp_0.5s_ease-out]">
              <h2 className="text-2xl font-bold mb-4 text-white">Results</h2>
              {availability.available ? (
                <p className="text-green-500">
                  {professor} is available at the selected time!
                </p>
              ) : (
                <div>
                  <p className="text-red-500 mb-2">
                    {professor} is not available at the selected time.
                  </p>
                  <p className="text-white mb-2">Classes during this time:</p>
                  <ul className="list-disc list-inside space-y-2">
                    {availability.classes.map((cls, index) => (
                      <li key={index} className="text-gray-300">
                        {cls.SubCode} in Room {cls.Room} ({cls.StartTime} - {cls.EndTime})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CheckAvailability;