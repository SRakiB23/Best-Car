"use client";

import { useEffect, useRef } from "react";
import {
  IconBell,
  IconCashRegister,
  IconClipboardList,
  IconLifebuoy,
  IconLock,
  IconMail,
  IconMenu2,
  IconReceipt2,
  IconSearch,
  IconSettings,
  IconTag,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

import { Tooltip } from "@/components/ui/tooltip";
import type { CurrentUser, Message, Notification, Store } from "@/lib/types";
import { AddNewModal } from "./topbar/add-new-modal";
import { FullscreenToggle } from "./topbar/fullscreen-toggle";
import { InboxMenu } from "./topbar/inbox-menu";
import { LanguageMenu } from "./topbar/language-menu";
import { LinkMenu, MenuFooterLink } from "./topbar/link-menu";
import { StoreSelect } from "./topbar/store-select";
import { useShell } from "./shell-context";

const iconButton =
  "relative grid size-9 place-items-center rounded-lg bg-surface text-ink-500 transition hover:bg-line hover:text-navy-900";

const posLinks = [
  { label: "Open POS register", href: "/pos", icon: <IconCashRegister size={16} stroke={1.6} /> },
  { label: "POS orders", href: "/sales/pos-orders", icon: <IconReceipt2 size={16} stroke={1.6} /> },
  {
    label: "Register shifts",
    href: "/pos/shifts",
    icon: <IconClipboardList size={16} stroke={1.6} />,
  },
];

const settingsLinks = [
  { label: "General settings", href: "/settings", icon: <IconSettings size={16} stroke={1.6} /> },
  { label: "Website settings", href: "/settings/website", icon: <IconWorld size={16} stroke={1.6} /> },
  { label: "Tax rates", href: "/settings/tax-rates", icon: <IconTag size={16} stroke={1.6} /> },
];

export type TopbarData = {
  stores: Store[];
  notifications: Notification[];
  messages: Message[];
  user: CurrentUser;
};

export function Topbar({ stores, notifications, messages, user }: TopbarData) {
  const { setMobileOpen } = useShell();

  const profileLinks = [
    { label: "My profile", href: "/profile", icon: <IconUser size={16} stroke={1.6} /> },
    { label: "Account settings", href: "/settings", icon: <IconSettings size={16} stroke={1.6} /> },
    { label: "Change password", href: "/profile/password", icon: <IconLock size={16} stroke={1.6} /> },
    { label: "Help centre", href: "/support", icon: <IconLifebuoy size={16} stroke={1.6} /> },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
      <Tooltip label="Open menu">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-canvas lg:hidden"
        >
          <IconMenu2 size={20} stroke={1.8} />
        </button>
      </Tooltip>

      <SearchBox />

      <div className="ml-auto flex items-center gap-1.5">
        <span className="hidden xl:inline-flex">
          <StoreSelect stores={stores} />
        </span>

        <AddNewModal />

        <LinkMenu
          label="Point of sale"
          triggerClassName="hidden h-9 gap-1.5 bg-navy-900 px-3 text-[13px] font-semibold text-white hover:bg-navy-800 sm:inline-flex"
          trigger={
            <>
              <IconCashRegister size={16} stroke={1.8} />
              POS
            </>
          }
          links={posLinks}
        />

        <div className="mx-1 hidden h-6 w-px bg-line lg:block" />

        <div className="hidden items-center gap-1.5 lg:flex">
          <LanguageMenu triggerClassName={iconButton} />

          <FullscreenToggle className={iconButton} />

          <InboxMenu
            label="Messages"
            title="Messages"
            emptyText="No messages yet."
            triggerClassName={iconButton}
            icon={<IconMail size={18} stroke={1.8} />}
            entries={messages.map((message) => ({
              id: message.id,
              heading: message.sender,
              body: message.preview,
              receivedAgo: message.receivedAgo,
              unread: message.unread,
            }))}
          />

          <InboxMenu
            label="Notifications"
            title="Notifications"
            emptyText="Nothing to report."
            triggerClassName={iconButton}
            icon={<IconBell size={18} stroke={1.8} />}
            entries={notifications.map((notification) => ({
              id: notification.id,
              heading: notification.title,
              body: notification.detail,
              receivedAgo: notification.receivedAgo,
              unread: notification.unread,
            }))}
          />

          <LinkMenu
            label="Settings"
            triggerClassName={iconButton}
            trigger={<IconSettings size={18} stroke={1.8} />}
            links={settingsLinks}
          />
        </div>

        <LinkMenu
          label={`Account: ${user.name}`}
          triggerClassName="ml-1 size-9 rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700 ring-2 ring-brand-200 hover:bg-brand-200"
          panelClassName="min-w-[240px]"
          trigger={user.initials}
          header={
            <div className="border-b border-line px-4 py-3">
              <p className="text-[13px] font-semibold text-navy-900">{user.name}</p>
              <p className="text-xs text-ink-500">{user.role}</p>
              <p className="mt-0.5 truncate text-xs text-ink-400">{user.email}</p>
            </div>
          }
          links={profileLinks}
          footer={<MenuFooterLink href="/logout">Sign out</MenuFooterLink>}
        />
      </div>
    </header>
  );
}

function SearchBox() {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        input.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form action="/search" className="relative hidden max-w-[280px] flex-1 items-center sm:flex">
      <IconSearch
        size={16}
        stroke={1.8}
        className="pointer-events-none absolute left-3 text-ink-400"
      />
      <input
        ref={input}
        type="search"
        name="q"
        placeholder="Search"
        className="h-9 w-full rounded-lg border border-line pl-9 pr-14 text-[13px] text-navy-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300"
      />
      <kbd className="absolute right-2 rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
        ⌘K
      </kbd>
    </form>
  );
}
