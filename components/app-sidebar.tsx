"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileImage,
  MessageCircle,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Promoters & Lounges",
          url: "/dashboard/lounges",
          icon: Building2,
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Workforce",
          url: "/dashboard/bartenders",
          icon: Briefcase,
        },
        {
          title: "Bookings",
          url: "/dashboard/bookings",
          icon: CalendarCheck,
        },
        {
          title: "Events",
          url: "/dashboard/events",
          icon: CalendarDays,
        },
        {
          title: "Payments",
          url: "/dashboard/payments",
          icon: CreditCard,
        },
      ],
    },
    {
      label: "Platform",
      items: [
        {
          title: "Flyers",
          url: "/dashboard/flyers",
          icon: FileImage,
        },
        // {
        //   title: "Chat Monitoring",
        //   url: "/dashboard/chat",
        //   icon: MessageCircle,
        // },
        // {
        //   title: "Notifications",
        //   url: "/dashboard/notifications",
        //   icon: Bell,
        // },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const admin = useSelector((state: RootState) => state.auth.admin);

  const userData = admin
    ? {
        name: admin.name || admin.fullName || "Admin",
        email: admin.email,
        avatar: "",
      }
    : {
        name: "Admin",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex items-center justify-center py-6 px-4">
        <Link href="/dashboard" className="outline-none block w-fit">
          <Logo size={100} className="mx-auto block" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
