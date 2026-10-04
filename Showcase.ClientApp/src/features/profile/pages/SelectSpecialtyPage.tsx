import { ArrowLeft, Check, ChevronLeft, Search, Sparkles, X, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { SpecialtyCategoryDto } from "@shared/api/apiClient.lookups.ts";
import { useAuth, useToast } from "@shared/context/index.ts";
import { ALL_SPECIALTIES, SPECIALTY_CATEGORIES } from "../constants.ts";

export const SelectSpecialtyPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();

  const [currentSpecialty, setCurrentSpecialty] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [profileCountry, setProfileCountry] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [apiCategories, setApiCategories] = useState<SpecialtyCategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [profileData, specialtiesData] = await Promise.all([
          apiClient.getMyProfile(),
          apiClient.getSpecialties().catch(() => []),
        ]);
        if (isMounted) {
          setCurrentSpecialty(profileData.specialty || null);
          setProfileName(profileData.name || "");
          setProfileCountry(profileData.country || null);
          setProfileBio(profileData.bio || "");
          if (specialtiesData && specialtiesData.length > 0) {
            setApiCategories(specialtiesData);
          }
        }
      } catch (err) {
        console.error("Failed to load profile specialty:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    if (apiCategories.length > 0) {
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
    if (apiCategories.length > 0) {
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

  const handleSelectSpecialty = async (specialty: string | null) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await apiClient.updateProfile({
        name: profileName,
        specialty: specialty,
        country: profileCountry,
        bio: profileBio,
      });

      await refreshUser();
      showToast("success", specialty ? `Primary specialty updated to "${specialty}".` : "Specialty removed.");
      navigate("/profile/edit");
    } catch (err) {
      console.error("Failed to update specialty:", err);
      showToast("error", "Failed to update specialty. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[80vh]">
      {/* Navigation Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to="/profile/edit"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Edit Profile</span>
        </Link>
      </nav>

      {/* Screen Header */}
      <header className="border-b border-stone pb-6 mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
            Profile Settings
          </span>
          <span className="text-stone">&bull;</span>
          <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark">
            Specialty / Field
          </span>
        </div>

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          Select Primary Specialty
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          Choose your primary professional discipline from the standard fields, or choose to clear your specialty.
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cloud-dark hover:text-slate-dark p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Current Selection Banner */}
        {currentSpecialty && (
          <div className="p-3.5 rounded-xl bg-clay/10 border border-clay/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 text-clay shrink-0" />
              <div className="min-w-0">
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay block">
                  Current Specialty
                </span>
                <span className="font-serif text-sm font-semibold text-slate-dark truncate block">
                  {currentSpecialty}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSpecialty(null)}
              disabled={isSaving || isLoading}
              className="font-gothic text-xs font-bold uppercase tracking-wider text-clay hover:underline cursor-pointer ml-3 shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {/* "No Specialty" Option Card */}
        <div>
          <button
            type="button"
            onClick={() => handleSelectSpecialty(null)}
            disabled={isSaving || isLoading}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              currentSpecialty === null && !searchQuery && !selectedCategory
                ? "bg-slate-dark text-ivory-light border-slate-dark"
                : "bg-ivory-medium/40 hover:bg-ivory-medium border-stone text-slate-dark"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <XCircle className={`w-5 h-5 shrink-0 ${currentSpecialty === null && !searchQuery && !selectedCategory ? "text-clay" : "text-cloud-dark"}`} />
              <div>
                <p className="font-gothic text-sm font-bold uppercase tracking-wider">
                  No Specialty
                </p>
                <p className={`font-serif text-xs ${currentSpecialty === null && !searchQuery && !selectedCategory ? "text-ivory-light/75" : "text-cloud-dark"}`}>
                  Do not display any specialty badge on your profile or member cards.
                </p>
              </div>
            </div>
            {currentSpecialty === null && !searchQuery && !selectedCategory && <Check className="w-5 h-5 text-clay shrink-0" />}
          </button>
        </div>

        {/* Progressive Disclosure Section: List of Disciplines (When Searching or Category is Selected) */}
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
                  const isSelected = currentSpecialty === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectSpecialty(item)}
                      disabled={isSaving || isLoading}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-slate-dark text-ivory-light border-slate-dark"
                          : "bg-ivory-light hover:bg-ivory-medium border-stone/60 text-slate-dark hover:border-slate-dark"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-clay" : "text-cloud-dark"
                          }`}
                        />
                        <span className="font-serif text-sm font-medium truncate">
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
                  No specialties match &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Initial View: Responsive Wrapped Category Grid */
          <div className="space-y-3 pt-2">
            <p className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark">
              Select Field Category
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALTY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="p-4 rounded-xl bg-ivory-medium/50 hover:bg-ivory-medium border border-stone/60 hover:border-slate-dark text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark group-hover:text-clay transition-colors">
                      {cat.name}
                    </h3>
                    <p className="font-serif text-xs text-cloud-dark mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-gothic font-semibold uppercase tracking-wider text-cloud-dark">
                    <span>{cat.specialties.length} Disciplines</span>
                    <span className="text-clay group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
