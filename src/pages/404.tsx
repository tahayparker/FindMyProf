import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function Custom404() {
  useEffect(() => {
    const buttons = document.querySelectorAll('.glow-button');

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const button = mouseEvent.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    const handleMouseLeave = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      button.style.setProperty('--x', '50%');
      button.style.setProperty('--y', '50%');
    };

    buttons.forEach(button => {
      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header hideLogoOnHome={false} />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-4xl text-white font-bold mb-4 text-center animate-[slideUp_0.5s_ease-out]">
            Oops! Professor Not Found 🏃‍♂️💨
          </h1>
          <p className="text-lg mb-4 text-center animate-[fadeIn_0.5s_ease-out] text-white">
            Looks like this professor is not available!🎩✨
          </p>
          <p className="text-md mb-8 text-center animate-[fadeIn_0.5s_ease-out_0.2s] text-gray-300">
            Maybe they&apos;re on a coffee break, or perhaps they&apos;re playing hide and seek? 🤔☕
          </p>
          <div className="w-full max-w-6xl mx-auto px-4">
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="glow-button block px-6 py-4 border-2 border-[#D69F7E] text-white rounded-full text-2xl font-semibold 
                          transition-all duration-300 backdrop-blur-sm 
                          hover:bg-[#1E555C]/20 hover:border-[#1E555C] hover:scale-105 hover:shadow-lg
                          active:scale-95"
                style={{
                  animation: 'slideInFromRight 0.5s ease-out 0.7s both',
                  background: 'rgba(0, 0, 0, 0.3)'
                }}
              >
                Let&apos;s Find a Professor That&apos;s Available! 🚀
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 