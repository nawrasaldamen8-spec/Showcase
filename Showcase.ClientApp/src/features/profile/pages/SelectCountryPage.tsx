import { ArrowLeft, Check, Globe, Search, X, XCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCountriesQuery } from "@shared/hooks/index.ts";
import { useAuth } from "@shared/context/index.ts";
import { useMyProfileQuery, useUpdateProfileMutation } from "../../profile/hooks/useProfileQueries.ts";

export const SelectCountryPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const { data: countries = [], isLoading: isLoadingCountries } = useCountriesQuery();
  const { data: profile, isLoading: isLoadingProfile } = useMyProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentCountry = profile?.country || null;
  const isLoading = isLoadingCountries || isLoadingProfile;
  const isSaving = updateProfileMutation.isPending;

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alpha2.toLowerCase().includes(q) ||
        c.alpha3.toLowerCase().includes(q)
    );
  }, [countries, searchQuery]);

  const handleSelectCountry = async (countryName: string | null) => {
    if (isSaving || !profile) return;

    try {
      await updateProfileMutation.mutateAsync({
        name: profile.name || "",
        specialty: profile.specialty || null,
        country: countryName,
        bio: profile.bio || "",
      });

      await refreshUser();
      navigate("/profile/edit");
    } catch {
      // Global/mutation error handler will show toast
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
            Location &amp; Region
          </span>
        </div>

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          Select Country / Region
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          Choose your standard country or region from the registry of {countries.length || 249} countries, or leave it unselected.
        </p>
      </header>

      {/* Main Canvas Container */}
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-8 space-y-6">
        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries by name or code (e.g. Jordan, Germany, United States, Japan)..."
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

        {/* Current Country Banner */}
        {currentCountry && (
          <div className="p-3.5 rounded-xl bg-clay/10 border border-clay/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 text-clay shrink-0" />
              <div className="min-w-0">
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay block">
                  Current Country
                </span>
                <span className="font-serif text-sm font-semibold text-slate-dark truncate block">
                  {currentCountry}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectCountry(null)}
              disabled={isSaving || isLoading}
              className="font-gothic text-xs font-bold uppercase tracking-wider text-clay hover:underline cursor-pointer ml-3 shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {/* Clear / No Country Option */}
        <div>
          <button
            type="button"
            onClick={() => handleSelectCountry(null)}
            disabled={isSaving || isLoading}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              currentCountry === null && !searchQuery
                ? "bg-slate-dark text-ivory-light border-slate-dark"
                : "bg-ivory-medium/40 hover:bg-ivory-medium border-stone text-slate-dark"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <XCircle className={`w-5 h-5 shrink-0 ${currentCountry === null && !searchQuery ? "text-clay" : "text-cloud-dark"}`} />
              <div>
                <p className="font-gothic text-sm font-bold uppercase tracking-wider">
                  No Country / Unspecified
                </p>
                <p className={`font-serif text-xs ${currentCountry === null && !searchQuery ? "text-ivory-light/75" : "text-cloud-dark"}`}>
                  Do not display a country location on your profile.
                </p>
              </div>
            </div>
            {currentCountry === null && !searchQuery && <Check className="w-5 h-5 text-clay shrink-0" />}
          </button>
        </div>

        {/* Bounded Scrollable Countries Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-gothic font-bold uppercase tracking-[0.14em] text-cloud-dark">
            <span>
              All Countries ({filteredCountries.length})
            </span>
            <span className="font-serif text-xs lowercase">
              scroll to browse
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 border border-stone/60 rounded-xl p-3 bg-ivory-medium/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredCountries.map((c) => {
                const isSelected = currentCountry?.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCountry(c.name)}
                    disabled={isSaving || isLoading}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-slate-dark text-ivory-light border-slate-dark font-medium"
                        : "bg-ivory-light hover:bg-ivory-medium border-stone/60 text-slate-dark hover:border-slate-dark"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-clay" : "text-cloud-dark"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-medium truncate">
                          {c.name}
                        </p>
                        <p className={`font-mono text-[9px] uppercase ${isSelected ? "text-ivory-light/70" : "text-cloud-dark"}`}>
                          {c.alpha2} &bull; {c.alpha3}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-clay shrink-0" />}
                  </button>
                );
              })}
            </div>

            {filteredCountries.length === 0 && (
              <div className="py-12 text-center text-cloud-dark font-serif text-sm">
                No countries match &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
