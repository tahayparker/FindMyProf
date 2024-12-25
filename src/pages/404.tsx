import React from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Custom404: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header hideLogoOnHome={false} />
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-white transform transition-all duration-500">
            404 - Page Not Found
          </h1>
          
          <p className="text-xl text-gray-300 mb-12">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <Link href="/" className="glow-button block px-6 py-4 border-2 border-[#904E55] text-white rounded-full text-2xl font-semibold 
                         transition-all duration-300 w-full max-w-[30rem] mx-auto backdrop-blur-sm 
                         hover:bg-[#1E555C]/20 hover:border-[#1E555C] hover:scale-105 hover:shadow-lg
                         active:scale-95">
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Custom404; 