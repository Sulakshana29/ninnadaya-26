"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (data.length === 0) return;

    // Get headers
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV string
    const csvContent = [
      headers.join(","), // Header row
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header] === null || row[header] === undefined ? "" : String(row[header]);
          // Escape quotes and wrap in quotes if contains comma
          return `"${cell.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ninnadaya26_contestants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExport}
      className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold tracking-wide shadow-md shadow-yellow-500/25 transition-all hover:scale-105"
    >
      <Download size={16} className="mr-2" /> Export to CSV
    </Button>
  );
}
