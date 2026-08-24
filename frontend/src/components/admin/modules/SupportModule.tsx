"use client";

import { useState } from "react";
import { RiCustomerService2Line } from "react-icons/ri";

export function SupportModule() {
  const [complaints] = useState([
    { id: "c1", delegate: "Rahul Varma", subject: "Hostel Room Allocation Query", status: "OPEN" },
  ]);

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Helpdesk, Complaints & Contact Messages
          </h2>
          <p className="text-xs text-white/40">Manage delegate support tickets, participant feedback, and website inquiry messages</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Active Complaints
        </h3>
        {complaints.map((c) => (
          <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between">
            <div>
              <h4 className="font-extrabold text-white">{c.subject}</h4>
              <p className="text-white/60">{c.delegate}</p>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
