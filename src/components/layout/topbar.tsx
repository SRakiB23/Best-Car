"use client";

import Link from "next/link";
import {
  IconBell,
  IconCashRegister,
  IconClipboardList,
  IconLock,
  IconMail,
  IconMenu2,
  IconReceipt2,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n-context";
import type { Account, Message, Notification, Store } from "@/lib/types";
import { AddNewModal } from "./topbar/add-new-modal";
import { FullscreenToggle } from "./topbar/fullscreen-toggle";
import { InboxMenu } from "./topbar/inbox-menu";
import { LanguageMenu } from "./topbar/language-menu";
import { LinkMenu } from "./topbar/link-menu";
import { SignOutButton } from "./topbar/sign-out";
import { SearchBox } from "./topbar/search-box";
import { StoreSelect } from "./topbar/store-select";
import { useShell } from "./shell-context";

const iconButton =
  "relative grid size-9 place-items-center rounded-lg bg-surface text-ink-500 transition hover:bg-line hover:text-navy-900";

const posLinks = [
  { label: "Open POS register", href: "/admin/pos", icon: <IconCashRegister size={16} stroke={1.6} /> },
  { label: "POS orders", href: "/admin/sales/pos-orders", icon: <IconReceipt2 size={16} stroke={1.6} /> },
  {
    label: "Register shifts",
    href: "/admin/pos/shifts",
    icon: <IconClipboardList size={16} stroke={1.6} />,
  },
];

export type TopbarData = {
  stores: Store[];
  notifications: Notification[];
  messages: Message[];
  user: Account;
};

export function Topbar({ stores, notifications, messages, user }: TopbarData) {
  const { setMobileOpen } = useShell();
  const { t } = useI18n();
  const translateLinks = (links: { label: string; href: string; icon: React.ReactNode }[]) =>
    links.map((link) => ({ ...link, label: t(link.label) }));

  const profileLinks = [
    { label: "My profile", href: "/admin/profile", icon: <IconUser size={16} stroke={1.6} /> },
    { label: "Account settings", href: "/admin/settings", icon: <IconSettings size={16} stroke={1.6} /> },
    {
      label: "Change password",
      href: "/admin/profile/password",
      icon: <IconLock size={16} stroke={1.6} />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
      <Tooltip label={t("Open menu")}>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t("Open menu")}
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
          label={t("Point of sale")}
          triggerClassName="hidden h-9 gap-1.5 bg-navy-900 px-3 text-[13px] font-semibold text-white hover:bg-navy-800 sm:inline-flex"
          trigger={
            <>
              <IconCashRegister size={16} stroke={1.8} />
              POS
            </>
          }
          links={translateLinks(posLinks)}
        />

        <div className="mx-1 hidden h-6 w-px bg-line lg:block" />

        <div className="hidden items-center gap-1.5 lg:flex">
          <LanguageMenu triggerClassName={iconButton} />

          <FullscreenToggle className={iconButton} />

          <InboxMenu
            label={t("Messages")}
            title={t("Messages")}
            emptyText={t("No messages yet.")}
            inbox="messages"
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
            label={t("Notifications")}
            title={t("Notifications")}
            emptyText={t("Nothing to report.")}
            inbox="notifications"
            triggerClassName={iconButton}
            icon={<IconBell size={18} stroke={1.8} />}
            entries={notifications.map((notification) => ({
              id: notification.id,
              heading: notification.title,
              body: notification.detail,
              receivedAgo: notification.receivedAgo,
              unread: notification.unread,
              href: notification.link,
            }))}
          />

          <Tooltip label={t("Settings")}>
            <Link href="/admin/settings" aria-label={t("Settings")} className={iconButton}>
              <IconSettings size={18} stroke={1.8} />
            </Link>
          </Tooltip>
        </div>

        <LinkMenu
          label={`Account: ${user.name}`}
          triggerClassName="ml-1 rounded-full ring-2 ring-brand-200"
          panelClassName="min-w-[240px]"
          trigger={
            <Avatar name={user.name} src={user.avatarUrl || undefined} className="text-[13px]" />
          }
          header={
            <div className="border-b border-line px-4 py-3">
              <p className="text-[13px] font-semibold text-navy-900">{user.name}</p>
              <p className="text-xs text-ink-500">{user.role}</p>
              <p className="mt-0.5 truncate text-xs text-ink-400">{user.email}</p>
            </div>
          }
          links={translateLinks(profileLinks)}
          footer={<SignOutButton />}
        />
      </div>
    </header>
  );
}
