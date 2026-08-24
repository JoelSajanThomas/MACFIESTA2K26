"use client";

import { useState } from "react";
import { RiShieldFlashLine, RiShieldCheckLine, RiCheckLine, RiCloseLine } from "react-icons/ri";

export function AccessControlModule() {
  const permissionsMatrix = [
    { module: "Dashboard & Analytics", view: true, create: true, edit: true, delete: true, publish: true, download: true },
    { module: "Events Console", view: true, create: true, edit: true, delete: true, publish: true, download: true },
    { module: "Registrations & Passes", view: true, create: false, edit: true, delete: false, publish: true, download: true },
    { module: "Hostel ERP (Male/Female)", view: true, create: true, edit: true, delete: false, publish: true, download: true },
    { module: "Food Counters ERP", view: true, create: false, edit: true, delete: false, publish: true, download: true },
    { module: "Bank Finance ERP", view: true, create: true, edit: true, delete: false, publish: true, download: true },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Access Control, Roles & Permissions Matrix
          </h2>
          <p className="text-xs text-white/40">Manage unlimited roles, granular capability matrix, login history, and security blocks</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Granular Capability Permission Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-2.5 px-3">System Module</th>
                <th className="py-2.5 px-3 text-center">View</th>
                <th className="py-2.5 px-3 text-center">Create</th>
                <th className="py-2.5 px-3 text-center">Edit</th>
                <th className="py-2.5 px-3 text-center">Delete</th>
                <th className="py-2.5 px-3 text-center">Publish</th>
                <th className="py-2.5 px-3 text-center">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="py-3 px-3 font-bold">{row.module}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold"><RiCheckLine size={16} className="mx-auto" /></td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{row.create ? <RiCheckLine size={16} className="mx-auto" /> : <RiCloseLine size={16} className="mx-auto text-white/20" />}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{row.edit ? <RiCheckLine size={16} className="mx-auto" /> : <RiCloseLine size={16} className="mx-auto text-white/20" />}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{row.delete ? <RiCheckLine size={16} className="mx-auto" /> : <RiCloseLine size={16} className="mx-auto text-white/20" />}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{row.publish ? <RiCheckLine size={16} className="mx-auto" /> : <RiCloseLine size={16} className="mx-auto text-white/20" />}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{row.download ? <RiCheckLine size={16} className="mx-auto" /> : <RiCloseLine size={16} className="mx-auto text-white/20" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
