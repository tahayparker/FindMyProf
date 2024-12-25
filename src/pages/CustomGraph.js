import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeIntervals = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
  '20:30', '21:00', '21:30', '22:00'
];

const CustomGraph = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [areDaysVisible, setAreDaysVisible] = useState(true);
  const [areProfessorsVisible, setAreProfessorsVisible] = useState(true);
  const [areTimeSlotsVisible, setAreTimeSlotsVisible] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    fetch('/professorSchedule.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        setScheduleData(data);
        const professors = [...new Set(data[0].professors.map(prof => prof.professor).sort((a, b) => a.localeCompare(b)))];
        setAvailableProfessors(professors);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching schedule:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const handleProfessorToggle = (professor) => {
    setSelectedProfessors(prev => prev.includes(professor) ? prev.filter(p => p !== professor) : [...prev, professor]);
  };

  const handleTimeSlotToggle = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      const updatedSlots = prev.includes(timeSlot) ? prev.filter(t => t !== timeSlot) : [...prev, timeSlot];
      return updatedSlots.sort((a, b) => timeIntervals.indexOf(a) - timeIntervals.indexOf(b));
    });
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const getCellColor = (avail) => {
    return avail === 1 ? 'bg-green-700' : 'bg-red-700';
  };

  const filteredProfessors = availableProfessors.filter(professor => 
    professor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <Header />
        <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20 mt-12">
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
        <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20">
          <div className="text-red-500 text-center">Error loading schedule: {error}</div>
        </main>
        <Footer className="mt-auto" />
      </div>
    );
  }

  // Sort selected days, professors, and time slots
  const sortedDays = [...selectedDays].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
  const sortedProfessors = [...selectedProfessors].sort();
  const sortedTimeSlots = [...selectedTimeSlots].sort((a, b) => timeIntervals.indexOf(a) - timeIntervals.indexOf(b));

  const selectedTimeIndices = sortedTimeSlots.map(time => timeIntervals.indexOf(time));

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white animate-[slideUp_0.5s_ease-out]">
            Custom Professor Availability Graph
          </h1>

          {/* Days Selection */}
          <div className="p-6 rounded-lg border-2 border-[#D69F7E] mb-4 flex flex-col">
            <div className="flex justify-between items-center h-12">
              <h2 className="text-xl font-semibold text-white">Select Days</h2>
              <button 
                onClick={() => setAreDaysVisible(prev => !prev)} 
                className="text-white bg-[#1E555C] px-3 py-1 rounded-full text-xs ml-2"
              >
                {areDaysVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className={`transition-all duration-300 ${areDaysVisible ? 'max-h-[200px] overflow-y-auto hide-scrollbar' : 'max-h-[40px] overflow-hidden'}`}>
              {areDaysVisible && (
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDayToggle(day)}
                      className={`px-4 py-1 rounded-full text-sm transition-all duration-300 ${
                        sortedDays.includes(day)
                          ? 'bg-[#1E555C] text-white'
                          : 'bg-[#121212] text-gray-300 hover:bg-[#1E555C]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professors Selection */}
          <div className="p-6 rounded-lg border-2 border-[#D69F7E] mb-4 flex flex-col">
            <div className="flex justify-between items-center h-12">
              <h2 className="text-xl font-semibold text-white">Select Professors</h2>
              <button 
                onClick={() => setAreProfessorsVisible(prev => !prev)} 
                className="text-white bg-[#1E555C] px-3 py-1 rounded-full text-xs ml-2"
              >
                {areProfessorsVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className={`transition-all duration-300 ${areProfessorsVisible ? 'max-h-[200px] overflow-y-auto hide-scrollbar' : 'max-h-[40px] overflow-hidden'}`}>
              {areProfessorsVisible && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search professors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border-2 border-[#D69F7E] focus:border-[#1E555C] focus:outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto hide-scrollbar">
                    <div className="flex flex-wrap gap-2">
                      {filteredProfessors.map((professor, index) => (
                        <button
                          key={index}
                          onClick={() => handleProfessorToggle(professor)}
                          className={`px-4 py-1 rounded-full text-sm transition-all duration-300 ${
                            sortedProfessors.includes(professor)
                              ? 'bg-[#1E555C] text-white'
                              : 'bg-[#121212] text-gray-300 hover:bg-[#1E555C]'
                          }`}
                        >
                          {professor}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Slots Selection */}
          <div className="p-6 rounded-lg border-2 border-[#D69F7E] mb-4 flex flex-col">
            <div className="flex justify-between items-center h-12">
              <h2 className="text-xl font-semibold text-white">Select Time Slots</h2>
              <button 
                onClick={() => setAreTimeSlotsVisible(prev => !prev)} 
                className="text-white bg-[#1E555C] px-3 py-1 rounded-full text-xs ml-2"
              >
                {areTimeSlotsVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className={`transition-all duration-300 ${areTimeSlotsVisible ? 'max-h-[200px] overflow-y-auto hide-scrollbar' : 'max-h-[40px] overflow-hidden'}`}>
              {areTimeSlotsVisible && (
                <div className="max-h-48 overflow-y-auto hide-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {timeIntervals.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSlotToggle(time)}
                        className={`px-4 py-1 rounded-full text-sm transition-all duration-300 ${
                          sortedTimeSlots.includes(time)
                            ? 'bg-[#1E555C] text-white'
                            : 'bg-[#121212] text-gray-300 hover:bg-[#1E555C]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graph Display */}
          {sortedDays.length > 0 && sortedProfessors.length > 0 && sortedTimeSlots.length > 0 && (
            <div className="relative animate-[slideUp_0.5s_ease-out] mb-4" ref={tableRef}>
              <div className="w-full overflow-auto max-h-[70vh] pb-16 hide-scrollbar">
                <table className="border-collapse w-full [&_td]:border-black [&_th]:border-black">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 bg-black text-white z-20 min-w-[220px] px-4 py-2 border-2 text-right first-th">Professor</th>
                      {sortedTimeSlots.map((time, index) => (
                        <th 
                          key={time} 
                          className={`sticky top-0 bg-black text-white z-10 px-4 py-2 border-2 ${
                            index === sortedTimeSlots.length - 1 ? 'last-th' : ''
                          }`}
                        >
                          {time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDays.map((day) => {
                      const dayData = scheduleData.find(d => d.day === day);
                      return sortedProfessors.map((professorName) => {
                        const profData = dayData.professors.find(p => p.professor === professorName);
                        return (
                          <tr key={`${day}-${professorName}`}>
                            <td className="sticky left-0 bg-black text-white z-10 px-4 py-2 border-2 text-right">
                              {professorName}
                              <div className="text-xs text-gray-400 text-right">{day}</div>
                            </td>
                            {selectedTimeIndices.map((timeIndex, index) => (
                              <td 
                                key={index} 
                                className={`px-4 py-2 border-2 min-w-[80px] ${getCellColor(profData.availability[timeIndex])}`}
                              ></td>
                            ))}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer className="mt-auto" />
      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .first-th::before,
        .last-th::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 10px;
          background-color: black;
          z-index: 30;
        }
      `}</style>
    </div>
  );
};

export default CustomGraph;
