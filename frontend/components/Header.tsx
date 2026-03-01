'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageProvider';
import { MENU_ITEMS } from '@/constants/menu';
import Image from 'next/image';

export function Header() {
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedDropdown, setMobileExpandedDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const getActiveMenuItem = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/admin/login') return 'register';
    return null;
  };

  const activeMenuItem = getActiveMenuItem();
  const menuItems = MENU_ITEMS;

  const closeDrawer = () => {
    setMobileMenuOpen(false);
    setMobileExpandedDropdown(null);
  };



  const handleNavClick = (itemId: string) => {
    if (itemId === 'home') {
      if (pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = '/';
      }
      setOpenDropdown(null);
      closeDrawer();
      return;
    }
    if (itemId === 'register') {
      window.location.href = '/admin/login';
      setOpenDropdown(null);
      closeDrawer();
      return;
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={headerRef} className={`fixed top-0 left-0 right-0 z-50 m-0 p-0 transition-colors duration-300 ${openDropdown || isScrolled ? 'bg-white dark:bg-gray-900' : ''}`} style={{ top: 0, marginTop: 0, paddingTop: 0, position: 'fixed' }}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-36 md:px-40 lg:px-44 xl:px-48 py-4 md:py-5 lg:py-6">
        <div className="flex md:hidden items-center justify-between w-full gap-3">
          <button 
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/';
              }
            }}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image src="/logo.png" alt="Logo" width={96} height={96} className="w-full h-full object-contain" priority />
          </button>
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex-shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Menu">
            <span className="material-icons text-2xl text-gray-800 dark:text-gray-200">menu</span>
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/';
              }
            }}
          className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
            priority
          />
        </button>
        <nav className="flex items-center flex-1">
          <div className={`header-nav-container px-4 md:px-6 lg:px-8 py-1 md:py-1.5 flex gap-2 md:gap-3 lg:gap-4 relative w-full ${openDropdown ? 'header-nav-open' : ''}`}>
            {menuItems.map((item) => {
              const isActive = activeMenuItem === item.id;
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (item.hasDropdown) {
                        setOpenDropdown(openDropdown === item.id ? null : item.id);
                      } else if (item.id === 'home' || item.id === 'register') {
                        handleNavClick(item.id);
                      }
                    }}
                    className={`header-nav-item flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-base font-medium transition-all ${openDropdown === item.id ? 'header-nav-item-active' : ''} ${isActive ? 'header-nav-item-active' : ''}`}
                  >
                    <span>{item.label[language]}</span>
                    {item.hasDropdown && (
                      <span className="material-icons text-base md:text-lg">
                        {openDropdown === item.id ? 'expand_less' : 'expand_more'}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
        </div>
      </div>
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" aria-hidden onClick={closeDrawer} />
          <div className="fixed top-0 right-0 z-50 w-full h-full bg-white dark:bg-gray-800 md:hidden flex flex-col header-drawer-right">
            <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
              <button 
                onClick={() => {
                  if (pathname === '/') {
                    closeDrawer();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image src="/logo.png" alt="Logo" width={80} height={80} className="w-20 h-20 object-contain" />
              </button>
              <button type="button" onClick={closeDrawer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                <span className="material-icons text-xl">close</span>
              </button>
            </div>
            <nav className="flex-1 p-4 pt-0 flex flex-col gap-1 overflow-auto">
              {menuItems.map((item) => {
                const isActive = activeMenuItem === item.id;
                return (
                  <div key={item.id}>
                    <button
                      className={`flex items-center justify-between w-full px-4 py-3 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      onClick={() => {
                        if (item.hasDropdown) {
                          setMobileExpandedDropdown(mobileExpandedDropdown === item.id ? null : item.id);
                        } else if (item.id === 'home' || item.id === 'register') {
                          handleNavClick(item.id);
                        } else {
                          closeDrawer();
                        }
                      }}
                    >
                      <span className={`font-medium ${isActive ? 'text-red-600 dark:text-red-400' : ''}`}>{item.label[language]}</span>
                      {item.hasDropdown && (
                        <span className="material-icons text-lg text-gray-500">
                          {mobileExpandedDropdown === item.id ? 'expand_less' : 'expand_more'}
                        </span>
                      )}
                    </button>
                    {item.hasDropdown && mobileExpandedDropdown === item.id && item.dropdownContent && (
                      <div className="pl-4 pr-4 pb-2 flex flex-col gap-1">
                        {item.dropdownContent.leftColumn.map((sub) => (
                          <button
                            key={sub.id}
                            className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => closeDrawer()}
                          >
                            <span className="font-medium">{sub.label[language]}</span>
                            <span className="material-icons text-lg text-gray-500">chevron_right</span>
                          </button>
                        ))}
                        {item.dropdownContent.rightColumn.map((sub) => {
                          const isActiveType = false;
                          return (
                            <button
                              key={sub.id}
                              className={`flex items-center gap-3 w-full px-4 py-3 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isActiveType ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold' : ''}`}
                              onClick={() => {
                                if (item.id === 'products') {
                                  router.push(`/products?type=${sub.id}`);
                                  closeDrawer();
                                } else {
                                  closeDrawer();
                                }
                              }}
                            >
                              <span className="font-medium">{sub.label[language]}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </>
      )}
      {openDropdown && menuItems.find(item => item.id === openDropdown)?.dropdownContent && (
        <div className="hidden md:block absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl z-40 header-dropdown">
          <div className="max-w-[1920px] mx-auto px-36 md:px-40 lg:px-44 xl:px-48">
            <div className="flex border-t border-gray-200 dark:border-gray-700">
              {menuItems.find(item => item.id === openDropdown)?.dropdownContent?.leftColumn.length ? (
                <div className="flex-[1] border-r border-gray-200 dark:border-gray-700 py-4">
                  {menuItems.find(item => item.id === openDropdown)?.dropdownContent?.leftColumn.map((leftItem) => (
                    <button
                      key={leftItem.id}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-gray-700 dark:text-gray-200"
                    >
                      <span>{leftItem.label[language]}</span>
                      <span className="material-icons text-base">chevron_right</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className={`p-4 ${menuItems.find(item => item.id === openDropdown)?.dropdownContent?.leftColumn.length ? 'flex-[2]' : 'flex-1'}`}>
                {menuItems.find(item => item.id === openDropdown)?.dropdownContent?.rightColumn.map((rightItem) => {
                  const isActiveType = false;
                  return (
                    <button
                      key={rightItem.id}
                      onClick={() => {
                        if (openDropdown === 'products') {
                          router.push(`/products?type=${rightItem.id}`);
                          setOpenDropdown(null);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg flex items-center gap-3 text-gray-700 dark:text-gray-200 ${isActiveType ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium' : ''}`}
                    >
                      <span className="text-sm font-medium">{rightItem.label[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
