import { Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useToast } from "@shared/context/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";

const ACHIEVEMENT_TYPES = ["Award", "Publication", "Exhibition", "Fellowship", "Grant", "Honor"];

export const AchievementFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [type, setType] = useState(ACHIEVEMENT_TYPES[0]);
  const [organization, setOrganization] = useState("");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function loadItem() {
      setIsLoading(true);
      try {
        const items = await apiClient.getAchievements();
        const found = items.find((ach) => ach.id === id);
        if (found && mounted) {
          setTitle(found.title || "");
          setType(found.type || ACHIEVEMENT_TYPES[0]);
          setOrganization(found.organization || "");
          setDate(found.date || "");
          setUrl(found.url || "");
          setMediaUrl(found.mediaUrl || "");
          setDescription(found.description || "");
        } else if (!found && mounted) {
          showToast("error", "Achievement record not found.");
          navigate("/career/achievements");
        }
      } catch (err) {
        console.error("Failed to load achievement record", err);
        if (mounted) {
          showToast("error", "Failed to load achievement data.");
          navigate("/career/achievements");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadItem();
    return () => {
      mounted = false;
    };
  }, [id, navigate, showToast]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "Achievement title is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true });
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type: type.trim() || undefined,
        organization: organization.trim() || undefined,
        date: date.trim() || undefined,
        url: url.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (isEditing && id) {
        await apiClient.updateAchievement(id, payload);
        showToast("success", "Achievement updated successfully.");
      } else {
        await apiClient.createAchievement(payload);
        showToast("success", "Achievement recorded successfully.");
      }
      navigate("/career/achievements");
    } catch (err) {
      console.error("Failed to save achievement", err);
      showToast("error", "Failed to save achievement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Achievement" : "Add Achievement"}
        subtitle="Add honors, awards, publications, or key milestones."
        backTo="/career/achievements"
        backLabel="Back to Achievements"
        icon={Trophy}
      >
        <div className="py-12 text-center text-[#87867f] font-serif">
          Loading achievement details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Achievement" : "Add Achievement"}
      subtitle="Add honors, awards, publications, or key milestones."
      backTo="/career/achievements"
      backLabel="Back to Achievements"
      icon={Trophy}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Achievement Title <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) validate();
            }}
            onBlur={handleBlur}
            placeholder="e.g. Best Design Award 2024 or Published Research Paper"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.title && errors.title ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.title && errors.title && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Type & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] cursor-pointer"
            >
              {ACHIEVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Organization / Issuer
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. IEEE, Design Week, or Tech Conference"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Date & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Date Received
            </label>
            <input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Link (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/award-article"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Media URL */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Image URL (Optional)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this achievement or milestone..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/career/achievements")}
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : isEditing ? "Update Achievement" : "Save Achievement"}
          </Button>
        </div>
      </form>
    </CareerActionLayout>
  );
};
