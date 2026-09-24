import { CheckCircle2, Clock, Laptop, LogOut, MapPin, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import { useToast } from "../../../shared/context/index.ts";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: "desktop" | "mobile";
}

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "sess_current",
    device: 'Apple MacBook Pro 16"',
    browser: "Chrome 124.0 on macOS Sonoma",
    location: "Stockholm, Sweden",
    ip: "194.237.214.12",
    lastActive: "Active now",
    isCurrent: true,
    type: "desktop",
  },
  {
    id: "sess_iphone",
    device: "Apple iPhone 15 Pro",
    browser: "Mobile Safari on iOS 17.4",
    location: "Stockholm, Sweden",
    ip: "85.228.14.92",
    lastActive: "2 hours ago",
    isCurrent: false,
    type: "mobile",
  },
  {
    id: "sess_studio_ipad",
    device: 'Apple iPad Pro 12.9"',
    browser: "Safari on iPadOS 17.3",
    location: "Gothenburg, Sweden",
    ip: "213.115.112.50",
    lastActive: "3 days ago",
    isCurrent: false,
    type: "desktop",
  },
];

export const ActiveSessionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [isTerminating, setIsTerminating] = useState(false);

  const handleTerminateOtherSessions = () => {
    setIsTerminating(true);
    setTimeout(() => {
      setIsTerminating(false);
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      showToast("success", "All other active client sessions have been terminated.");
    }, 500);
  };

  const handleTerminateSession = (id: string, device: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("info", `Session on ${device} terminated.`);
  };

  const hasOtherSessions = sessions.some((s) => !s.isCurrent);

  return (
    <SecurityActionLayout
      title="Active Sessions & Devices"
      subtitle="Review all devices currently authenticated to your creator atelier and revoke unneeded access."
      badge="Sessions"
    >
      <div className="space-y-6">
        {/* Device Sessions List */}
        <div className="space-y-3.5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                sess.isCurrent
                  ? "bg-[#f0eee6]/60 border-[#cccbc8]"
                  : "bg-[#faf9f5] border-[#cccbc8]/60 hover:border-[#141413]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-[#141413] shrink-0 mt-0.5">
                    {sess.type === "desktop" ? (
                      <Laptop className="h-5 w-5 stroke-[1.8]" />
                    ) : (
                      <Smartphone className="h-5 w-5 stroke-[1.8]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-gothic text-sm font-bold uppercase tracking-tight text-[#141413]">
                        {sess.device}
                      </h4>
                      {sess.isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>This Device</span>
                        </span>
                      )}
                    </div>

                    <p className="font-serif text-xs text-[#87867f]">{sess.browser}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-serif text-[#87867f]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{sess.location}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{sess.lastActive}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleTerminateSession(sess.id, sess.device)}
                    className="text-xs font-gothic uppercase tracking-wider text-[#d97757] hover:underline p-1 shrink-0 cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Global Kill Switch Button */}
        {hasOtherSessions && (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              isLoading={isTerminating}
              onClick={handleTerminateOtherSessions}
              leftIcon={<LogOut className="h-4 w-4 text-[#d97757]" />}
              className="justify-center font-gothic uppercase tracking-wider text-xs border-[#d97757]/40 text-[#d97757] hover:bg-[#d97757]/10 shadow-none"
            >
              Sign Out All Other Sessions
            </Button>
          </div>
        )}
      </div>
    </SecurityActionLayout>
  );
};
