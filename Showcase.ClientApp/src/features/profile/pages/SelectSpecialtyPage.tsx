import { ArrowLeft, Check, ChevronLeft, Save, Search, Sparkles, Undo2, X, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { useSpecialtiesQuery } from "@shared/hooks/index.ts";
import { useAuth } from "@shared/context/index.ts";
import { ALL_SPECIALTIES, SPECIALTY_CATEGORIES } from "../constants.ts";
import { useMyProfileQuery, useUpdateProfileMutation } from "../../profile/hooks/useProfileQueries.ts";

export const SelectSpecialtyPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const { data: apiCategories = [], isLoading: isLoadingSpecialties } = useSpecialtiesQuery();
  const { data: profile, isLoading: isLoadingProfile } = useMyProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const initialSpecialty = profile?.specialty || null;
  const isLoading = isLoadingSpecialties || isLoadingProfile;
  const isSaving = updateProfileMutation.isPending;

  useEffect(() => {
    if (profile && !isInitialized) {
      setSelectedSpecialty(profile.specialty || null);
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const hasChanges = selectedSpecialty !== initialSpecialty;

  const categories = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c.name,
        name: c.name,
        description: `Explore standardized disciplines and fields in ${c.name}`,
        specialties: c.specialties.map((s) => s.name),
      }));
    }
    return SPECIALTY_CATEGORIES;
  }, [apiCategories]);

  const allSpecialtiesList = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      const set = new Set<string>();
      for (const cat of apiCategories) {
        for (const spec of cat.specialties) {
          set.add(spec.name);
        }
      }
      return Array.from(set);
    }
    return ALL_SPECIALTIES;
  }, [apiCategories]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory, categories]);

  const displayedSpecialties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return allSpecialtiesList.filter((s) => s.toLowerCase().includes(q));
    }
    if (activeCategoryObj) {
      return activeCategoryObj.specialties;
    }
    return [];
  }, [searchQuery, activeCategoryObj, allSpecialtiesList]);

  const handleSelectSpecialty = (specialty: string | null) => {
    setSelectedSpecialty(specialty);
  };

  const handleReset = () => {
    setSelectedSpecialty(initialSpecialty);
  };

  const handleSave = async () => {
    if (isSaving || !profile) return;

    try {
      await updateProfileMutation.mutateAsync({
        name: profile.name || "",
        specialty: selectedSpecialty,
        country: profile.country || null,
        bio: profile.bio || "",
      });

      await refreshUser();
      navigate("/profile/edit");
    } catch {
      // Handled by global/mutation toast handler
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[80vh] pb-28">
      {/* Navigation Breadcrumb & Top Action */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/profile/edit"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Edit Profile</span>
        </Link>

        {hasChanges && (
          <Button
            type="button"
            variant="clay"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="h-3.5 w-3.5" />}
            className="font-gothic uppercase tracking-wider text-xs hidden sm:inline-flex"
          >
            Save Changes
          </Button>
        )}
      </div>

      {/* Screen Header */}
      <header className="border-b border-stone pb-6 mb-8 space-y-2">

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          Select Primary Specialty
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          Choose your primary professional discipline from the standard fields, then click Save.
        </p>
      </header>

      {/* Main Canvas Container */}
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all disciplines (e.g. Medicine, Law, Civil Engineering, Software)..."
            className="w-full pl-11 pr-10 py-3 bg-ivory-medium/80 border border-stone rounded-xl font-serif text-sm text-slate-dark placeholder-cloud-dark focus:outline-none focus:border-slate-dark focus:bg-ivory-light transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cloud-dark hover:text-slate-dark p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Specialty Banner */}
        {selectedSpecialty && (
          <div className="p-3.5 rounded-xl bg-clay/10 border border-clay/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 text-clay shrink-0" />
              <div className="min-w-0">
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay block">
                  Selected Specialty
                </span>
                <span className="font-serif text-sm font-semibold text-slate-dark truncate block">
                  {selectedSpecialty}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSpecialty(null)}
              className="font-gothic text-xs font-bold uppercase tracking-wider text-clay hover:underline cursor-pointer ml-3 shrink-0"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* "No Specialty" Option Card */}
        <div>
          <button
            type="button"
            onClick={() => handleSelectSpecialty(null)}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedSpecialty === null && !searchQuery && !selectedCategory
                ? "bg-slate-dark text-ivory-light border-slate-dark"
                : "bg-ivory-medium/40 hover:bg-ivory-medium border-stone text-slate-dark"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <XCircle className={`w-5 h-5 shrink-0 ${selectedSpecialty === null && !searchQuery && !selectedCategory ? "text-clay" : "text-cloud-dark"}`} />
              <div>
                <p className="font-gothic text-sm font-bold uppercase tracking-wider">
                  No Specialty
                </p>
                <p className={`font-serif text-xs ${selectedSpecialty === null && !searchQuery && !selectedCategory ? "text-ivory-light/75" : "text-cloud-dark"}`}>
                  Do not display any specialty badge on your profile or member cards.
                </p>
              </div>
            </div>
            {selectedSpecialty === null && !searchQuery && !selectedCategory && <Check className="w-5 h-5 text-clay shrink-0" />}
          </button>
        </div>

        {/* Progressive Disclosure Section: List of Disciplines */}
        {(searchQuery.trim() !== "" || selectedCategory !== null) ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              {selectedCategory && !searchQuery && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to All Categories</span>
                </button>
              )}
              <span className="font-gothic text-xs font-bold uppercase tracking-wider text-cloud-dark ml-auto">
                {displayedSpecialties.length} {displayedSpecialties.length === 1 ? "Specialty" : "Specialties"} Available
              </span>
            </div>

            {/* Bounded Scrollable Container for Disciplines */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-stone/30 border border-stone/60 rounded-xl p-3 bg-ivory-medium/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedSpecialties.map((item) => {
                  const isSelected = selectedSpecialty === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectSpecialty(item)}
                      title={item}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? "bg-slate-dark text-ivory-light border-slate-dark ring-2 ring-clay/40"
                          : "bg-ivory-light hover:bg-ivory-medium border-stone/60 text-slate-dark hover:border-slate-dark"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-clay" : "text-cloud-dark"
                          }`}
                        />
                        <span className="font-serif text-xs font-medium truncate">
                          {item}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-clay shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {displayedSpecialties.length === 0 && (
                <div className="py-12 text-center text-cloud-dark font-serif text-sm">
                  No specialties found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Categories Grid */
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-gothic font-bold uppercase tracking-[0.14em] text-cloud-dark">
              <span>Choose by Category</span>
              <span className="font-serif text-xs lowercase">
                or use search above
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-left p-4 rounded-xl border border-stone/70 bg-ivory-medium/40 hover:bg-ivory-medium hover:border-slate-dark transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark group-hover:text-clay transition-colors">
                      {cat.name}
                    </h3>
                    <span className="font-gothic text-[11px] font-semibold text-cloud-dark">
                      {cat.specialties.length} fields
                    </span>
                  </div>
                  <p className="font-serif text-xs text-cloud-dark line-clamp-2">
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sticky / Permanent Bottom Save Action Bar */}
        <div className="pt-4 border-t border-stone/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs font-serif text-cloud-dark">
            {hasChanges ? (
              <span className="text-slate-dark font-semibold">
                Pending selection: <span className="text-clay">{selectedSpecialty || "No Specialty"}</span>
              </span>
            ) : (
              <span>Select an option above, then click Save.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                leftIcon={<Undo2 className="h-3.5 w-3.5" />}
              >
                Reset
              </Button>
            )}

            <Button
              type="button"
              variant={hasChanges ? "clay" : "outline"}
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasChanges || isLoading}
              leftIcon={<Save className="h-4 w-4" />}
              className="font-gothic uppercase tracking-wider text-xs justify-center"
            >
              Save Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
