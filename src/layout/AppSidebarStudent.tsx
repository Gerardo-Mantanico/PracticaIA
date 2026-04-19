"use client";

import { useSidebar } from "@/context/SidebarContext";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FileIcon, ListIcon, TableIcon, TimeIcon, UserCircleIcon } from "@/icons";
import { usePathname } from "next/navigation";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  {
    name: "Inicio",
    icon: <TableIcon />,
    path: "/student",
  },
  {
    name: "Mi horario",
    icon: <TimeIcon />,
    path: "/student/horario",
  },
  {
    name: "Cursos",
    icon: <FileIcon />,
    path: "/student/cursos",
  },
  {
    name: "Mis pensums",
    icon: <ListIcon />,
    path: "/student/pensums",
  },
  // {
  //   name: "Perfil",
  //   icon: <UserCircleIcon />,
  //   path: "/student/profile",
  // },
];

const AppSidebarStudent: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const sidebarWidthClass = isExpanded || isMobileOpen || isHovered ? "w-72.5" : "w-22.5";

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${sidebarWidthClass} ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/student">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
              width={150}
              height={40}
            />
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Estudiante" : "S"}
              </h2>
              <ul className="flex flex-col gap-3">
                {navItems.map((nav) => {
                  const isActive = pathname === nav.path;

                  return (
                    <li key={nav.path}>
                      <Link
                        href={nav.path}
                        className={`menu-item group ${
                          isActive ? "menu-item-active" : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`${
                            isActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{nav.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebarStudent;
