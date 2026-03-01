'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { TEAM_MEMBERS, TEAM_TITLE } from '@/constants/team';
import { TeamMember } from '@/types';
import Image from 'next/image';
import { TeamPopup } from './TeamPopup';

export function Team() {
  const { language } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <section id="team" className="relative w-full flex flex-col bg-[#F8F6F7] dark:bg-gray-900">
        <div className="relative z-10 flex-1 flex flex-col pt-14 md:pt-20 pb-8 md:pb-16">
          <div className="text-center px-4 md:px-8 mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200">
              {TEAM_TITLE[language]}
            </h1>
          </div>

          <div className="flex-1 px-4 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {TEAM_MEMBERS.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className="flex flex-col items-center text-center space-y-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-lg overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name[language]}
                        fill
                        className="object-cover"
                        quality={90}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-black dark:text-gray-200">
                        {member.name[language]}
                      </h3>
                      <p className="text-sm md:text-base text-black dark:text-gray-300">
                        {member.position[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <TeamPopup
        member={selectedMember}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />
    </>
  );
}
