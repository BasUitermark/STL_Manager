// src/components/metadata/MetadataEditor/NotesForm.tsx
import React from "react";

interface NotesFormProps {
  notes: string;
  onChange: (value: string) => void;
}

export function NotesForm({ notes, onChange }: NotesFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-main-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={10}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add any notes, printing tips, or other information about this model..."
          className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>
    </div>
  );
}
