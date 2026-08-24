"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiGlobalLine,
  RiSaveLine,
  RiCheckDoubleLine,
  RiCoupon3Line,
  RiQuestionAnswerLine,
  RiContactsBookLine,
  RiAddLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiShieldLine,
  RiEditLine,
  RiExternalLinkLine,
  RiMoneyDollarCircleLine,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiDeviceLine,
  RiMacbookLine,
  RiTabletLine,
  RiSmartphoneLine,
  RiSparklingLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiGalleryLine,
  RiImageAddLine,
  RiVideoLine,
  RiRefreshLine,
  RiToggleLine,
  RiAlertLine,
  RiUserReceivedLine,
  RiLockLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";
import { useGalleryItems } from "@/lib/galleryStore";
import { GalleryModule } from "./GalleryModule";


interface SponsorItem {
  id: string;
  name: string;
  tier: string;
  logoUrl: string;
  website: string;
  amount: number;
  active: boolean;
}

interface CMSModuleProps {
  activePage?: string;
}

export function CMSModule({ activePage }: CMSModuleProps) {
  const { settings, updateSettings, sponsors: storeSponsors, updateSponsors, faqs: storeFaqs, updateFaqs } = useFestivalControl();
  const { items: galleryItems, addItem: addGalleryItem, deleteItem: deleteGalleryItem } = useGalleryItems();

  const tabRailRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "sponsors" | "gallery" | "faqs" | "contact" | "rules" | "site_controls">("hero");

  useEffect(() => {
    if (!activePage) return;
    if (activePage.endsWith(".hero")) setActiveTab("hero");
    else if (activePage.endsWith(".about")) setActiveTab("about");
    else if (activePage.endsWith(".sponsors")) setActiveTab("sponsors");
    else if (activePage.endsWith(".gallery")) setActiveTab("gallery");
    else if (activePage.endsWith(".faqs")) setActiveTab("faqs");
    else if (activePage.endsWith(".contact")) setActiveTab("contact");
    else if (activePage.endsWith(".rules")) setActiveTab("rules");
    else if (activePage.endsWith(".site_controls") || activePage.endsWith(".controls")) setActiveTab("site_controls");
    else if (activePage === "cms" || activePage === "website") setActiveTab("hero");
  }, [activePage]);

  const [statusMsg, setStatusMsg] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  const triggerSaved = (msg = "✓ Public Website Content Updated & Synchronized Live!") => {
    setStatusMsg(msg);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  // Hero States
  const [heroTitle, setHeroTitle] = useState(settings.name || "MACFIESTA 2026");
  const [heroTagline, setHeroTagline] = useState(settings.tagline || "Earth's Premier College Festival");
  const [heroMotto, setHeroMotto] = useState(settings.motto || "Legends Cup 2026");
  const [heroBannerUrl, setHeroBannerUrl] = useState(settings.homepageBanner || "");
  const [regOpen, setRegOpen] = useState(settings.registrationOpen ?? true);

  // About Section States
  const [aboutHeading, setAboutHeading] = useState("About MacFiesta");
  const [aboutBody, setAboutBody] = useState(settings.aboutText || "Earth's premier college festival hosted at MACFAST Campus.");

  // Sponsors State
  const sponsors: SponsorItem[] = storeSponsors && storeSponsors.length > 0 ? storeSponsors : [
    { id: "sp-1", name: "Red Bull", tier: "Title Sponsor", logoUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=150", website: "https://redbull.com", amount: 100000, active: true },
    { id: "sp-2", name: "Monster Energy", tier: "Platinum Partner", logoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150", website: "https://monsterenergy.com", amount: 75000, active: true },
    { id: "sp-3", name: "KFC Kerala", tier: "Gold Partner", logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150", website: "https://kfc.in", amount: 50000, active: true },
    { id: "sp-4", name: "Spotify", tier: "Audio Partner", logoUrl: "https://images.unsplash.com/photo-1614680376593-902f749f7051?w=150", website: "https://spotify.com", amount: 40000, active: true },
  ];

  // Sponsor Modal State
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<SponsorItem | null>(null);
  const [spName, setSpName] = useState("");
  const [spTier, setSpTier] = useState("Platinum Partner");
  const [spLogo, setSpLogo] = useState("");
  const [spWeb, setSpWeb] = useState("");
  const [spAmount, setSpAmount] = useState<number>(25000);

  // Gallery Add Modal
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galType, setGalType] = useState<"image" | "video">("image");
  const [galTitle, setGalTitle] = useState("");
  const [galCategory, setGalCategory] = useState<"cultural" | "gaming" | "technical" | "general" | "pro-show">("cultural");
  const [galUrl, setGalUrl] = useState("");
  const [galThumb, setGalThumb] = useState("");

  // FAQs State
  const faqs = storeFaqs && storeFaqs.length > 0 ? storeFaqs : [
    { id: "faq-1", question: "Who is eligible to participate in MacFiesta?", answer: "Any student currently enrolled in an accredited college or university with a valid ID card." },
    { id: "faq-2", question: "Is accommodation provided for outstation delegates?", answer: "Yes, hostel accommodations in Block A (Girls) and Block B/C (Boys) are available on booking." },
  ];
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Conduct Rules
  const [generalRules, setGeneralRules] = useState([
    "Delegates must carry valid college ID cards at all times.",
    "Decisions of judges and festival coordinators are final and binding.",
    "Smoking, alcohol, and contraband are strictly prohibited on campus premises.",
  ]);
  const [newRule, setNewRule] = useState("");

  // Contact States
  const [contactEmail, setContactEmail] = useState("macfiesta@macfast.org");
  const [contactPhone, setContactPhone] = useState("+91 98470 12345");
  const [contactAddress, setContactAddress] = useState("MACFAST Campus, Tiruvalla, Pathanamthitta, Kerala 689101");

  // Sponsor Handlers
  const openSponsorModal = (item?: SponsorItem) => {
    if (item) {
      setEditingSponsor(item);
      setSpName(item.name);
      setSpTier(item.tier);
      setSpLogo(item.logoUrl);
      setSpWeb(item.website);
      setSpAmount(item.amount);
    } else {
      setEditingSponsor(null);
      setSpName("");
      setSpTier("Platinum Partner");
      setSpLogo("");
      setSpWeb("");
      setSpAmount(25000);
    }
    setShowSponsorModal(true);
  };

  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spName) return;

    let updated: SponsorItem[];
    if (editingSponsor) {
      updated = sponsors.map((s) =>
        s.id === editingSponsor.id
          ? {
            ...s,
            name: spName,
            tier: spTier,
            logoUrl: spLogo || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=150",
            website: spWeb,
            amount: Number(spAmount) || 0,
          }
          : s
      );
      triggerSaved("✓ Sponsor Details Updated & Synchronized Live!");
    } else {
      const newItem: SponsorItem = {
        id: `sp-${Date.now()}`,
        name: spName,
        tier: spTier,
        logoUrl: spLogo || "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=150",
        website: spWeb,
        amount: Number(spAmount) || 0,
        active: true,
      };
      updated = [...sponsors, newItem];
      triggerSaved("✓ New Sponsor Added to Public Website!");
    }
    updateSponsors(updated as any);
    setShowSponsorModal(false);
  };

  const toggleSponsorActive = (id: string) => {
    const updated = sponsors.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    updateSponsors(updated as any);
    triggerSaved("✓ Sponsor Visibility Toggled!");
  };

  const deleteSponsor = (id: string) => {
    if (confirm("Are you sure you want to remove this sponsor?")) {
      const updated = sponsors.filter((s) => s.id !== id);
      updateSponsors(updated as any);
      triggerSaved("✓ Sponsor Removed!");
    }
  };

  // Hero Submit
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: heroTitle,
      tagline: heroTagline,
      motto: heroMotto,
    });
    triggerSaved("✓ Hero Headline & Motto Settings Updated Live!");
  };


  // About Submit
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      aboutText: aboutBody,
    });
    triggerSaved("✓ About Festival Content Updated Live!");
  };

  // FAQ Handlers
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    const updated = [...faqs, { id: `faq-${Date.now()}`, question: newQuestion, answer: newAnswer }];
    updateFaqs(updated as any);
    setNewQuestion("");
    setNewAnswer("");
    triggerSaved("✓ New FAQ Published Live!");
  };

  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter((f: any) => f.id !== id);
    updateFaqs(updated as any);
    triggerSaved("✓ FAQ Removed!");
  };

  // Gallery Add Handler
  const handleAddGalleryMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle || !galUrl) return;

    addGalleryItem({
      type: galType,
      title: galTitle,
      category: galCategory,
      url: galUrl,
      thumbnailUrl: galThumb || (galType === "image" ? galUrl : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800"),
      featured: true,
    });

    triggerSaved(`✓ New ${galType === "image" ? "Photo" : "Video"} Added to Live Gallery!`);
    setGalTitle("");
    setGalUrl("");
    setGalThumb("");
    setShowGalleryModal(false);
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
          <RiCheckDoubleLine className="text-base" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* HEADER BANNER WITH STARK HUD Telemetry & Live Preview Launcher */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0D1A] shadow-[0_0_40px_rgba(0,212,255,0.15)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marvel-red/10 border border-marvel-red/30 text-marvel-red text-[10px] font-bold uppercase tracking-widest">
            <RiSparklingLine className="animate-spin-slow" />
            <span>REAL-TIME VISUAL CMS & PUBLIC WEBSITE STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Website CMS <span className="marvel-bang-comic-gradient font-black">& Visual Editor</span>
          </h2>
          <p className="text-xs text-white/50">
            Edit Hero Copy, Videos, Sponsors, FAQs, Photo/Video Gallery & Contact Details with instant live sync.
          </p>
        </div>

        {/* Live Multi-Device Preview Launcher Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-5 py-3 rounded-xl bg-arc-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_#00D4FF]"
          >
            <RiDeviceLine className="text-lg animate-pulse" />
            <span>Launch Live Preview</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE TAB NAVIGATION RAIL WITH ARROWS */}
      <div className="relative flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 group">
        <button
          onClick={() => tabRailRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-white/5 hover:bg-marvel-red text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Left"
        >
          <RiArrowLeftSLine size={18} />
        </button>

        <div
          ref={tabRailRef}
          className="flex-1 flex overflow-x-auto scrollbar-none gap-1 px-2 scroll-smooth"
        >
          {[
            { id: "hero" as const, label: "Homepage Hero & Video", icon: RiGlobalLine },
            { id: "about" as const, label: "About Festival & Mission", icon: RiFileTextLine },
            { id: "sponsors" as const, label: `Sponsors & Partners (${sponsors.length})`, icon: RiCoupon3Line },
            { id: "gallery" as const, label: `Photo & Video Gallery (${galleryItems.length})`, icon: RiGalleryLine },
            { id: "faqs" as const, label: `FAQ Manager (${faqs.length})`, icon: RiQuestionAnswerLine },
            { id: "contact" as const, label: "Footer & Contact Info", icon: RiContactsBookLine },
            { id: "rules" as const, label: "Conduct Rules", icon: RiShieldLine },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${isActive
                    ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => tabRailRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-white/5 hover:bg-marvel-red text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Right"
        >
          <RiArrowRightSLine size={18} />
        </button>
      </div>

      {/* 1. HOMEPAGE HERO & BANNER TAB */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveHero} className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] text-arc-cyan font-bold uppercase tracking-wider block">CMS TAB 1</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Homepage Hero Headline & Copy Settings
              </h3>
            </div>

            <button type="submit" className="px-5 py-2.5 rounded-xl bg-arc-cyan text-black text-xs font-bold uppercase hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_#00D4FF] flex items-center gap-1.5">
              <RiSaveLine className="text-base" />
              <span>Save Hero Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-white/70 font-bold mb-1">Festival Main Name / Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-bold focus:border-arc-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Festival Tagline Headline</label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-bold focus:border-arc-cyan focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/70 font-bold mb-1">Subtitle Motto (e.g. Legends Cup 2026)</label>
              <input
                type="text"
                value={heroMotto}
                onChange={(e) => setHeroMotto(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-bold focus:border-arc-cyan focus:outline-none"
              />
            </div>
          </div>
        </form>

      )}

      {/* 2. ABOUT FESTIVAL & MISSION TAB */}
      {activeTab === "about" && (
        <form onSubmit={handleSaveAbout} className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] text-metallic-gold font-bold uppercase tracking-wider block">CMS TAB 2</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                About Festival History, Vision & Mission Copy
              </h3>
            </div>

            <button type="submit" className="px-5 py-2.5 rounded-xl bg-metallic-gold text-black text-xs font-bold uppercase hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_#FFD700] flex items-center gap-1.5">
              <RiSaveLine className="text-base" />
              <span>Save About Section</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-white/70 font-bold mb-1">Section Heading Title</label>
              <input
                type="text"
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-bold focus:border-metallic-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">About Festival Body Description Text</label>
              <textarea
                rows={6}
                value={aboutBody}
                onChange={(e) => setAboutBody(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* 3. SPONSORS & BRAND PARTNERS TAB */}
      {activeTab === "sponsors" && (
        <div className="space-y-6">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-marvel-red font-bold uppercase tracking-wider block">CMS TAB 3</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Official Festival Sponsors & Brand Partners
                </h3>
              </div>

              <button
                onClick={() => openSponsorModal()}
                className="px-5 py-2.5 rounded-xl bg-marvel-red text-white text-xs font-bold uppercase hover:bg-white hover:text-black transition-all cursor-pointer shadow-[0_0_15px_#ED1D24] flex items-center gap-1.5"
              >
                <RiAddLine className="text-base" />
                <span>+ Add Sponsor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${sp.active ? "bg-black/60 border-white/10 hover:border-marvel-red" : "bg-black/20 border-white/5 opacity-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-marvel-red/20 text-marvel-red border border-marvel-red/40">
                      {sp.tier}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSponsorActive(sp.id)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                        title={sp.active ? "Hide on website" : "Show on website"}
                      >
                        {sp.active ? <RiEyeLine size={15} /> : <RiEyeOffLine size={15} />}
                      </button>
                      <button
                        onClick={() => openSponsorModal(sp)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                        title="Edit Sponsor"
                      >
                        <RiEditLine size={15} />
                      </button>
                      <button
                        onClick={() => deleteSponsor(sp.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete Sponsor"
                      >
                        <RiDeleteBinLine size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{sp.name}</h4>
                    <p className="text-[10px] text-white/50 truncate">{sp.website}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-white/40 font-bold uppercase">Contribution</span>
                    <span className="font-bold text-emerald-400">₹{sp.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. PHOTO & VIDEO GALLERY TAB */}
      {activeTab === "gallery" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A]">
          <GalleryModule />
        </div>
      )}


      {/* 5. FAQ MANAGER TAB */}
      {activeTab === "faqs" && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] text-metallic-gold font-bold uppercase tracking-wider block">CMS TAB 5</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Frequently Asked Questions (FAQ) Manager
              </h3>
            </div>
          </div>

          {/* Add FAQ Form */}
          <form onSubmit={handleAddFaq} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase">Add New FAQ Entry</h4>
            <div>
              <label className="block text-white/70 font-bold mb-1">Question</label>
              <input
                type="text"
                placeholder="e.g. Is accommodation included?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/70 font-bold mb-1">Answer</label>
              <textarea
                rows={2}
                placeholder="e.g. Yes, hostel accommodation is provided..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-metallic-gold text-black font-bold uppercase hover:bg-white transition-colors cursor-pointer">
              + Publish FAQ
            </button>
          </form>

          {/* FAQs List */}
          <div className="space-y-3">
            {faqs.map((faq: any) => (
              <div key={faq.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{faq.question}</h4>
                  <button onClick={() => handleDeleteFaq(faq.id)} className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer">
                    <RiDeleteBinLine size={14} />
                  </button>
                </div>
                <p className="text-xs text-white/60">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FOOTER & CONTACT INFO TAB */}
      {activeTab === "contact" && (
        <form onSubmit={(e) => { e.preventDefault(); triggerSaved("✓ Contact & Footer Info Updated!"); }} className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] text-arc-cyan font-bold uppercase tracking-wider block">CMS TAB 6</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Public Footer & Official Contact Info
              </h3>
            </div>

            <button type="submit" className="px-5 py-2.5 rounded-xl bg-arc-cyan text-black text-xs font-bold uppercase hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_#00D4FF] flex items-center gap-1.5">
              <RiSaveLine className="text-base" />
              <span>Save Contact Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-white/70 font-bold mb-1">Official Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-arc-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Support Hotline Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-arc-cyan focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/70 font-bold mb-1">Campus Venue Address</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-arc-cyan focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}


      {/* SITE CONTROLS TAB */}
      {activeTab === "site_controls" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A] space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">CMS SITE CONTROLS</span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Registration & Maintenance Mode Controls
            </h3>
            <p className="text-xs text-white/40">
              Toggle registration open/closed and enable maintenance mode. Changes take effect instantly site-wide.
            </p>
          </div>

          {/* Toggle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Registration Toggle Card */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-8 space-y-6 transition-all duration-500 ${
                settings.registrationOpen
                  ? "bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                  : "bg-rose-950/30 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.08)]"
              }`}
            >
              {/* Background glow accent */}
              <div className={`absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500 ${
                settings.registrationOpen ? "opacity-100" : "opacity-0"
              } bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_60%)]`} />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    settings.registrationOpen
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      settings.registrationOpen ? "bg-emerald-400" : "bg-rose-400"
                    }`} />
                    {settings.registrationOpen ? "Registrations Open" : "Registrations Closed"}
                  </div>
                  <h4 className="text-lg font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Participant Registration
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {settings.registrationOpen
                      ? "Registration portal is live. Students can sign up for events and purchase passes."
                      : "Registration portal is closed. All registration forms and sign-up buttons are disabled site-wide."}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  settings.registrationOpen
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                }`}>
                  <RiUserReceivedLine size={28} />
                </div>
              </div>

              {/* Big Toggle Switch */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white/70">
                    {settings.registrationOpen ? "Click to CLOSE registrations" : "Click to OPEN registrations"}
                  </p>
                  <p className="text-[10px] text-white/30 font-mono">Instantly updates across all pages</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ registrationOpen: !settings.registrationOpen });
                    triggerSaved(
                      settings.registrationOpen
                        ? "✓ Registrations are now CLOSED site-wide!"
                        : "✓ Registrations are now OPEN site-wide!"
                    );
                  }}
                  className={`relative w-16 h-8 rounded-full transition-all duration-400 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                    settings.registrationOpen
                      ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/40"
                      : "bg-white/10 border-white/20 shadow-black/20"
                  }`}
                  title={settings.registrationOpen ? "Close Registrations" : "Open Registrations"}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    settings.registrationOpen ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>

            {/* Maintenance Mode Toggle Card */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-8 space-y-6 transition-all duration-500 ${
                settings.maintenanceMode
                  ? "bg-amber-950/40 border-amber-500/40 shadow-[0_0_40px_rgba(245,179,1,0.15)]"
                  : "bg-zinc-900/40 border-white/10"
              }`}
            >
              {/* Background glow accent */}
              <div className={`absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500 ${
                settings.maintenanceMode ? "opacity-100" : "opacity-0"
              } bg-[radial-gradient(circle_at_top_right,rgba(245,179,1,0.12),transparent_60%)]`} />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    settings.maintenanceMode
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                      : "bg-white/5 text-zinc-400 border-white/10"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      settings.maintenanceMode ? "bg-amber-400 animate-ping" : "bg-zinc-500"
                    }`} />
                    {settings.maintenanceMode ? "Maintenance ACTIVE" : "Site Online"}
                  </div>
                  <h4 className="text-lg font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Maintenance Mode
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {settings.maintenanceMode
                      ? "Maintenance mode is ACTIVE. All public pages show the Spider-Man maintenance screen. Only admins can access the site."
                      : "Site is fully online and accessible to all visitors. Enable maintenance mode for upgrades or emergency downtime."}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  settings.maintenanceMode
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(245,179,1,0.3)]"
                    : "bg-white/5 text-zinc-500 border border-white/10"
                }`}>
                  <RiAlertLine size={28} className={settings.maintenanceMode ? "animate-pulse" : ""} />
                </div>
              </div>

              {/* Big Toggle Switch */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white/70">
                    {settings.maintenanceMode ? "Click to bring site BACK ONLINE" : "Click to enable MAINTENANCE MODE"}
                  </p>
                  <p className="text-[10px] text-white/30 font-mono">Shows Spider-Man maintenance page to all visitors</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ maintenanceMode: !settings.maintenanceMode });
                    triggerSaved(
                      settings.maintenanceMode
                        ? "✓ Site is now LIVE and fully online!"
                        : "⚠️ MAINTENANCE MODE enabled — site is now offline to public!"
                    );
                  }}
                  className={`relative w-16 h-8 rounded-full transition-all duration-400 cursor-pointer border-2 shadow-lg flex-shrink-0 ${
                    settings.maintenanceMode
                      ? "bg-amber-500 border-amber-400 shadow-amber-500/40"
                      : "bg-white/10 border-white/20"
                  }`}
                  title={settings.maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    settings.maintenanceMode ? "left-[calc(100%-1.75rem)]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Status Summary Card */}
          <div className="glass p-6 rounded-2xl border border-white/10 bg-[#0A0D1A]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <RiCheckboxCircleLine className="text-arc-cyan" /> Current Site Status Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className={`p-4 rounded-2xl border ${
                settings.registrationOpen ? "bg-emerald-950/30 border-emerald-500/20" : "bg-rose-950/20 border-rose-500/15"
              }`}>
                <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Registration Status</p>
                <p className={`font-black text-sm ${
                  settings.registrationOpen ? "text-emerald-400" : "text-rose-400"
                }`}>{settings.registrationOpen ? "✓ OPEN" : "✗ CLOSED"}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${
                settings.maintenanceMode ? "bg-amber-950/30 border-amber-500/20" : "bg-zinc-900/30 border-white/5"
              }`}>
                <p className="text-zinc-400 uppercase font-bold text-[10px] mb-1">Maintenance Mode</p>
                <p className={`font-black text-sm ${
                  settings.maintenanceMode ? "text-amber-400" : "text-zinc-400"
                }`}>{settings.maintenanceMode ? "⚠ ACTIVE" : "● OFFLINE"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SPONSOR MODAL */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-6 rounded-3xl border border-marvel-red/40 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{editingSponsor ? "Edit Sponsor" : "Add Sponsor"}</h3>
              <button onClick={() => setShowSponsorModal(false)} className="p-1 text-white/40 hover:text-white cursor-pointer">
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Sponsor Company Name</label>
                <input
                  type="text"
                  value={spName}
                  onChange={(e) => setSpName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-marvel-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Tier Level</label>
                <select
                  value={spTier}
                  onChange={(e) => setSpTier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-marvel-red focus:outline-none"
                >
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="Platinum Partner">Platinum Partner</option>
                  <option value="Gold Partner">Gold Partner</option>
                  <option value="Silver Partner">Silver Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Website Link</label>
                <input
                  type="url"
                  value={spWeb}
                  onChange={(e) => setSpWeb(e.target.value)}
                  placeholder="https://sponsor.com"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-marvel-red focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowSponsorModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-marvel-red text-white font-bold uppercase cursor-pointer shadow-[0_0_15px_#ED1D24]">
                  Save Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GALLERY MEDIA MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">Add Media Asset to Gallery</h3>
              <button onClick={() => setShowGalleryModal(false)} className="p-1 text-white/40 hover:text-white cursor-pointer">
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGalleryMedia} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGalType("image")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase border ${galType === "image" ? "bg-arc-cyan text-black border-arc-cyan" : "bg-black/60 text-white/60 border-white/10"}`}
                  >
                    📷 Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalType("video")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase border ${galType === "video" ? "bg-marvel-red text-white border-marvel-red" : "bg-black/60 text-white/60 border-white/10"}`}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Direct URL (Image or MP4 Video)</label>
                <input
                  type="text"
                  value={galUrl}
                  onChange={(e) => setGalUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-arc-cyan text-black font-bold uppercase cursor-pointer shadow-[0_0_15px_#00D4FF]">
                  Publish Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-DEVICE LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#09090b] border border-white/20 rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-black/80">
              <div className="flex items-center gap-2">
                <RiSparklingLine className="text-arc-cyan animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  MacFiesta Public Website Live Preview
                </h3>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {[
                  { id: "desktop" as const, icon: RiMacbookLine, label: "Desktop" },
                  { id: "tablet" as const, icon: RiTabletLine, label: "Tablet" },
                  { id: "mobile" as const, icon: RiSmartphoneLine, label: "Mobile" },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setPreviewDevice(d.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${previewDevice === d.id ? "bg-arc-cyan text-black shadow-[0_0_10px_#00D4FF]" : "text-white/50 hover:text-white"
                        }`}
                    >
                      <Icon size={14} />
                      <span>{d.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-2"
                  title="Refresh Live Frame"
                >
                  <RiRefreshLine size={14} />
                </button>
              </div>

              <button onClick={() => setShowPreviewModal(false)} className="p-1.5 text-white/50 hover:text-white cursor-pointer">
                <RiCloseLine size={22} />
              </button>
            </div>

            {/* Frame Viewport Container */}
            <div className="flex-1 bg-black/90 p-4 flex items-center justify-center overflow-hidden relative">
              <div
                className={`bg-[#05050A] border-2 border-arc-cyan/40 rounded-2xl shadow-[0_0_50px_rgba(0,212,255,0.25)] overflow-hidden transition-all duration-300 relative ${previewDevice === "desktop"
                    ? "w-full h-full"
                    : previewDevice === "tablet"
                      ? "w-[768px] h-[95%]"
                      : "w-[375px] h-[95%]"
                  }`}
              >
                <iframe
                  key={iframeKey}
                  src="/"
                  className="w-full h-full border-0 bg-[#05050A]"
                  title="MacFiesta Live Website Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
