import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Download,
  Globe,
  GraduationCap,
  Layers3,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  FolderKanban,
  Mail,
  GripVertical,
  PanelBottom
} from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioContext';
import { signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20';
const textareaClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20 resize-vertical font-mono';
const textareaSmallClass = textareaClass;

const cloneData = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const splitLines = (value: string): string[] => {
  if (!value || typeof value !== 'string') return [];
  const lines = value.split('\n');
  return lines.map((line) => line.trim()).filter((line) => line.length > 0);
};
const joinLines = (items: string[] | undefined | null): string => {
  if (!items || !Array.isArray(items)) return '';
  return items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .join('\n');
};
const nextId = (ids: number[]) => (ids.length ? Math.max(...ids) + 1 : 1);

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });

// Compress image file using canvas; returns dataUrl and byte size
const compressImageFile = async (fileOrDataUrl: File | string, maxWidth = 1200, quality = 0.7, outputType = 'image/webp') => {
  const imgDataUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await toDataUrl(fileOrDataUrl);

  await new Promise<void>((res) => setTimeout(res, 0));

  return await new Promise<{ dataUrl: string; bytes: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = String(reader.result);
              const bytes = blob.size;
              resolve({ dataUrl, bytes });
            };
            reader.onerror = () => reject(new Error('Failed to read compressed blob'));
            reader.readAsDataURL(blob);
          },
          outputType,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imgDataUrl;
  });
};

// Progressive compression: try multiple qualities and sizes until under maxBytes
const compressUntilBelow = async (file: File, maxBytes: number) => {
  const qualitySteps = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
  const widthSteps = [1600, 1200, 1000, 800, 600, 400];

  for (const width of widthSteps) {
    for (const quality of qualitySteps) {
      try {
        const { dataUrl, bytes } = await compressImageFile(file, width, quality, 'image/webp');
        if (bytes <= maxBytes) return { dataUrl, bytes };
      } catch {
        // ignore and continue
      }
    }
  }

  // Final attempt: aggressive small size
  const { dataUrl, bytes } = await compressImageFile(file, 300, 0.25, 'image/webp');
  if (bytes <= maxBytes) return { dataUrl, bytes };
  return { dataUrl, bytes };
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
};

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  onSizeChange?: (dataUrl: string, bytes: number) => void;
  sizeBytes?: number | undefined;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 4,
  hint
}) => (
  <label className="block space-y-2">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
    {multiline ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={textareaClass}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    )}
  </label>
);

  const ImageField: React.FC<ImageFieldProps> = ({ label, value, onChange, placeholder, hint }) => (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <Field label={label} value={value} onChange={onChange} placeholder={placeholder} hint={hint} />
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20">
        <Upload size={16} />
        Upload Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            try {
              // Auto-compress progressively until image is small enough
              const MAX_IMAGE_BYTES = 250 * 1024; // 250 KB recommended max per image
              let compressed;
              try {
                compressed = await compressUntilBelow(file, MAX_IMAGE_BYTES);
              } catch (err) {
                console.warn('Compression error', err);
              }

              if (!compressed || compressed.bytes > MAX_IMAGE_BYTES) {
                // If we couldn't get it below the threshold, still offer the best-effort compressed result if available
                if (compressed) {
                  console.warn('Could not reach target size; using best-effort compressed image', { bytes: compressed.bytes });
                  window.alert(`Image compressed to ${Math.round(compressed.bytes / 1024)} KB which may still be large. Saving could exceed Firestore limits.`);
                  onChange(compressed.dataUrl);
                  onSizeChange?.(compressed.dataUrl, compressed.bytes);
                  console.log('✅ Certificate image uploaded (best-effort compressed):', file.name, { bytes: compressed.bytes });
                } else {
                  window.alert('Could not compress the image. Please choose a smaller image or host it externally.');
                }
                return;
              }

              onChange(compressed.dataUrl);
              onSizeChange?.(compressed.dataUrl, compressed.bytes);
              console.log('✅ Certificate image uploaded (auto-compressed):', file.name, { bytes: compressed.bytes });
              window.alert(`✅ Certificate image "${file.name}" uploaded (auto-compressed to ${Math.round(compressed.bytes / 1024)} KB). Click Save Changes to publish it.`);
            } catch (err) {
              console.error('❌ Certificate image upload failed:', err);
              window.alert(`❌ Failed to upload certificate image: ${err instanceof Error ? err.message : 'unknown error'}`);
            }
          }}
        />
      </label>
      {value ? (
        <div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/50">
            <img src={value} alt={label} className="w-full h-auto object-contain max-h-72" />
          </div>
          {typeof sizeBytes === 'number' ? (
            <p className="mt-2 text-xs text-slate-400">Compressed: {Math.round(sizeBytes / 1024)} KB</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

const SectionCard: React.FC<{ id: string; icon: React.ReactNode; title: string; description: string; children: React.ReactNode }> = ({
  id,
  icon,
  title,
  description,
  children
}) => (
  <section id={id} className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sky-300">{icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
    {children}
  </section>
);

const AdminPanel: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { data, setData, resetData } = usePortfolioData();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => cloneData(data));
  const [imageSizes, setImageSizes] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState('Edit your content, then press Save Changes.');
  const [newProjectSection, setNewProjectSection] = useState('');
  // Store raw textarea values for list-type fields to preserve newlines during editing
  const [rolesText, setRolesText] = useState(() => joinLines(data.personal.roles));
  const [softSkillsText, setSoftSkillsText] = useState(() => joinLines(data.softSkills));
  // Tech stack skills text: stored by category name
  const techStackSkillsText = useRef<Record<string, string>>({});
  // Experience highlights: stored by experience id
  const experienceHighlightsText = useRef<Record<number, string>>({});
  // Project tech stack: stored by project id
  const projectTechStackText = useRef<Record<number, string>>({});

  React.useEffect(() => {
    setDraft(cloneData(data));
    setRolesText(joinLines(data.personal.roles));
    setSoftSkillsText(joinLines(data.softSkills));
    // Initialize refs for lists
    techStackSkillsText.current = {};
    experienceHighlightsText.current = {};
    projectTechStackText.current = {};
    data.experience.forEach((exp) => {
      experienceHighlightsText.current[exp.id] = joinLines(exp.highlights);
    });
    data.projects.forEach((proj) => {
      projectTechStackText.current[proj.id] = joinLines(proj.techStack);
    });
    Object.entries(data.techStack).forEach(([category, items]) => {
      techStackSkillsText.current[category] = joinLines(items);
    });
  }, [data]);

  // Keep image size map in sync when an image URL is removed
  React.useEffect(() => {
    // remove any keys that no longer exist in draft.certifications
    const urls = new Set(draft.certifications.map((c) => c.imageUrl).filter(Boolean));
    setImageSizes((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (urls.has(k)) next[k] = v;
      }
      return next;
    });
  }, [draft.certifications]);

  const update = (mutator: (draft: typeof data) => void) => {
    setDraft((current) => {
      const next = cloneData(current);
      mutator(next);

      // Keep section options in sync with categories used by projects.
      const usedCategories = next.projects.map((project) => (project.category || '').trim()).filter(Boolean);
      next.projectSections = Array.from(new Set([...(next.projectSections || []), ...usedCategories].map((section) => String(section).trim()).filter(Boolean)));

      return next;
    });
    setNotice('You have unsaved changes.');
    try {
      window.localStorage.setItem('PORTFOLIO_HAS_UNSAVED_CHANGES', '1');
    } catch (e) {
      // non-fatal: localStorage may be unavailable in some environments
      console.warn('Could not set unsaved flag in localStorage', e);
    }
  };

  const saveChanges = () => {
    setData(cloneData(draft));
    setNotice('Changes saved. Refresh the public site if it is open in another tab.');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'portfolio-data.json';
    anchor.click();
    window.URL.revokeObjectURL(url);
    setNotice('Exported your current portfolio data.');
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      setData(cloneData(parsed));
      setNotice('Imported data successfully.');
    } catch {
      setNotice('That file could not be imported. Please use a valid JSON export.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Portfolio Content Manager</h1>
            <p className="text-sm text-slate-400">Edit everything in one place. Save Changes applies your edits to the public site.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Back to Site
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  if (isFirebaseConfigured && auth) {
                    await signOut(auth);
                    setNotice('Signed out.');
                    window.location.assign('/admin');
                  } else {
                    setNotice('Firebase not configured.');
                  }
                } catch (err) {
                  console.error('Sign out failed', err);
                  setNotice('Sign out failed.');
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={triggerImport}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Upload size={16} />
              Import JSON
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25"
            >
              <Sparkles size={16} />
              Save Changes
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/25"
            >
              <Download size={16} />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all portfolio content to the default values?')) {
                  resetData();
                  setNotice('Restored the default portfolio content.');
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-sm font-medium text-sky-200">{notice}</p>
            </div>

            <nav className="space-y-2 text-sm">
              {[
                ['personal', 'Personal', UserRound],
                ['social', 'Social', Globe],
                ['contact-settings', 'Contact', Mail],
                ['tech-stack', 'Tech Stack', Layers3],
                ['experience', 'Experience', Briefcase],
                ['education', 'Education', GraduationCap],
                ['soft-skills', 'Soft Skills', Sparkles],
                ['certifications', 'Certifications', BadgeCheck],
                ['projects', 'Projects', FolderKanban],
                ['footer', 'Footer', PanelBottom]
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="space-y-6">
          <SectionCard
            id="personal"
            icon={<UserRound size={20} />}
            title="Personal Details"
            description="These details power the hero section, intro text, and email actions."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" value={draft.personal.name} onChange={(value) => update((draft) => { draft.personal.name = value; })} />
              <Field label="Email" value={draft.personal.email} onChange={(value) => update((draft) => { draft.personal.email = value; })} type="email" />
              <Field label="Location" value={draft.personal.location} onChange={(value) => update((draft) => { draft.personal.location = value; })} />
              <Field label="Subtitle" value={draft.personal.subtitle} onChange={(value) => update((draft) => { draft.personal.subtitle = value; })} />
              <Field label="Tagline" value={draft.personal.tagline || ''} onChange={(value) => update((draft) => { draft.personal.tagline = value; })} placeholder="Short hero line (optional)" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Bio"
                value={draft.personal.bio}
                onChange={(value) => update((draft) => { draft.personal.bio = value; })}
                multiline
                rows={5}
              />
              <Field
                label="Roles"
                value={rolesText}
                onChange={(value) => {
                  setRolesText(value);
                  update((draft) => { draft.personal.roles = splitLines(value); });
                }}
                multiline
                rows={5}
                hint="One role per line"
              />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Resume File</p>
                  <p className="text-xs text-slate-400">Upload PDF/DOC/DOCX. This file is downloaded when users click Download Resume.</p>
                  {draft.personal.resumeFileName ? (
                    <p className="mt-1 text-xs text-emerald-300">Attached: {draft.personal.resumeFileName}</p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-300">No resume uploaded yet.</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20">
                    <Upload size={16} />
                    Upload Resume
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (!file) return;

                        try {
                          const dataUrl = await toDataUrl(file);
                          update((draft) => {
                            draft.personal.resumeFileName = file.name;
                            draft.personal.resumeFileDataUrl = dataUrl;
                          });
                          window.alert(`✅ Resume "${file.name}" uploaded successfully. Click Save Changes to publish it.`);
                        } catch (error) {
                          console.error('Resume upload failed:', error);
                          window.alert(`❌ Failed to upload resume: ${error instanceof Error ? error.message : 'unknown error'}`);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => update((draft) => {
                      draft.personal.resumeFileName = '';
                      draft.personal.resumeFileDataUrl = '';
                    })}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <Trash2 size={16} />
                    Remove Resume
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="social"
            icon={<Globe size={20} />}
            title="Social Links"
            description="These buttons are shown in the hero and contact sections. Leave a field blank to hide it."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="GitHub" value={draft.social.github} onChange={(value) => update((draft) => { draft.social.github = value; })} placeholder="https://github.com/..." />
              <Field label="LinkedIn" value={draft.social.linkedin} onChange={(value) => update((draft) => { draft.social.linkedin = value; })} placeholder="https://www.linkedin.com/in/..." />
              <Field label="Instagram" value={draft.social.instagram} onChange={(value) => update((draft) => { draft.social.instagram = value; })} placeholder="https://instagram.com/..." />
              <Field label="Twitter / X" value={draft.social.twitter} onChange={(value) => update((draft) => { draft.social.twitter = value; })} placeholder="https://x.com/..." />
            </div>
          </SectionCard>

          <SectionCard
            id="contact-settings"
            icon={<Mail size={20} />}
            title="Contact Settings"
            description="Control where contact form messages are delivered and which sender settings are used."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Display Email"
                value={draft.personal.email}
                onChange={(value) => update((draft) => {
                  draft.personal.email = value;
                })}
                type="email"
                hint="Shown in contact info"
              />
              <Field
                label="Display Location"
                value={draft.personal.location}
                onChange={(value) => update((draft) => {
                  draft.personal.location = value;
                })}
                hint="Shown in contact info"
              />
              <Field
                label="Recipient Email"
                value={draft.contact.recipientEmail}
                onChange={(value) => update((draft) => {
                  draft.contact.recipientEmail = value;
                })}
                type="email"
                hint="All contact form messages go here"
              />
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                Configure EmailJS below once, then Save Changes. After that, Send Message will submit directly without opening Gmail.
              </div>
              <Field
                label="EmailJS Service ID"
                value={draft.contact.emailjsServiceId}
                onChange={(value) => update((draft) => {
                  draft.contact.emailjsServiceId = value;
                })}
                placeholder="service_xxxxxxx"
              />
              <Field
                label="EmailJS Template ID"
                value={draft.contact.emailjsTemplateId}
                onChange={(value) => update((draft) => {
                  draft.contact.emailjsTemplateId = value;
                })}
                placeholder="template_xxxxxxx"
              />
              <div className="md:col-span-2">
                <Field
                  label="EmailJS Public Key"
                  value={draft.contact.emailjsPublicKey}
                  onChange={(value) => update((draft) => {
                    draft.contact.emailjsPublicKey = value;
                  })}
                  placeholder="xxxxxxxxxxxxxxxx"
                />
              </div>
              <div className="md:col-span-2">
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm font-medium text-slate-200">Contact Items (Let's Connect)</p>
                  <p className="mt-1 text-xs text-slate-400">These items appear in the contact panel. Add label and value for each (e.g., Email, Location).</p>
                  <div className="mt-3 space-y-3">
                    {(draft.contactInfo || []).map((item, idx) => (
                      <div key={`contact-${idx}`} className="grid gap-2 md:grid-cols-[1fr_auto]">
                        <div className="grid gap-2 md:grid-cols-2">
                          <Field label="Label" value={item.label} onChange={(value) => update((draft) => {
                            draft.contactInfo = (draft.contactInfo || []).map((it, i) => i === idx ? { ...it, label: value } : it);
                          })} />
                          <Field label="Value" value={item.value} onChange={(value) => update((draft) => {
                            draft.contactInfo = (draft.contactInfo || []).map((it, i) => i === idx ? { ...it, value } : it);
                          })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => update((draft) => { draft.contactInfo = (draft.contactInfo || []).filter((_, i) => i !== idx); })} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20">
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" onClick={() => update((draft) => {
                        draft.contactInfo = [ ...(draft.contactInfo || []), { label: 'New', value: '' } ];
                      })} className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20">
                        <Plus size={16} />
                        Add Contact Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="tech-stack"
            icon={<Layers3 size={20} />}
            title="Tech Stack"
            description="Edit categories and the skills inside each category. Reorder by dragging or using arrow buttons."
          >
            <div className="space-y-4">
              {(draft.techStackOrder || []).map((category, index) => {
                const technologies = draft.techStack[category];
                if (!technologies) return null;
                return (
                  <div key={`tech-stack-${category}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <GripVertical size={18} className="text-slate-500" />
                      <div className="flex-1 flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-300 flex-1">{category}</p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => update((draft) => {
                              const order = [...(draft.techStackOrder || [])];
                              if (index > 0) {
                                [order[index], order[index - 1]] = [order[index - 1], order[index]];
                                draft.techStackOrder = order;
                              }
                            })}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={index === (draft.techStackOrder?.length || 0) - 1}
                            onClick={() => update((draft) => {
                              const order = [...(draft.techStackOrder || [])];
                              if (index < order.length - 1) {
                                [order[index], order[index + 1]] = [order[index + 1], order[index]];
                                draft.techStackOrder = order;
                              }
                            })}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => update((draft) => {
                          delete draft.techStack[category];
                          draft.techStackOrder = (draft.techStackOrder || []).filter(cat => cat !== category);
                        })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                    <div>
                      <Field
                        label="Skills"
                        value={techStackSkillsText.current[category] || joinLines(technologies)}
                        onChange={(value) => {
                          techStackSkillsText.current[category] = value;
                          update((draft) => { draft.techStack[category] = splitLines(value); });
                        }}
                        multiline
                        rows={4}
                        hint="One skill per line"
                      />
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => update((draft) => {
                  const baseName = 'New Category';
                  let candidate = baseName;
                  let idx = 1;
                  while (candidate in draft.techStack) {
                    candidate = `${baseName} ${idx++}`;
                  }
                  draft.techStack[candidate] = [''];
                  draft.techStackOrder = [...(draft.techStackOrder || []), candidate];
                })}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
          </SectionCard>

          <SectionCard
            id="experience"
            icon={<Briefcase size={20} />}
            title="Experience"
            description="Add or edit your work history cards. Highlights are written one line at a time."
          >
            <div className="space-y-4">
              {draft.experience.map((experience, index) => (
                <div key={experience.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-300">Entry {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => update((draft) => {
                        draft.experience = draft.experience.filter((item) => item.id !== experience.id);
                      })}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Position" value={experience.position} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, position: value } : item); })} />
                    <Field label="Company" value={experience.company} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, company: value } : item); })} />
                    <Field label="Duration" value={experience.duration} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, duration: value } : item); })} />
                    <Field label="Location" value={experience.location || ''} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, location: value } : item); })} />
                    <Field label="Mentor" value={experience.mentor || ''} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, mentor: value } : item); })} />
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Description" value={experience.description} onChange={(value) => update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, description: value } : item); })} multiline rows={4} />
                    <Field label="Highlights" value={experienceHighlightsText.current[experience.id] || joinLines(experience.highlights)} onChange={(value) => {
                      experienceHighlightsText.current[experience.id] = value;
                      update((draft) => { draft.experience = draft.experience.map((item) => item.id === experience.id ? { ...item, highlights: splitLines(value) } : item); });
                    }} multiline rows={4} hint="One highlight per line" />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update((draft) => {
                  draft.experience = [
                    ...draft.experience,
                    {
                      id: nextId(draft.experience.map((item) => item.id)),
                      company: '',
                      position: '',
                      duration: '',
                      mentor: '',
                      location: '',
                      description: '',
                      highlights: ['']
                    }
                  ];
                })}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              >
                <Plus size={16} />
                Add Experience
              </button>
            </div>
          </SectionCard>

          <SectionCard
            id="education"
            icon={<GraduationCap size={20} />}
            title="Education"
            description="Add one or more education entries. The public site stays centered for a single entry and switches to a timeline when you add more."
          >
            <div className="space-y-4">
              {draft.education.map((education, index) => (
                <div key={education.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-300">Education Entry {index + 1}</p>
                    {draft.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => update((draft) => {
                          draft.education = draft.education.filter((item) => item.id !== education.id);
                        })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Degree" value={education.degree} onChange={(value) => update((draft) => { draft.education = draft.education.map((item) => item.id === education.id ? { ...item, degree: value } : item); })} />
                    <Field label="Specialization" value={education.specialization} onChange={(value) => update((draft) => { draft.education = draft.education.map((item) => item.id === education.id ? { ...item, specialization: value } : item); })} />
                    <Field label="Institution" value={education.institution} onChange={(value) => update((draft) => { draft.education = draft.education.map((item) => item.id === education.id ? { ...item, institution: value } : item); })} />
                    <Field label="Focus" value={education.focus} onChange={(value) => update((draft) => { draft.education = draft.education.map((item) => item.id === education.id ? { ...item, focus: value } : item); })} multiline rows={4} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update((draft) => {
                  draft.education = [
                    ...draft.education,
                    {
                      id: nextId(draft.education.map((item) => item.id)),
                      degree: '',
                      specialization: '',
                      institution: '',
                      focus: ''
                    }
                  ];
                })}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              >
                <Plus size={16} />
                Add Education
              </button>
            </div>
          </SectionCard>

          <SectionCard
            id="soft-skills"
            icon={<Sparkles size={20} />}
            title="Soft Skills"
            description="One soft skill per line. These become the skill tiles on the site."
          >
            <Field
              label="Soft Skills"
              value={softSkillsText}
              onChange={(value) => {
                setSoftSkillsText(value);
                update((draft) => { draft.softSkills = splitLines(value); });
              }}
              multiline
              rows={8}
              hint="One skill per line"
            />
          </SectionCard>

          <SectionCard
            id="certifications"
            icon={<BadgeCheck size={20} />}
            title="Certifications"
            description="Add, edit, or remove certifications shown under the resume section. Reorder by dragging or using arrow buttons."
          >
            <div className="space-y-4">
              {draft.certifications.map((certification, index) => (
                <div key={`certification-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-lg shadow-black/10">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-300">Certificate {index + 1}</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => update((draft) => {
                            if (index > 0) {
                              [draft.certifications[index], draft.certifications[index - 1]] = [draft.certifications[index - 1], draft.certifications[index]];
                            }
                          })}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === draft.certifications.length - 1}
                          onClick={() => update((draft) => {
                            if (index < draft.certifications.length - 1) {
                              [draft.certifications[index], draft.certifications[index + 1]] = [draft.certifications[index + 1], draft.certifications[index]];
                            }
                          })}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => update((draft) => {
                        draft.certifications = draft.certifications.filter((item, itemIndex) => itemIndex !== index);
                      })}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title" value={certification.title} onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, title: value } : item); })} />
                      <Field label="Issuer" value={certification.issuer} onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, issuer: value } : item); })} />
                      <Field label="Year" value={certification.year} onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, year: value } : item); })} />
                      <Field label="Credential ID" value={certification.credentialId || ''} onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, credentialId: value } : item); })} />
                      <div className="md:col-span-2">
                        <Field label="Certificate URL" value={certification.certificateUrl || ''} onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, certificateUrl: value } : item); })} placeholder="https://..." hint="Optional - leave blank to hide the button" />
                      </div>
                    </div>
                    <ImageField
                      label="Certificate Image"
                      value={certification.imageUrl || ''}
                      onChange={(value) => update((draft) => { draft.certifications = draft.certifications.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: value } : item); })}
                      onSizeChange={(dataUrl, bytes) => setImageSizes((prev) => ({ ...prev, [dataUrl]: bytes }))}
                      sizeBytes={imageSizes[certification.imageUrl || '']}
                      placeholder="Upload or paste a certificate image URL"
                      hint="Optional thumbnail shown on the public site"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update((draft) => {
                  draft.certifications = [
                    ...draft.certifications,
                    { title: '', issuer: '', year: '', credentialId: '', certificateUrl: '' }
                  ];
                })}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              >
                <Plus size={16} />
                Add Certification
              </button>
            </div>
          </SectionCard>

          <SectionCard
            id="projects"
            icon={<FolderKanban size={20} />}
            title="Projects"
              description="Edit every portfolio project card, including optional GitHub or live links."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-lg shadow-black/10">
                <p className="text-sm font-medium text-slate-200">Project Sections</p>
                <p className="mt-1 text-xs text-slate-400">These create the public section groups in the Projects tab.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(draft.projectSections || []).map((section) => (
                    <div key={section} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                      <span>{section}</span>
                      <button
                        type="button"
                        onClick={() => update((draft) => {
                          draft.projectSections = (draft.projectSections || []).filter((item) => item !== section);
                          draft.projects = draft.projects.map((project) => project.category === section ? { ...project, category: '' } : project);
                        })}
                        className="text-rose-300 transition hover:text-rose-200"
                        aria-label={`Remove project section ${section}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={newProjectSection}
                    onChange={(event) => setNewProjectSection(event.target.value)}
                    placeholder="Add new section (e.g., Mobile Apps)"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const section = newProjectSection.trim();
                      if (!section) return;
                      update((draft) => {
                        if (!draft.projectSections.includes(section)) {
                          draft.projectSections = [...draft.projectSections, section];
                        }
                      });
                      setNewProjectSection('');
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
                  >
                    <Plus size={16} />
                    Add Section
                  </button>
                </div>
              </div>

              {draft.projects.map((project, index) => (
                <div key={project.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-lg shadow-black/10">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-300">Project {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => update((draft) => {
                        draft.projects = draft.projects.filter((item) => item.id !== project.id);
                      })}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title" value={project.title} onChange={(value) => update((draft) => { draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, title: value } : item); })} />
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-200">Category</span>
                        <input
                          list="project-section-options"
                          value={project.category || ''}
                          onChange={(event) => update((draft) => {
                            draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, category: event.target.value } : item);
                          })}
                          placeholder="Select or type a section"
                          className={inputClass}
                        />
                      </label>
                      <Field label="GitHub URL" value={project.githubUrl || ''} onChange={(value) => update((draft) => { draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, githubUrl: value } : item); })} placeholder="Optional" hint="Leave blank if there is no GitHub link" />
                      <Field label="Live URL" value={project.liveUrl || ''} onChange={(value) => update((draft) => { draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, liveUrl: value } : item); })} placeholder="Optional" hint="Leave blank if there is no live demo" />
                      <Field label="Tech Stack" value={projectTechStackText.current[project.id] || joinLines(project.techStack)} onChange={(value) => {
                        projectTechStackText.current[project.id] = value;
                        update((draft) => { draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, techStack: splitLines(value) } : item); });
                      }} multiline rows={4} hint="One technology per line" />
                      <div className="md:col-span-2">
                        <Field label="Description" value={project.description} onChange={(value) => update((draft) => { draft.projects = draft.projects.map((item) => item.id === project.id ? { ...item, description: value } : item); })} multiline rows={4} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update((draft) => {
                  draft.projects = [
                    ...draft.projects,
                    {
                      id: nextId(draft.projects.map((item) => item.id)),
                      title: '',
                      description: '',
                      techStack: [''],
                      githubUrl: '',
                      liveUrl: '',
                      category: draft.projectSections?.[0] || ''
                    }
                  ];
                })}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
              >
                <Plus size={16} />
                Add Project
              </button>
              <datalist id="project-section-options">
                {(draft.projectSections || []).map((section) => (
                  <option key={section} value={section} />
                ))}
              </datalist>
            </div>
          </SectionCard>

          <SectionCard
            id="footer"
            icon={<Mail size={20} />}
            title="Footer"
            description="Customize the footer content shown on the website."
          >
            <div className="space-y-4">
              <Field
                label="Copyright Text"
                value={draft.footer.copyrightText}
                onChange={(value) => update((draft) => { draft.footer.copyrightText = value; })}
                placeholder="© 2025 Your Name. All rights reserved."
              />
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.footer.showSocialLinks}
                    onChange={(e) => update((draft) => { draft.footer.showSocialLinks = e.target.checked; })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-900/70 text-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <span className="text-sm font-medium text-slate-200">Show social media links in footer</span>
                </label>
              </div>
            </div>
          </SectionCard>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
