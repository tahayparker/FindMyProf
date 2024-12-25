import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo.png';

const Home = () => {
  useEffect(() => {
    const buttons = document.querySelectorAll('.glow-button');

    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        button.style.setProperty('--x', `${x}px`);
        button.style.setProperty('--y', `${y}px`);
      });

      button.addEventListener('mouseleave', () => {
        button.style.setProperty('--x', `50%`);
        button.style.setProperty('--y', `50%`);
      });
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousemove', () => {});
        button.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header hideLogoOnHome={true} />
      <Analytics />
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto text-center">
          <div className="transform transition-all duration-700 hover:scale-105"
               style={{ animation: 'fadeSlideIn 0.8s ease-out' }}>
            <Image 
              src={logo} 
              alt="Logo" 
              width={300} 
              height={300} 
              className="mx-auto mb-8 drop-shadow-2xl" 
              priority
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-white transform transition-all duration-500"
              style={{ animation: 'fadeSlideIn 0.5s ease-out 0.3s both' }}>
            Welcome to <span className="brandname bg-clip-text text-transparent bg-gradient-to-r from-[#1E555C] to-[#65C1CD]">FindMyProf</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12"
             style={{ animation: 'fadeSlideIn 0.5s ease-out 0.5s both' }}>
            Your ultimate guide to finding available professors in uni
          </p>
          
          <div className="space-y-4 px-4 sm:px-0">
            {[
              { href: "/CurrentlyAvailable", text: "Currently Available Professors" },
              { href: "/CheckAvailability", text: "Check Availability of Professor" },
              { href: "/Graph", text: "Graph All Professors" }
            ].map((link, index) => (
              <Link key={link.href} href={link.href} legacyBehavior>
                <a className="glow-button block px-6 py-4 border-2 border-[#D69F7E] text-white rounded-full text-2xl font-semibold 
                             transition-all duration-300 w-full max-w-[30rem] mx-auto backdrop-blur-sm 
                             hover:bg-[#1E555C]/20 hover:border-[#1E555C] hover:scale-105 hover:shadow-lg
                             active:scale-95"
                   style={{
                     animation: `slideInFromRight 0.5s ease-out ${0.7 + index * 0.2}s both`,
                     background: 'rgba(0, 0, 0, 0.3)'
                   }}>
                  {link.text}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;