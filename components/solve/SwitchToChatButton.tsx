'use client';

/**
 * "Switch to chat" — the way out of voice mode, top right of every voice overlay
 * (2026-10-03). It replaced a bare X: the old BETA note carried the only labelled
 * "Switch to chat", and once that note went the exit had to stay just as obvious.
 * Leaving voice keeps everything: the conversation so far is saved and the chat
 * picks up where the voice call stopped.
 */

import { MessageSquare } from 'lucide-react';

export default function SwitchToChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Switch to chat"
      title="Leave voice and carry on in the chat. Everything said so far is saved."
      className="ml-auto sm:ml-0 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
    >
      <MessageSquare className="h-4 w-4" />
      <span className="sm:hidden">Chat</span>
      <span className="hidden sm:inline">Switch to chat</span>
    </button>
  );
}
