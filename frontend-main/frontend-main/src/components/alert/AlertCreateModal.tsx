import React, { useState } from "react";
import { X } from "lucide-react"; // close icon
import axios from "axios";
import { service } from "@/services";

interface AlertFormData {
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
  country: string;
  region: string;
}

interface AlertCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // optional callback after successful creation
}

const CATEGORY_CHOICES = [
  { value: "disease_outbreak", label: "Disease Outbreak" },
  { value: "resource_shortage", label: "Resource Shortage" },
  { value: "natural_disaster", label: "Natural Disaster" },
  { value: "administrative", label: "Administrative" },
  { value: "capaticy_alert", label: "Capacity Alert" },
];

const STATUS_CHOICES = [
  { value: "active", label: "Active" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

const SEVERITY_CHOICES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const AlertCreateModal: React.FC<AlertCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<AlertFormData>({
    title: "",
    description: "",
    category: "",
    status: "",
    severity: "",
    country: "",
    region: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
        await service.alert.create(formData)
        setFormData({
            title: "",
            description: "",
            category: "",
            status: "",
            severity: "",
            country: "",
            region: "",
        });
        if (onCreated) onCreated();
        onClose();
    } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to create alert");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create Alert</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {CATEGORY_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Status</option>
            {STATUS_CHOICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Severity</option>
            {SEVERITY_CHOICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region"
            className="w-full bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Alert"}
          </button>
        </form>
      </div>
    </div>
  );
};
