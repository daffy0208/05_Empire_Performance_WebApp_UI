import React from 'react';
import Icon from '../../../../shared/components/AppIcon';

const WelcomeHeader = ({ parentName, quickStats }) => {
  const currentTime = new Date();
  const greeting = currentTime?.getHours() < 12 ? 'Good morning' :
                  currentTime?.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="bg-gradient-to-r from-[#0E0E10] to-[#141416] border-b border-[#2A2A2E] mb-8">
      <div className="w-full px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">
              {greeting}, {parentName || 'Parent'}!
            </h1>
            <p className="text-[#CFCFCF] text-lg">
              Your training dashboard overview
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-[#C9A43B]/10 rounded-lg px-4 py-3 border border-[#C9A43B]/20">
              <Icon name="Calendar" size={20} className="text-[#C9A43B] mr-3" />
              <div>
                <div className="text-xl font-bold text-[#F5F5F5]">{quickStats?.upcomingSessions || 0}</div>
                <div className="text-sm text-[#CFCFCF]">Upcoming Sessions</div>
              </div>
            </div>

            <div className="flex items-center bg-green-500/10 rounded-lg px-4 py-3 border border-green-500/20">
              <Icon name="Repeat" size={20} className="text-green-500 mr-3" />
              <div>
                <div className="text-xl font-bold text-[#F5F5F5]">{quickStats?.activeBookings || 0}</div>
                <div className="text-sm text-[#CFCFCF]">Active Bookings</div>
              </div>
            </div>

            <div className="flex items-center bg-blue-500/10 rounded-lg px-4 py-3 border border-blue-500/20">
              <Icon name="Clock" size={20} className="text-blue-500 mr-3" />
              <div>
                <div className="text-xl font-bold text-[#F5F5F5]">{Math.round(quickStats?.totalHours || 0)}</div>
                <div className="text-sm text-[#CFCFCF]">Total Hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;