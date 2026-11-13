"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Translation } from "@/lib/i18n";
import { runTerminalCommand } from "@/lib/terminal-commands";
import type { Data } from "@/types/prime";

type TerminalProps = { t: Translation; data: Data; language: "fr" | "en" };

export function Terminal({ t, data, language }: TerminalProps) {
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<string[]>(["> signal.init()", "↳ ΠΡΙΜΕ · Lomé / Togo", "↳ help / aide pour explorer"]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);
  const inlineLogRef = useRef<HTMLDivElement>(null);
  const panelLogRef = useRef<HTMLDivElement>(null);
  const wasExpandedRef = useRef(false);
  const id = useId().replace(/:/g, "");
  const panelId = `prime-terminal-${id}`;
  const isFrench = language === "fr";
  const openLabel = isFrench ? "Ouvrir le terminal" : "Open terminal";
  const closeLabel = isFrench ? "Réduire le terminal" : "Minimize terminal";
  const panelTitle = isFrench ? "Terminal interactif" : "Interactive terminal";

  useEffect(() => {
    setPortalReady(true);
  }, []);


  useEffect(() => {
    const log = panelLogRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, expanded]);

  useEffect(() => {
    if (expanded) {
      wasExpandedRef.current = true;
      panelInputRef.current?.focus();
      return;
    }
    if (wasExpandedRef.current) {
      wasExpandedRef.current = false;
      window.requestAnimationFrame(() => {
        launcherRef.current?.focus();
      });
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expanded]);

  const handleHistoryKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!history.length) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setCommand(history[next] ?? "");
    } else if (event.key === "ArrowDown" && historyIndex >= 0) {
      event.preventDefault();
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setCommand("");
      } else {
        setHistoryIndex(next);
        setCommand(history[next] ?? "");
      }
    }
  };

  const outputFor = (raw: string): string[] =>
    runTerminalCommand(raw, data, language, history);

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = command.trim();
    if (!raw) return;
    const normalized = raw.toLowerCase();
    setHistory((previous) => [...previous, raw].slice(-30));
    if (normalized === "clear") {
      setLines([]);
      setCommand("");
      setHistoryIndex(-1);
      return;
    }
    setLines((previous) => [...previous, `$ ${raw}`, ...outputFor(raw)].slice(-80));
    setCommand("");
    setHistoryIndex(-1);
  };

  const renderShell = (large: boolean) => {
    const inputId = `${id}-command-${large ? "panel" : "hero"}`;
    return (
      <aside className={`terminal${large ? " terminal-large" : ""}`} aria-label={t.terminal}>
        <div className="terminal-top">
          <span className="status-dot" aria-hidden="true" />
          <span className="terminal-session">local.signal</span>
          <span className="terminal-path">~/ctf</span>
          {large && (
            <button className="terminal-collapse" type="button" title={closeLabel} aria-label={closeLabel} aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(false)}>
              <span aria-hidden="true">−</span>
            </button>
          )}
        </div>
        <div className="terminal-lines" ref={large ? panelLogRef : inlineLogRef} role="log" aria-live="polite">
          {lines.slice(-40).map((line, index) => <div key={`${lines.length}-${index}`}>{line}</div>)}
        </div>
        <form onSubmit={submitCommand}>
          <label htmlFor={inputId} className="sr-only">{t.terminalPrompt}</label>
          <span aria-hidden="true">$</span>
          <input ref={large ? panelInputRef : inlineInputRef} id={inputId} autoComplete="off" spellCheck={false} maxLength={100} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={handleHistoryKeyDown} placeholder="help" />
          <button aria-label={t.run} type="submit">↵</button>
        </form>
      </aside>
    );
  };

  const floatingContent = (
    <div className="terminal-float-layer">
      {expanded ? (
        <section className="terminal-panel" id={panelId} role="dialog" aria-modal="false" aria-label={panelTitle}>
          {renderShell(true)}
        </section>
      ) : (
        <button ref={launcherRef} className="terminal-launcher" type="button" onClick={() => setExpanded(true)} title={openLabel} aria-label={openLabel} aria-expanded={expanded} aria-controls={panelId}>
          <span className="terminal-launcher-dot" aria-hidden="true" />
          <span className="terminal-launcher-copy"><strong>local.signal</strong><small>{isFrench ? "Déplier le terminal" : "Expand terminal"}</small></span>
          <svg className="terminal-launcher-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="m7 9 3 3-3 3m6 0h4" />
          </svg>
        </button>
      )}
    </div>
  );

  return portalReady ? createPortal(floatingContent, document.body) : null;
}
