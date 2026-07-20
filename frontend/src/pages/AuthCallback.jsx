import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    const run = async () => {
      if (!sessionId) {
        navigate("/account", { replace: true });
        return;
      }
      try {
        const res = await api.post("/auth/session", null, { headers: { "X-Session-ID": sessionId } });
        setUser(res.data.user);
      } catch {
        /* fall through to account */
      } finally {
        // clear the hash then land on account
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/account", { replace: true });
      }
    };
    run();
  }, [navigate, setUser]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#0a0a0b]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-3xl text-white">DAPPER<span className="text-lime">DEN</span></span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a2a30] border-t-lime" />
        <p className="font-grotesk text-sm text-[#8b8b93]">Signing you in…</p>
      </div>
    </div>
  );
}
