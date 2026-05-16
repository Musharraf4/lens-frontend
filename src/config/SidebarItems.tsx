import React from "react";
import {
  MdHome,
  MdOutlineInsights,
  MdPeople,
  MdBusinessCenter,
  MdHeadsetMic,
  MdIntegrationInstructions,
  MdChat,
  MdHelp,
  MdAdsClick,
  MdSearch,
  MdLocationOn,
  MdStore,
} from "react-icons/md";
import type { SidebarItem } from "@/types";
import { LuCircleHelp, LuLayoutDashboard } from "react-icons/lu";
import { BiChart } from "react-icons/bi";
import { PiPhonePlusThin, PiPresentationChart } from "react-icons/pi";
import { TbMessageChatbot, TbPuzzle2, TbUserSquareRounded } from "react-icons/tb";
import { RiChatAiLine } from "react-icons/ri";

export const mainNavItems: SidebarItem[] = [
  {
    title: "Home",
    icon: <LuLayoutDashboard />,
    path: "/home",
  },
  {
    title: "Activity",
    icon: <BiChart />,
    path: "/activity",
  },
  {
    title: "Acquisition",
    icon: <PiPresentationChart />,
    path: "/acquisition",
    children: [
      {
        title: "Google Ads",
        path: "/acquisition/google-ads",
      },
      {
        title: "Organic",
        path: "/acquisition/organic",
      },
      {
        title: "Local Service Ads",
        path: "/acquisition/local-service-ads",
      },
      {
        title: "Google My Business",
        path: "/acquisition/google-my-business",
      },
      {
        title: "Landing Pages",
        path: "/acquisition/landing-pages",
      },
    ],
  },
  {
    title: "Contacts",
    icon: <TbUserSquareRounded />,
    path: "/contacts",
  },
  {
    title: "Tracking",
    icon: <PiPhonePlusThin />,
    path: "/tracking",
    children: [
      {
        title: "Phone Numbers",
        path: "/tracking",
      },
      {
        title: "Saved Drafts",
        path: "/tracking/saved-drafts",
      },
    ],
  },
  {
    title: "Lead Concierge",
    icon: <TbMessageChatbot />,
    path: "/lead-concierge",
  },
];

export const utilityNavItems: SidebarItem[] = [
  {
    title: "Integrations",
    icon: <TbPuzzle2 />,
    path: "/integrations",
  },
  // {
  //   title: "Chatbot",
  //   icon: <RiChatAiLine />,
  //   path: "/chatbot",
  // },
  {
    title: "Help",
    icon: <LuCircleHelp />,
    path: "/help",
  },
];
