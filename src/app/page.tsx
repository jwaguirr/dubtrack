'use client'
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  IconBrandGithub,
  IconQrcode,
  IconChartBar,
  IconRocket,
  IconBrandLinkedin,
  IconX,
  IconGlobe,
  IconHeart
} from "@tabler/icons-react";
import Footer from "./footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Top Banner */}
      <header className="w-full bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 flex items-center justify-center">
        <p className="text-sm font-medium">
          Explore the new dashboard from the creators of Dubtrack!
        </p>
        <Link
          href="/dashboard"
          className="ml-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-white px-3 py-1 rounded hover:opacity-80 transition"
        >
          Try now
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 space-y-5"
            >
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                <span className="block py-4 text-7xl text-blue-600 dark:text-blue-400">
                  Dubtrack
                </span>
                Open Source, Free Forever
              </h1>
              <p className="text-lg py-4 md:text-xl text-gray-700 dark:text-gray-200">
              QR analytics tracker that provides insights, including scan counts, unique users, geolocation, and device data, with dynamic visualizations for better tracking and engagement.
              </p>
              <div className="flex gap-4 mt-4">
                <Link
                  href="/dashboard"
                  className="md:px-6 md:py-3 p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 hover:dark:bg-blue-600 transition-colors font-medium"
                >
                  Get Started
                </Link>
                <a
                  href="https://github.com/jwaguirr/dubtrack"
                  target="_blank"
                  className="md:px-6 md:py-3 p-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 hover:dark:bg-gray-700 transition-colors font-medium flex items-center "
                >
                  <IconBrandGithub className="w-5 h-5" />
                  View on GitHub
                </a>
                <a
                  href="/support"
                  target="_blank"
                  className="md:px-6 md:py-3 p-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 hover:dark:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                  <IconHeart className="w-5 h-5" />
                  Support
                </a>
              </div>
            </motion.div>

            {/* Right Graphic/Logo */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:w-1/2 flex justify-center"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-800 blur-2xl opacity-50"></div>
                <IconX
                  className="text-white opacity-60 z-10"
                  size={140}
                  strokeWidth={1.2}
                />
              </div>
            </motion.div> */}
            <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-800 blur-2xl opacity-50"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-xl">
                <Image src="/dubtrack.png" alt="QR Analytics" width={1000} height={1000} />
              </div>
            </div>
          </motion.div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <IconQrcode className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unlimited QR Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and track unlimited QR codes without any restrictions. Perfect for businesses of any size, from startups to enterprises.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <IconChartBar className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track scans, locations, devices, and more in real-time. Get detailed insights with our comprehensive analytics dashboard.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <IconGlobe className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Open Source & Free</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Completely open source and free to use. Deploy on your own infrastructure for full control over your data and analytics.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Meet The Team */}
        <section className="container mx-auto px-4 py-10 lg:py-16">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Meet The Team
          </h2>
          <div className="flex flex-row justify-center items-center w-full">
            {/* Card example #1 */}
            <div className="bg-white md:w-1/5 h-64 flex flex-col justify-between dark:bg-gray-800 rounded-lg shadow text-center p-4">
              <div className="flex flex-col items-center">
                <Image
                  src="/me.jpg"
                  alt="jwaguirr"
                  width={100}
                  height={100}
                  className="rounded-full object-cover aspect-square"
                />
                <h3 className="text-lg font-semibold mt-2">@jwaguirr</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center space-x-4 text-gray-500 dark:text-gray-400">
                  <Link href="https://github.com/jwaguirr" className="text-gray-600 hover:text-gray-900 transition-colors">
                    <IconBrandGithub className="w-5 h-5 cursor-pointer hover:text-gray-700" />
                  </Link>
                  <Link target="_blank" href="https://www.linkedin.com/in/justin-aguirre13" className="text-gray-600 hover:text-gray-900 transition-colors">
                    <IconBrandLinkedin className="w-5 h-5 cursor-pointer hover:text-gray-700" />
                  </Link>
                </div>
              </div>
            </div>

          
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer /> 
    </div>
  );
}
