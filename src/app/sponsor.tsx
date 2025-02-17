import React from 'react';
import { motion } from "framer-motion";
import { IconBrandNextjs, IconBrandTailwind, IconDatabase, IconServer } from "@tabler/icons-react";

const TechStackSection = () => {
  const technologies = [
    {
      icon: <IconBrandNextjs className="w-12 h-12" />,
      name: "Next.js 14",
      description: "App Router, Server Components, and API Routes for a blazing-fast experience"
    },
    {
      icon: <IconBrandTailwind className="w-12 h-12" />,
      name: "Tailwind CSS",
      description: "Utility-first CSS framework for rapid UI development"
    },
    {
      icon: <IconDatabase className="w-12 h-12" />,
      name: "PostgreSQL",
      description: "Reliable, open-source database for storing QR and analytics data"
    },
    {
      icon: <IconServer className="w-12 h-12" />,
      name: "Self-hosted",
      description: "Deploy anywhere with Docker and docker-compose"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Built With Modern Tech</h2>
          <p className="text-xl text-gray-600">
            Leveraging the latest open-source technologies for performance and reliability
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-indigo-600 mb-4">{tech.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{tech.name}</h3>
              <p className="text-gray-600">{tech.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/yourusername/yourrepo/blob/main/docker-compose.yml"
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2"
          >
            View Deployment Guide
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;