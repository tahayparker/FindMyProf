import { useState, useEffect } from 'react';

const ProfessorsList = () => {
  const [rooms, setRooms] = useState([]);
  const [minWidth, setMinWidth] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  const fetchRooms = async () => {
    const now = new Date();
    const day = now.toLocaleString('en-US', { weekday: 'long' });
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    
    setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setCurrentDay(now.toLocaleDateString('en-GB', { weekday: 'long' }));

    const response = await fetch(`/api/professors?day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`);
    const data = await response.json();
    const filteredRooms = data.filter((room: string) => !room.includes('Consultation') && !room.includes('Online'));
    setRooms(filteredRooms);

    const longestRoomName = filteredRooms.reduce((max: string, room: string) => (room.length > max.length ? room : max), '');
    setMinWidth(longestRoomName.length * 10);
  };

  useEffect(() => {
    fetchRooms(); // Initial fetch

    // Update every minute
    const interval = setInterval(() => {
      fetchRooms();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <h1 className="text-4xl text-white font-bold mb-4 mt-12 text-center animate-[slideUp_0.5s_ease-out]">
        Currently Available Professors
      </h1>
      <p className="text-lg mb-4 text-center animate-[fadeIn_0.5s_ease-out] text-white">
        As of {currentDay}, {currentTime}
      </p>
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        <ul
          className="grid gap-4 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(auto-fit, minmax(min(${Math.max(minWidth, 300)}px, 100%), 1fr))`,
            maxWidth: '960px'
          }}
        >
          {rooms.map((room, index) => (
            <li
              key={index}
              className="bg-[#00000000] text-white text-center rounded-lg shadow-lg p-3 border border-[#D69F7E] hover-scale transition-all duration-300 list-animation flex items-center justify-center whitespace-nowrap overflow-hidden"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: 'translateY(0)',
                opacity: 1,
                minWidth: 0 // Prevent flex item from overflowing
              }}
            >
              {room}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfessorsList;