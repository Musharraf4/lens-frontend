"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, TrackingRecord } from "@/types";

const initialState: AppState = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
  },
  posts: {
    items: [],
    loading: false,
    error: null,
  },
  ui: {
    theme: "light",
    language: "en",
    notifications: [],
  },
};

interface AppContextType {
  state: AppState;
  updateUser: (user: AppState["user"]["currentUser"]) => void;
  addPost: (post: AppState["posts"]["items"][0]) => void;
  setTheme: (theme: AppState["ui"]["theme"]) => void;
  addNotification: (notification: {
    type: "success" | "error" | "info" | "warning";
    message: string;
  }) => void;

  editNumberModalOpen: boolean;
  setEditNumberModalOpen: (open: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [editNumberModalOpen, setEditNumberModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateUser = (user: AppState["user"]["currentUser"]) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        currentUser: user,
        isAuthenticated: !!user,
      },
    }));
  };

  const addPost = (post: AppState["posts"]["items"][0]) => {
    setState((prev) => ({
      ...prev,
      posts: {
        ...prev.posts,
        items: [...prev.posts.items, post],
      },
    }));
  };

  const setTheme = (theme: AppState["ui"]["theme"]) => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        theme,
      },
    }));
  };

  const addNotification = (notification: {
    type: "success" | "error" | "info" | "warning";
    message: string;
  }) => {
    const newNotification = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...notification,
    };

    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        notifications: [...prev.ui.notifications, newNotification],
      },
    }));
  };

  const value = {
    state,
    updateUser,
    addPost,
    setTheme,
    addNotification,
    editNumberModalOpen,
    setEditNumberModalOpen,
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
