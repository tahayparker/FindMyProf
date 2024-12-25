import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function About() {
  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white">About FindMyProf</h1>
        <p className="text-lg mb-4 text-gray-300">
          FindMyProf is a comprehensive platform designed to help students find available professors on campus. The goal is to make it easier for everyone to connect with professors for consultations, academic discussions, or other meetings.
        </p>
        <p className="text-lg mb-4 text-gray-300">
          The platform offers several features to enhance your experience:
        </p>
        <ul className="list-disc list-inside text-lg mb-4 text-gray-300">
          <li>Check the current availability of professors in real-time.</li>
          <li>View detailed schedules and contact information for each professor.</li>
          <li>Visualize professor availability using interactive graphs.</li>
        </ul>
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-4 text-white">Instructions</h2>
          <ul className="list-disc list-inside text-lg mb-4 text-gray-300">
            <li>Navigate to the &quot;Currently Available&quot; page to view a list of professors who are free right now.</li>
            <li>Use the &quot;Check Availability&quot; page to search for professors based on specific time slots.</li>
            <li>Visit the &quot;Graph&quot; page to see a visual representation of professor availability throughout the week.</li>
            <li>Use the &quot;Custom Graph&quot; page to create personalized availability views for specific professors and time slots.</li>
            <li>Check the &quot;Professor Details&quot; page to find contact information and email addresses for all professors.</li>
          </ul>
          <p className="text-lg mb-4 text-gray-300">
            If you encounter any issues or have any questions, please contact me.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default About;