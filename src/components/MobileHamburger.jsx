"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";

export default function MobileHamburger({ navItems = [], isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isActive = (path) => pathname === path;

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-zinc-700"
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {status === "authenticated" &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-gray-50"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-gray-100"
                  }`}
                  role="menuitem"
                >
                  {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                  {item.label}
                </Link>
              ))}

            {status === "authenticated" && (
              <hr className="border-gray-200 dark:border-zinc-700 my-1" />
            )}

            {status === "authenticated" ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                role="menuitem"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive("/login")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  role="menuitem"
                >
                  {" "}
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive("/signup")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  role="menuitem"
                >
                  {" "}
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
