"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import MobileHamburger from "./MobileHamburger";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  SearchIcon,
  PlusSquare,
  ShoppingBag,
  Shield,
  PlusCircle,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  ScrollText,
  Cog,
  Wallet,
  MessageSquare,
  Bookmark,
  Search,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const isAdvertiser = user?.role === "advertiser";
  const isExplorer = user?.role === "explorer";

  const isActive = (path) => pathname === path;

  // Define nav items based on role
  const regularNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/register-item", label: "Register Item", icon: PlusCircle },
    { href: "/order-summary", label: "Orders", icon: ShoppingBag },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
    // Add other admin-specific links if needed
  ];

  const advertiserNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/register-item", label: "Register Item", icon: PlusCircle },
    { href: "/my-listings", label: "My Listings", icon: ScrollText },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  const explorerNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/search", label: "Browse", icon: Search },
    { href: "/saved-items", label: "Saved Items", icon: Bookmark },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  const currentNavItems = isAdmin
    ? adminNavItems
    : isAdvertiser
    ? advertiserNavItems
    : isExplorer
    ? explorerNavItems
    : regularNavItems;

  // Default items for logged-out users
  let baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: MessageSquare },
    { href: "/faq", label: "FAQ", icon: MessageSquare },
  ];

  // Items specific to logged-out state
  const loggedOutSpecificItems = [
    { href: "/login", label: "Login", icon: LogIn },
    { href: "/signup", label: "Sign Up", icon: UserPlus },
  ];

  // Items specific to logged-in users (will be combined based on role)
  let loggedInNavItems = [];

  if (isAdmin) {
    loggedInNavItems = [
      {
        href: "/admin",
        label: "Admin Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/update?tab=approvals",
        label: "Approve Listings",
        icon: ShieldCheck,
      },
      { href: "/admin/update?tab=users", label: "Manage Users", icon: User },
    ];
  } else if (isAdvertiser) {
    loggedInNavItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/register-item", label: "Register Item", icon: PlusCircle },
      { href: "/my-listings", label: "My Listings", icon: ScrollText },
      { href: "/wallet", label: "Wallet", icon: Wallet },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ];
  } else if (isExplorer) {
    loggedInNavItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/search", label: "Browse", icon: Search },
      // { href: "/saved-items", label: "Saved Items", icon: Bookmark },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ];
  } else if (user) {
    loggedInNavItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
    ];
  }

  // Determine final nav items for display
  const navItems = user ? loggedInNavItems : baseNavItems;

  // Client-side sign out handler
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-950/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800/80">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
              EduStation
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
                >
                  <IconComponent className="mr-1 h-4 w-4" /> {item.label}
                </Link>
              );
            })}

            {/* {!user &&
              loggedOutSpecificItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
                  >
                    <IconComponent className="mr-1 h-4 w-4" /> {item.label}
                  </Link>
                );
              })} */}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || "/placeholder-avatar.png"}
                        alt={user.name || user.username}
                      />
                      <AvatarFallback>
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loggedInNavItems[0] &&
                    (() => {
                      const Icon = loggedInNavItems[0].icon;
                      return (
                        <DropdownMenuItem asChild>
                          <Link href={loggedInNavItems[0].href}>
                            <Icon className="mr-2 h-4 w-4" />
                            {loggedInNavItems[0].label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })()}
                  <DropdownMenuItem asChild>
                    <Link href="/profile-settings">
                      <Cog className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer w-full text-left flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                {loggedOutSpecificItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button key={item.href} variant="outline" asChild>
                      <Link href={item.href} className="flex items-center">
                        <IconComponent className="mr-1 h-4 w-4" /> {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="md:hidden">
              <MobileHamburger
                navItems={
                  user
                    ? loggedInNavItems
                    : [...baseNavItems, ...loggedOutSpecificItems]
                }
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
