import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AcademicCard,
  AchievementCard,
  CredentialCard,
  ExperienceCard,
  LanguageCard,
  SkillCard,
} from "@features/career/components/index.ts";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import type {
  PostSummaryResponse,
  PublicCareerData,
  PublicProfileResponse,
} from "@shared/types/index.ts";
import { PostMasonryGrid } from "../components/PostMasonryGrid.tsx";
import { ProfileAboutTab } from "../components/ProfileAboutTab.tsx";
import { ProfileHeader } from "../components/ProfileHeader.tsx";
import { ProfileSkeleton } from "../components/ProfileSkeleton.tsx";

const PAGE_SIZE = 12;

type ProfileTab = "works" | "career" | "about";

type CareerSectionId =
  | "experience"
  | "academics"
  | "skills"
  | "credentials"
  | "languages"
  | "achievements";

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = location.state as { from?: string; fromLabel?: string } | null;

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [careerData, setCareerData] = useState<PublicCareerData | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("works");
  const [selectedCareerSection, setSelectedCareerSection] = useState<CareerSectionId | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!username) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [profileData, postsData, careerRes] = await Promise.all([
        apiClient.getPublicProfile(username),
        apiClient.getCreatorPosts(username, 1, PAGE_SIZE),
        apiClient.getPublicCareer(username).catch((err) => {
          console.warn("Failed to load public career data:", err);
          return null;
        }),
      ]);

      setProfile(profileData);
      setPosts(postsData.items);
      setPageNumber(1);
      setHasNextPage(postsData.hasNextPage);
      setCareerData(careerRes);
    } catch (err: unknown) {
      console.error("Failed to load creator profile:", err);
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        setError("Unable to load profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    let isCancelled = false;
    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      await loadProfileData();
    });
    return () => {
      isCancelled = true;
    };
  }, [loadProfileData]);

  const handleLoadMore = async () => {
    if (!username || isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);
    const nextPage = pageNumber + 1;
    try {
      const postsData = await apiClient.getCreatorPosts(username, nextPage, PAGE_SIZE);
      setPosts((prev) => [...prev, ...postsData.items]);
      setPageNumber(nextPage);
      setHasNextPage(postsData.hasNextPage);
    } catch (err) {
      console.error("Failed to load more works for profile:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile
            ? `${profile.firstName} ${profile.lastName} (@${profile.username}) - Pority`
            : "Pority Profile",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast("success", "Profile link copied to clipboard.");
    } else {
      showToast("error", "Unable to copy profile link.");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#f0eee6] text-[#87867f] mb-6">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
          Profile Not Found
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
          Profile Unavailable
        </h1>
        <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed max-w-lg mx-auto">
          No profile exists for &ldquo;@{username}&rdquo; on Pority.
        </p>
        <div className="mt-8">
          <Link to="/studio">
            <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#faf9f5] border border-[#d97757]/40 rounded-[24px] p-8">
          <p className="font-serif text-lg text-[#141413]">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/studio">
              <Button variant="outline" size="sm">
                Back to Studio
              </Button>
            </Link>
            <Button variant="slate" size="sm" onClick={loadProfileData}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username?.toLowerCase() === profile.username.toLowerCase();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fromState?.from) {
      navigate(fromState.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(isOwnProfile ? "/studio" : "/feed");
    }
  };

  const backLabel = fromState?.fromLabel || (isOwnProfile ? "Studio" : "Feed");

  // Career sections definition & visibility checks
  const careerSections: Array<{
    id: CareerSectionId;
    title: string;
    count: number;
    visible: boolean;
  }> = [
    {
      id: "experience",
      title: "Experience",
      count: careerData?.experiences?.length ?? 0,
      visible: Boolean(careerData?.visibility?.experience) && (careerData?.experiences?.length ?? 0) > 0,
    },
    {
      id: "academics",
      title: "Academics",
      count: careerData?.academics?.length ?? 0,
      visible: Boolean(careerData?.visibility?.academics) && (careerData?.academics?.length ?? 0) > 0,
    },
    {
      id: "skills",
      title: "Skills",
      count: careerData?.skills?.length ?? 0,
      visible: Boolean(careerData?.visibility?.skills) && (careerData?.skills?.length ?? 0) > 0,
    },
    {
      id: "credentials",
      title: "Credentials",
      count: careerData?.credentials?.length ?? 0,
      visible: Boolean(careerData?.visibility?.credentials) && (careerData?.credentials?.length ?? 0) > 0,
    },
    {
      id: "languages",
      title: "Languages",
      count: careerData?.languages?.length ?? 0,
      visible: Boolean(careerData?.visibility?.languages) && (careerData?.languages?.length ?? 0) > 0,
    },
    {
      id: "achievements",
      title: "Achievements",
      count: careerData?.achievements?.length ?? 0,
      visible: Boolean(careerData?.visibility?.achievements) && (careerData?.achievements?.length ?? 0) > 0,
    },
  ];

  const visibleCareerSections = careerSections.filter((s) => s.visible);
  const totalCareerCount = visibleCareerSections.reduce((acc, s) => acc + s.count, 0);

  // Exactly 3 top-level navigation tabs: Works, Career, About
  const tabList: Array<{ id: ProfileTab; label: string; count?: number }> = [
    { id: "works", label: "Works", count: posts.length },
    { id: "career", label: "Career", count: totalCareerCount > 0 ? totalCareerCount : undefined },
    { id: "about", label: "About" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-[#87867f] hover:text-[#141413] transition-colors group cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </button>
      </nav>

      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onShare={handleShare} />

      {/* Top-Level Navigation Tabs (Works, Career, About) */}
      <nav
        className="flex items-center gap-6 sm:gap-8 border-b border-[#cccbc8] mb-8 overflow-x-auto no-scrollbar"
        aria-label="Profile tabs"
      >
        {tabList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "career") {
                  setSelectedCareerSection(null);
                }
              }}
              aria-selected={isActive}
              role="tab"
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-3 whitespace-nowrap transition-colors relative cursor-pointer border-b-2 flex items-center gap-2 ${
                isActive
                  ? "text-[#141413] border-[#141413]"
                  : "text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-[#141413] text-[#faf9f5]"
                      : "bg-[#f0eee6] text-[#87867f]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      {activeTab === "works" && (
        <section aria-label="Published Works">
          <PostMasonryGrid
            posts={posts}
            creator={profile}
            isOwnProfile={isOwnProfile}
            hasNextPage={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </section>
      )}

      {activeTab === "career" && (
        <div>
          {/* Default: Career Index / Directory */}
          {selectedCareerSection === null ? (
            <section aria-label="Career Index" className="max-w-4xl">
              {visibleCareerSections.length === 0 ? (
                <div className="p-8 text-center bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 text-[#87867f] font-serif">
                  No public career records added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleCareerSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedCareerSection(sec.id)}
                      className="w-full text-left p-5 sm:p-6 rounded-[20px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-all group cursor-pointer shadow-none flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 pr-2">
                        <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-[#141413]">
                          {sec.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-[#f0eee6] text-[#87867f] group-hover:text-[#141413] border border-[#cccbc8]/40 transition-colors">
                          {sec.count}
                        </span>
                        <div className="w-8 h-8 rounded-full border border-[#cccbc8]/60 flex items-center justify-center text-[#87867f] group-hover:text-[#141413] group-hover:border-[#141413] group-hover:translate-x-0.5 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* Dedicated Sub-Section View */
            <div>
              {/* Back to Career Index Navigation */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedCareerSection(null)}
                  className="inline-flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Career Index</span>
                </button>
              </div>

              {selectedCareerSection === "experience" && careerData && (
                <section aria-label="Experience" className="space-y-6 max-w-4xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Experience
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {careerData.experiences.map((exp) => (
                      <ExperienceCard key={exp.id} item={exp} />
                    ))}
                  </div>
                </section>
              )}

              {selectedCareerSection === "academics" && careerData && (
                <section aria-label="Academics" className="space-y-6 max-w-4xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Academics
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {careerData.academics.map((acad) => (
                      <AcademicCard key={acad.id} item={acad} />
                    ))}
                  </div>
                </section>
              )}

              {selectedCareerSection === "skills" && careerData && (
                <section aria-label="Skills" className="max-w-5xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Skills
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {careerData.skills.map((skill) => (
                      <SkillCard key={skill.id} item={skill} />
                    ))}
                  </div>
                </section>
              )}

              {selectedCareerSection === "credentials" && careerData && (
                <section aria-label="Credentials" className="max-w-5xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Credentials
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {careerData.credentials.map((cred) => (
                      <CredentialCard key={cred.id} item={cred} />
                    ))}
                  </div>
                </section>
              )}

              {selectedCareerSection === "languages" && careerData && (
                <section aria-label="Languages" className="max-w-3xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Languages
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {careerData.languages.map((lang) => (
                      <LanguageCard key={lang.id} item={lang} />
                    ))}
                  </div>
                </section>
              )}

              {selectedCareerSection === "achievements" && careerData && (
                <section aria-label="Achievements" className="space-y-6 max-w-4xl">
                  <div className="mb-6">
                    <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      Achievements
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {careerData.achievements.map((ach) => (
                      <AchievementCard key={ach.id} item={ach} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "about" && (
        <ProfileAboutTab
          bio={profile.bio}
          socialLinks={profile.socialLinks}
          isOwnProfile={isOwnProfile}
          creatorName={`${profile.firstName} ${profile.lastName}`.trim()}
          username={profile.username}
        />
      )}
    </div>
  );
};
