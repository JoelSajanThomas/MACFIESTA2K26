"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ContextPanel } from "./ContextPanel";
import { QuickActionDock } from "./QuickActionDock";
import { CommandPalette } from "./CommandPalette";
import { NotificationDrawer } from "./NotificationDrawer";
import { DataInsertionDrawer, InsertionType } from "./DataInsertionDrawer";
import { AdminMenuMatrix } from "./AdminMenuMatrix";

interface AdminShellProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  user: any;
  onLogout: () => void;
  socketConnected?: boolean;
  statusMsg?: string;
  auditLogs?: any[];
  onQuickAction?: (action: string) => void;
}

export function AdminShell({
  children,
  activePage,
  setActivePage,
  user,
  onLogout,
  socketConnected = false,
  statusMsg = "",
  auditLogs = [],
  onQuickAction,
}: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuMatrixOpen, setMenuMatrixOpen] = useState(false);
  const [flashMsg, setFlashMsg] = useState("");


  // Data Insertion Drawer
  const [insertionDrawerOpen, setInsertionDrawerOpen] = useState(false);
  const [insertionType, setInsertionType] = useState<InsertionType>("create-event");

  const openInsertionMenu = (type: InsertionType = "create-event") => {
    setInsertionType(type);
    setInsertionDrawerOpen(true);
  };

  // Persist sidebar collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("macfiesta_sidebar_collapsed");
      if (saved !== null) setSidebarCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      try {
        localStorage.setItem("macfiesta_sidebar_collapsed", JSON.stringify(!prev));
      } catch {}
      return !prev;
    });
  };

  // Persist active page
  useEffect(() => {
    try {
      const savedPage = localStorage.getItem("macfiesta_active_page");
      if (savedPage) setActivePage(savedPage);
    } catch {}
  }, [setActivePage]);

  useEffect(() => {
    try {
      localStorage.setItem("macfiesta_active_page", activePage);
    } catch {}
  }, [activePage]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelectPage = (pageId: string) => {
    setActivePage(pageId);
    setMobileSidebarOpen(false);
  };

  const handleQuickActionWrapper = (actKey: string) => {
    const validInsertionTypes: InsertionType[] = [
      "create-event",
      "register-participant",
      "add-volunteer",
      "publish-result",
      "send-announcement",
      "allocate-hostel",
      "issue-refund",
    ];
    if (validInsertionTypes.includes(actKey as InsertionType)) {
      openInsertionMenu(actKey as InsertionType);
    } else {
      onQuickAction?.(actKey);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100 font-sans antialiased overflow-hidden selection:bg-amber-400/20">
      {/* Toast / Status Bar */}
      {(statusMsg || flashMsg) && (
        <div className="bg-[#F5B301] text-[#09090b] text-[11px] font-bold px-4 py-1.5 text-center shadow-md shrink-0 z-50">
          {flashMsg || statusMsg}
        </div>
      )}

      {/* Top Bar */}
      <TopBar
        activePage={activePage}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenMenuMatrix={() => setMenuMatrixOpen(true)}
        onQuickAction={handleQuickActionWrapper}
        socketConnected={socketConnected}
        user={user}
        onLogout={onLogout}
      />

      {/* 3-Section Layout: Left Navigation + Center Workspace + Right Context Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0 h-[calc(100vh-48px)] relative">
        {/* Left: Navigation Rail / Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={handleSelectPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Center: Main Content Workspace */}
        <main
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto bg-[#09090b] min-w-0 min-h-0 h-full scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 relative touch-pan-y"
        >
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>


        {/* Right: Context Panel */}
        <ContextPanel
          activePage={activePage}
          onQuickAction={handleQuickActionWrapper}
          auditLogs={auditLogs}
        />

        {/* Floating Quick Action Dock */}
        <QuickActionDock onQuickAction={handleQuickActionWrapper} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activePage={activePage}
        onSelectPage={handleSelectPage}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={handleSelectPage}
        onQuickAction={handleQuickActionWrapper}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        auditLogs={auditLogs}
      />

      {/* Data Insertion Drawer */}
      <DataInsertionDrawer
        isOpen={insertionDrawerOpen}
        type={insertionType}
        onClose={() => setInsertionDrawerOpen(false)}
        onSubmitSuccess={(msg) => {
          setFlashMsg(msg);
          setTimeout(() => setFlashMsg(""), 3500);
        }}
      />

      {/* Admin Full-Screen Menu Matrix Overlay */}
      <AdminMenuMatrix
        isOpen={menuMatrixOpen}
        onClose={() => setMenuMatrixOpen(false)}
        activePage={activePage}
        onSelectPage={handleSelectPage}
      />
    </div>
  );
}

