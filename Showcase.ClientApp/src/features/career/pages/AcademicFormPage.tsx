import { GraduationCap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useToast } from "@shared/context/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";

const ACADEMIC_DEGREE_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "Associate Degree",
  "High School Diploma",
  "Post-Doctorate",
  "Professional Diploma",
  "Advanced Certificate",
];

export const AcademicFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState(ACADEMIC_DEGREE_OPTIONS[0]);
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyStudying, setCurrentlyStudying] = useState(false);
  const [gpa, setGpa] = useState("");
  const [achievements, setAchievements] = useState("");

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
        const items = await apiClient.getAcademics();
        const found = items.find((acad) => acad.id === id);
        if (found && mounted) {
          setInstitution(found.institution || "");
          setDegree(found.degree || ACADEMIC_DEGREE_OPTIONS[0]);
          setFieldOfStudy(found.fieldOfStudy || "");
          setStartDate(found.startDate || "");
          setEndDate(found.endDate || "");
          setCurrentlyStudying(Boolean(found.currentlyStudying));
          setGpa(found.gpa || "");
          setAchievements(found.achievements || "");
        } else if (!found && mounted) {
          showToast("error", "Academic record not found.");
          navigate("/career/academics");
        }
      } catch (err) {
        console.error("Failed to load academic record", err);
        if (mounted) {
          showToast("error", "Failed to load academic data.");
          navigate("/career/academics");
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

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "institution") {
      if (!institution.trim()) errs.institution = "Institution or University is required.";
      else delete errs.institution;
    }
    if (!field || field === "degree") {
      if (!degree.trim()) errs.degree = "Degree or Academic stage is required.";
      else delete errs.degree;
    }
    if (!field || field === "fieldOfStudy") {
      if (!fieldOfStudy.trim()) errs.fieldOfStudy = "Field of study or major is required.";
      else delete errs.fieldOfStudy;
    }
    if (!field || field === "startDate") {
      if (!startDate.trim()) errs.startDate = "Start date is required.";
      else delete errs.startDate;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ institution: true, degree: true, fieldOfStudy: true, startDate: true });
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        institution: institution.trim(),
        degree: degree.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        startDate: startDate.trim(),
        endDate: currentlyStudying ? undefined : endDate.trim() || undefined,
        currentlyStudying,
        gpa: gpa.trim() || undefined,
        achievements: achievements.trim() || undefined,
      };

      if (isEditing && id) {
        await apiClient.updateAcademic(id, payload);
        showToast("success", "Academic record updated successfully.");
      } else {
        await apiClient.createAcademic(payload);
        showToast("success", "Academic record added successfully.");
      }
      navigate("/career/academics");
    } catch (err) {
      console.error("Failed to save academic record", err);
      showToast("error", "Failed to save academic record.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Education" : "Add Education"}
        subtitle="Add your degree, institution, and study details."
        backTo="/career/academics"
        backLabel="Back to Academics"
        icon={GraduationCap}
      >
        <div className="py-12 text-center text-[#87867f] font-serif">
          Loading education record...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Education" : "Add Education"}
      subtitle="Add your degree, institution, and study details."
      backTo="/career/academics"
      backLabel="Back to Academics"
      icon={GraduationCap}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Institution */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Institution / University <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errors.institution) validate("institution");
            }}
            onBlur={() => handleBlur("institution")}
            placeholder="e.g. University of California, Berkeley"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.institution && errors.institution ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.institution && errors.institution && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.institution}</p>
          )}
        </div>

        {/* Degree Dropdown & Field of Study */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Degree / Stage <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={degree}
              onChange={(e) => {
                setDegree(e.target.value);
                if (errors.degree) validate("degree");
              }}
              onBlur={() => handleBlur("degree")}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] cursor-pointer ${
                touched.degree && errors.degree ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
              }`}
            >
              {ACADEMIC_DEGREE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {touched.degree && errors.degree && (
              <p className="font-serif text-xs text-red-600 mt-1">{errors.degree}</p>
            )}
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Field of Study / Major <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(e) => {
                setFieldOfStudy(e.target.value);
                if (errors.fieldOfStudy) validate("fieldOfStudy");
              }}
              onBlur={() => handleBlur("fieldOfStudy")}
              placeholder="e.g. Computer Science, Graphic Design, or Business"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                touched.fieldOfStudy && errors.fieldOfStudy ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
              }`}
            />
            {touched.fieldOfStudy && errors.fieldOfStudy && (
              <p className="font-serif text-xs text-red-600 mt-1">{errors.fieldOfStudy}</p>
            )}
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Start Date <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) validate("startDate");
              }}
              onBlur={() => handleBlur("startDate")}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                touched.startDate && errors.startDate ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
              }`}
            />
            {touched.startDate && errors.startDate && (
              <p className="font-serif text-xs text-red-600 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              End Date
            </label>
            <input
              type="month"
              value={endDate}
              disabled={currentlyStudying}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Currently Studying Checkbox */}
        <div className="pt-0.5">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentlyStudying}
              onChange={(e) => setCurrentlyStudying(e.target.checked)}
              className="w-4 h-4 rounded text-[#d97757] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="font-gothic text-xs font-semibold text-[#141413]">
              I am currently studying here
            </span>
          </label>
        </div>

        {/* GPA & Honors */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            GPA / Honors (Optional)
          </label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. 3.8 / 4.0 or Magna Cum Laude"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Notable Distinctions & Awards */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Awards &amp; Activities (Optional)
          </label>
          <input
            type="text"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. Dean's List, Research Assistant, Club President"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/career/academics")}
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
            {isSaving ? "Saving..." : isEditing ? "Update Education" : "Save Education"}
          </Button>
        </div>
      </form>
    </CareerActionLayout>
  );
};
