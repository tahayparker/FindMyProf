import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white">Terms and Conditions</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">1. Data Source</h2>
          <p className="text-lg mb-4 text-gray-300">
            FindMyProf is a tool that utilizes data from the MyUOWD timetable website (<a href="https://my.uowdubai.ac.ae/timetable/viewer" className="text-[#1E555C] hover:text-[#65C1CD]" target="_blank" rel="noopener noreferrer">my.uowdubai.ac.ae/timetable/viewer</a>). The platform processes and displays this data to show professor availability, but it should not be considered as the sole source of information for professor availability.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">2. Availability Limitations</h2>
          <p className="text-lg mb-4 text-gray-300">
            Professors may be unavailable even when shown as &quot;free&quot; due to various commitments including but not limited to:
          </p>
          <ul className="list-disc list-inside text-lg mb-4 text-gray-300 ml-4">
            <li>Staff meetings and department gatherings</li>
            <li>Research activities and academic commitments</li>
            <li>Business trips and conferences</li>
            <li>Student consultations and appointments</li>
            <li>Administrative duties</li>
            <li>Personal commitments</li>
            <li>Sick leave or other types of leave</li>
          </ul>
          <p className="text-lg mb-4 text-gray-300">
            The only approved way to meet with a professor is to send an email beforehand and agree on a specific time during their provided consultation hours. Professors may not be in their office even during their free periods.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">3. No Liability</h2>
          <p className="text-lg mb-4 text-gray-300">
            FindMyProf shall not be held liable for any damages, inconvenience, or losses arising from the use of our platform or reliance on the information provided. This includes, but is not limited to, any direct, indirect, incidental, or consequential damages resulting from missed meetings or unavailable professors.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">4. &quot;As Is&quot; Basis</h2>
          <p className="text-lg mb-4 text-gray-300">
            The FindMyProf platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties, express or implied, regarding the accuracy, reliability, or availability of our platform or the information it provides.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">5. Data Accuracy</h2>
          <p className="text-lg mb-4 text-gray-300">
            While we strive to maintain accurate and up-to-date information by syncing with the official timetable, FindMyProf cannot guarantee the absolute accuracy of professor availability or contact information. Users must verify any information through official channels before making decisions or arrangements.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">6. Professional Etiquette</h2>
          <p className="text-lg mb-4 text-gray-300">
            Users are expected to maintain professional etiquette when contacting professors. This includes sending formal emails, respecting professors&apos; time, and understanding that they are not obligated to be available during their free periods.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">7. Changes to Terms</h2>
          <p className="text-lg mb-4 text-gray-300">
            We reserve the right to modify these terms and conditions at any time. Any changes will be effective immediately upon posting on our platform. Your continued use of the platform constitutes acceptance of the revised terms.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">8. Contact</h2>
          <p className="text-lg mb-4 text-gray-300">
            If you have any questions or concerns about these terms and conditions, please contact me.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">9. Thank You UOWD</h2>
          <p className="text-lg mb-4 text-gray-300">
            Thank you UOWD for finally getting rid of the PDF timetable and switching to the <a href="https://my.uowdubai.ac.ae/timetable/viewer" className="text-[#1E555C] hover:text-[#65C1CD]" target="_blank" rel="noopener noreferrer">website</a> instead (please keep it open for non-authenticated users, otherwise this project will die &lt;/3)
          </p>
        </section>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default Terms;