"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  HorizontaLDots,
  FileIcon,
  TaskIcon,
  ListIcon,
  TableIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavItem[];
};

type SidebarNavItemProps = {
  nav: NavItem;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  isActive: (path: string) => boolean;
};

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  nav,
  isExpanded,
  isHovered,
  isMobileOpen,
  isActive,
}) => {
  const shouldShowLabels = isExpanded || isHovered || isMobileOpen;

  if (!nav.subItems && nav.path) {
    return (
      <li>
        <Link
          href={nav.path}
          className={`menu-item group ${
            isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
          }`}
        >
          <span
            className={`${
              isActive(nav.path)
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}
          >
            {nav.icon}
          </span>
          {shouldShowLabels && <span className="menu-item-text">{nav.name}</span>}
        </Link>
      </li>
    );
  }

  if (!nav.subItems) {
    return <li />;
  }

  return <li />;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    icon: <FileIcon />,
    name: "Pensums",
    path: "/admin/pensum",
  },
  {
    icon: <ListIcon />,
    name: "Careers",
    path: "/admin/careers",
  },
  {
    icon: <TableIcon />,
    name: "Courses",
    path: "/admin/cursos",
  },
  {
    icon: <TableIcon />,
    name: "Study Areas",
    path: "/admin/study-area",
  },
  {
    icon: <TaskIcon />,
    name: "Historial alumnos",
    path: "/admin/historial-alumnos",
  },
  {
    icon: <TaskIcon />,
    name: "Estudiantes",
    path: "/admin/estudiantes",
  },
  {
    icon: <TaskIcon />,
    name: "Agregar notas",
    path: "/admin/notas",
  },
  {
    icon: <ListIcon />,
    name: "Estudiante-Pensum",
    path: "/admin/student-pensum",
  },
];

const AppSidebarAdmin: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const sidebarWidthClass = isExpanded || isMobileOpen || isHovered ? "w-72.5" : "w-22.5";

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${sidebarWidthClass}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administrador"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav, index) => (
                  <SidebarNavItem
                    key={nav.name}
                    nav={nav}
                    isExpanded={isExpanded}
                    isHovered={isHovered}
                    isMobileOpen={isMobileOpen}
                    isActive={isActive}
                  />
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebarAdmin;
