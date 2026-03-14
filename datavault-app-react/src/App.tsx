import { FormEvent, startTransition, useEffect, useState } from "react";
import { Bot, MapPinned, RefreshCcw, Send, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationMap } from "@/components/LocationMap";

type LocationPoint = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function App() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadLocations = async () => {
      try {
        const data = await fetchJson<LocationPoint[]>(
          "/api/datavault_app/location-history/"
        );
        if (!mounted) {
          return;
        }
        startTransition(() => {
          setLocations(data);
        });
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load location history."
        );
      } finally {
        if (mounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    void loadLocations();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      try {
        const data = await fetchJson<ChatMessage[]>(
          "/api/datavault_app/chat/messages/"
        );
        if (!mounted) {
          return;
        }
        startTransition(() => {
          setMessages(data);
        });
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load chat messages."
        );
      } finally {
        if (mounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    void loadMessages();
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 2500);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedDraft = draft.trim();

    if (!trimmedDraft || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await fetchJson<ChatMessage[]>("/api/datavault_app/chat/messages/", {
        method: "POST",
        body: JSON.stringify({ content: trimmedDraft }),
      });
      setDraft("");
      const latestMessages = await fetchJson<ChatMessage[]>(
        "/api/datavault_app/chat/messages/"
      );
      startTransition(() => {
        setMessages(latestMessages);
      });
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send message."
      );
    } finally {
      setIsSending(false);
    }
  }

  const latestPoint = locations.at(-1);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(42,157,143,0.18),_transparent_45%),linear-gradient(180deg,#f8f5ee_0%,#edf2f4_55%,#d7e3ea_100%)] text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
                <MapPinned className="h-3.5 w-3.5" />
                Datavault Tracker
              </div>
              <div className="space-y-3">
                <h1 className="font-['Avenir_Next',_'IBM_Plex_Sans',sans-serif] text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Mock location history on a live map, with an agent that can
                  answer questions about where you were.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Run <code>python manage.py create_mock_data</code> in{" "}
                  <code>web</code>, then open this app. The frontend reads the
                  backend&apos;s location points and polls for new agent
                  responses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Points
                </p>
                <p className="mt-2 text-3xl font-semibold">{locations.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Messages
                </p>
                <p className="mt-2 text-3xl font-semibold">{messages.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Latest
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {latestPoint ? formatTimestamp(latestPoint.recorded_at) : "No data"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
          <article className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Map
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Route history</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            <LocationMap
              locations={locations}
              isLoading={isLoadingLocations}
              emptyMessage="No location points yet. Run python manage.py create_mock_data."
            />
          </article>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
              <div className="mb-4 flex items-center gap-3">
                <Bot className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Agent chat
                  </p>
                  <h2 className="text-2xl font-semibold">Ask about date ranges</h2>
                </div>
              </div>

              <ScrollArea className="h-[24rem] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="space-y-3">
                  {isLoadingMessages ? (
                    <p className="text-sm text-slate-500">Loading messages...</p>
                  ) : null}

                  {!isLoadingMessages && messages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                      Try: <code>Where was I between 2026-03-09 and 2026-03-11?</code>
                    </div>
                  ) : null}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "assistant"
                          ? "bg-white text-slate-700"
                          : "ml-auto bg-slate-900 text-white"
                      }`}
                    >
                      <p className="mb-1 text-[11px] uppercase tracking-[0.2em] opacity-60">
                        {message.role}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form className="mt-4 flex gap-3" onSubmit={handleSendMessage}>
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask where you were during a time window..."
                  className="h-12 rounded-full border-slate-200 bg-white"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-full px-5"
                  disabled={isSending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </form>
            </article>

            <article className="rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
              <div className="mb-4 flex items-center gap-3">
                <TimerReset className="h-5 w-5 text-sky-700" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Timeline
                  </p>
                  <h2 className="text-2xl font-semibold">Recorded points</h2>
                </div>
              </div>

              <ScrollArea className="h-[20rem] pr-4">
                <div className="space-y-3">
                  {locations.map((point) => (
                    <div
                      key={point.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{point.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            {formatTimestamp(point.recorded_at)}
                          </p>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                          <p>{point.latitude.toFixed(4)}</p>
                          <p>{point.longitude.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
