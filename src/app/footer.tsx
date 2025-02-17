import React from 'react';
import Link from 'next/link';
import { IconBrandGithub, IconHeart, IconBrandDeno, IconCoffee } from '@tabler/icons-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              QR Analytics
            </Link>
          
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 my-4 md:my-0">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="https://github.com/jwaguirr/dubtrack" className="text-gray-600 hover:text-gray-900 transition-colors">
              Github
            </Link>
            <a 
              href="https://github.com/jwaguirr/dubtrack/issues"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issues
            </a>
          </div>

          {/* Support & Copyright */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              Jesus
              <IconHeart className="w-4 ml-2 h-4 text-red-500" />
              <a 
                href="https://www.biblegateway.com/passage/?search=1%20Corinthians%201:8&version=NIV"
                className="text-gray-600 hover:text-gray-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                YOU |
                1 Corinth 1:8
              </a>
            </div>
          </div>
        </div>

        <div>
          <h6 className='text-sm dark:text-black'>Although this is free, it does cost me money to run :(</h6>
          <Link href="/support" className='text-md rounded-lg hover:underline dark:text-black'>Support the cause!</Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;