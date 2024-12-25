import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full h-16 backdrop-blur-md bg-black/30 border-t border-[#D69F7E]">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-6">
          <Link href="/about" legacyBehavior>
            <a className="text-sm text-gray-300 hover:underline hover:text-[#1E555C] transition-all duration-200 ease-in-out">
              About
            </a>
          </Link>
          <Link href="/terms" legacyBehavior>
            <a className="text-sm text-gray-300 hover:underline hover:text-[#1E555C] transition-all duration-200 ease-in-out">
              Terms
            </a>
          </Link>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-600">
            Made with <span className="text-[#1E555C]">🖤</span> by TP
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;