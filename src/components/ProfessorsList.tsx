import React from 'react';

interface ProfessorsListProps {
  professors?: string[];
}

const ProfessorsList: React.FC<ProfessorsListProps> = ({ professors = [] }) => {
  const [minWidth, setMinWidth] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState('');
  const [currentDay, setCurrentDay] = React.useState('');

  React.useEffect(() => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setCurrentDay(now.toLocaleDateString('en-GB', { weekday: 'long' }));

    if (professors.length > 0) {
      const longestRoomName = professors.reduce((max, room) => 
        (room.length > max.length ? room : max), ''
      );
      setMinWidth(longestRoomName.length * 10);
    }
  }, [professors]);

  if (professors.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No professors currently available.
      </div>
    );
  }

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
          {professors.map((room, index) => (
            <li
              key={index}
              className="bg-[#00000000] text-white text-center rounded-lg shadow-lg p-3 border border-[#D69F7E] hover-scale transition-all duration-300 list-animation flex items-center justify-center whitespace-nowrap overflow-hidden"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: 'translateY(0)',
                opacity: 1,
                minWidth: 0
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
