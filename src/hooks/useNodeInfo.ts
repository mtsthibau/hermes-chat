import { useState, useEffect } from "react";

export function useNodeInfo(): string {
  const [orig, setOrig] = useState("chat");

  useEffect(() => {
    fetch("/api/sys")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => { if (cfg?.nodename) setOrig(cfg.nodename); })
      .catch(() => {});
  }, []);

  return orig;
}
