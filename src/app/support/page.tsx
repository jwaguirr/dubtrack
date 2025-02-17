'use client'
import React, { useState } from 'react';
import { IconHeart, IconShare, IconCurrencyDollar, IconBrandLinkedin, IconBrandGithub, IconHeartFilled } from '@tabler/icons-react';
import { useMutation, Mutation } from '@tanstack/react-query';

const SupportPage = () => {
    
    const sendKudos = async () => {
        await fetch("/api/send-kudos", {method: 'POST'})
    }
    
    const sendKudosMutation = useMutation({
        mutationFn: sendKudos,
        onMutate: () => setIsSending(true),
      });
    
      const [isSending, setIsSending] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Profile Section */}
          <div className="md:w-1/3 p-6 bg-gradient-to-b from-indigo-500 to-blue-600 text-white">
            <div className="aspect-square overflow-hidden rounded-full mb-6 bg-white/10 flex items-center justify-center">
              <img
                src="/me.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">@jwaguirr</h2>
              <p className="text-sm text-blue-100">Developer & Creator</p>
            </div>
            <div className='flex flex-row space-x-6 mt-6'>
                <a target='_blank' href="www.linkedin.com/in/justin-aguirre13">
                    <IconBrandLinkedin />
                </a>
                <a target='_blank' href='https://github.com/jwaguirr'>
                    <IconBrandGithub />
                </a>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl text-center font-bold text-gray-800">Support the Project</h1>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Thank you for using this service! While it's completely free to use,
                maintaining and hosting it does involve costs. I really do hope you have enjoyed the service, as my main goal was to provide a free, helpful service.
                If you do want to donate any amount to help me faciliate the costs, it would be greatly appreciated!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a target="_blank" href='https://www.paypal.com/donate/?business=8BU7A8TGJ6FM4&no_recurring=0&item_name=Thank+you+for+supporting!+May+God+bless+you!&currency_code=USD'>
                <div className="p-4 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IconCurrencyDollar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                            <h3 className="font-semibold">PayPal</h3>
                            <p className="text-sm text-gray-500">One-time or recurring support</p>
                    </div>
                  </div>
                </div>
                        </a>

                        <a target='_blank' href='https://venmo.com/u/jwaguirr'>
                <div className="p-4 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IconShare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                            <h3 className="font-semibold">Venmo</h3>
                            <p className="text-sm text-gray-500">@jwaguirr</p>
                    </div>
                  </div>
                </div>
                        </a>
              </div>
            </div>

            <div className="flex justify-between items-center border-t mt-6 pt-6">
              <button  onClick={() => sendKudosMutation.mutate()} disabled={isSending} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      {isSending ? (
        <IconHeartFilled className="text-red-500 animate-pulse" />
      ) : (
        <IconHeart className="text-gray-500 hover:text-red-500" />
      )}
    
                    Send Kudos!
              </button>
                <div className='flex flex-row gap-1'>
                    Jesus <IconHeart /> You!
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage