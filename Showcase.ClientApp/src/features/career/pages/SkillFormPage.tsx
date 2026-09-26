import { Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useToast } from "@shared/context/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";

const CATEGORIES = ["Design", "Technical", "Leadership", "Tools", "General"];

export const SkillFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

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
        const items = await apiClient.getSkills();
        const found = items.find((skl) => skl.id === id);
        if (found && mounted) {
          setName(found.name || "");
          setCategory(found.category || CATEGORIES[0]);
        } else if (!found && mounted) {
          showToast("error", "Skill record not found.");
          navigate("/career/skills");
        }
      } catch (err) {
        console.error("Failed to load skill record", err);
        if (mounted) {
          showToast("error", "Failed to load skill data.");
          navigate("/career/skills");
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
    if (!name.trim()) {
      errs.name = "Skill name is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true });
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || undefined,
      };

      if (isEditing && id) {
        await apiClient.updateSkill(id, payload);
        showToast("success", "Skill updated successfully.");
      } else {
        await apiClient.createSkill(payload);
        showToast("success", "Skill added successfully.");
      }
      navigate("/career/skills");
    } catch (err) {
      console.error("Failed to save skill", err);
      showToast("error", "Failed to save skill.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Skill" : "Add Skill"}
        subtitle="Add a skill, tool, or area of expertise."
        backTo="/career/skills"
        backLabel="Back to Skills"
        icon={Sparkles}
      >
        <div className="py-12 text-center text-[#87867f] font-serif">
          Loading skill details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Skill" : "Add Skill"}
      subtitle="Add a skill, tool, or area of expertise."
      backTo="/career/skills"
      backLabel="Back to Skills"
      icon={Sparkles}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Skill Name */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Skill Name <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) validate();
            }}
            onBlur={handleBlur}
            placeholder="e.g. React, TypeScript, Figma, or Product Strategy"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.name && errors.name ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.name && errors.name && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Category Selector */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    isSelected
                      ? "bg-[#141413] text-[#faf9f5] border-[#141413]"
                      : "bg-[#f0eee6] text-[#87867f] border-[#cccbc8]/60 hover:text-[#141413] hover:border-[#141413]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/career/skills")}
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
            {isSaving ? "Saving..." : isEditing ? "Update Skill" : "Save Skill"}
          </Button>
        </div>
      </form>
    </CareerActionLayout>
  );
};
