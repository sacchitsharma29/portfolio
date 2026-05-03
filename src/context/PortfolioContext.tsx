/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { portfolioData as defaultPortfolioData } from '../data/portfolioData';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

export type PortfolioData = typeof defaultPortfolioData;

type PortfolioContextValue = {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  resetData: () => void;
};

const STORAGE_KEY = 'sacchit-portfolio-admin-data';
const FIRESTORE_COLLECTION = 'portfolio';
const FIRESTORE_DOC_ID = 'public-content';

const cloneData = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

// Sanitize data for Firestore - removes undefined values and problematic fields
const sanitizeForFirestore = (data: PortfolioData): Record<string, unknown> => {
  const isPlainObject = (val: unknown) => Object.prototype.toString.call(val) === '[object Object]';

  const clean = (obj: unknown, path = ''): unknown => {
    if (obj === null || obj === undefined) return undefined;

    // Primitive values are OK
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;

    // Dates -> ISO
    if (obj instanceof Date) return obj.toISOString();

    // Arrays: clean each element and drop invalid ones
    if (Array.isArray(obj)) {
      const arr: unknown[] = [];
      obj.forEach((item, i) => {
        const cleaned = clean(item, `${path}[${i}]`);
        if (cleaned !== undefined) arr.push(cleaned);
      });
      return arr;
    }

    // Skip functions, Files, Blobs, and non-plain objects
    if (typeof obj === 'function') {
      console.warn('sanitizeForFirestore: Dropping function at', path);
      return undefined;
    }
    // File/Blob detection
    const maybeFile = obj as { size?: unknown; type?: unknown };
    if (typeof maybeFile?.size === 'number' && typeof maybeFile?.type === 'string') {
      console.warn('sanitizeForFirestore: Dropping File/Blob at', path);
      return undefined;
    }

    if (isPlainObject(obj)) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        // Keep top-level contact only (older versions expected contact top-level)
        if (key === 'contact' && path !== '') continue;

        const cleaned = clean(value, path ? `${path}.${key}` : key);
        if (cleaned !== undefined) {
          result[key] = cleaned;
        }
      }
      return result;
    }

    // Unknown object type -> try JSON-safe fallback
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.warn('sanitizeForFirestore: Dropping unsupported value at', path, obj, e);
      return undefined;
    }
  };

  const cleaned = clean(data, '') as Record<string, unknown>;
  if (!cleaned.contact) cleaned.contact = data.contact;
  return cleaned;
};

const normalizeData = (raw: Partial<PortfolioData> | null | undefined): PortfolioData => {
  const base = cloneData(defaultPortfolioData);

  if (!raw) {
    return base;
  }

  const educationEntries = Array.isArray((raw as PortfolioData).education)
    ? (raw as PortfolioData).education
    : raw.education && typeof raw.education === 'object'
      ? [{ id: 1, ...(raw.education as Record<string, unknown>) }]
      : base.education;

  const fallbackProjectSections = Array.from(
    new Set(
      base.projects
        .map((project) => String(project.category || '').trim())
        .filter(Boolean)
    )
  );

  const rawProjectSections = Array.isArray((raw as PortfolioData).projectSections)
    ? ((raw as PortfolioData).projectSections as string[])
    : fallbackProjectSections;

  const fallbackContactInfo = base.contactInfo || [
    { label: 'Email', value: base.contact.recipientEmail },
    { label: 'Location', value: base.personal.location }
  ];

  const rawContactInfo = Array.isArray((raw as PortfolioData).contactInfo)
    ? ((raw as PortfolioData).contactInfo as Array<{ label: string; value: string }>)
    : fallbackContactInfo;

  return {
    ...base,
    ...raw,
    personal: {
      ...base.personal,
      ...raw.personal,
      resumeFileName:
        typeof raw.personal?.resumeFileName === 'string'
          ? raw.personal.resumeFileName
          : base.personal.resumeFileName,
      resumeFileDataUrl:
        typeof raw.personal?.resumeFileDataUrl === 'string'
          ? raw.personal.resumeFileDataUrl
          : base.personal.resumeFileDataUrl,
    },
    social: { ...base.social, ...raw.social },
    contact: {
      ...base.contact,
      ...raw.contact,
      recipientEmail:
        typeof raw.contact?.recipientEmail === 'string' && raw.contact.recipientEmail.trim()
          ? raw.contact.recipientEmail
          : (raw.personal?.email || base.contact.recipientEmail),
      emailjsServiceId:
        typeof raw.contact?.emailjsServiceId === 'string'
          ? raw.contact.emailjsServiceId
          : base.contact.emailjsServiceId,
      emailjsTemplateId:
        typeof raw.contact?.emailjsTemplateId === 'string'
          ? raw.contact.emailjsTemplateId
          : base.contact.emailjsTemplateId,
      emailjsPublicKey:
        typeof raw.contact?.emailjsPublicKey === 'string'
          ? raw.contact.emailjsPublicKey
          : base.contact.emailjsPublicKey,
    },
    techStack: { ...base.techStack, ...(raw.techStack || {}) },
    experience: Array.isArray(raw.experience) ? raw.experience : base.experience,
    education: educationEntries as PortfolioData['education'],
    softSkills: Array.isArray(raw.softSkills) ? raw.softSkills : base.softSkills,
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications.map((certification) => ({
          imageUrl: '',
          ...certification,
        }))
      : base.certifications,
    projectSections: Array.from(new Set(rawProjectSections.map((section) => String(section).trim()).filter(Boolean))),
    contactInfo: rawContactInfo.map((item) => ({ label: String(item.label || '').trim(), value: String(item.value || '').trim() })),
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((project) => ({
          liveUrl: '',
          image: '',
          ...project,
        }))
      : base.projects,
  };
};

const readStoredData = (): PortfolioData => {
  if (typeof window === 'undefined') {
    return cloneData(defaultPortfolioData);
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneData(defaultPortfolioData);
    return normalizeData(JSON.parse(stored));
  } catch {
    return cloneData(defaultPortfolioData);
  }
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(() => readStoredData());
  const isHydratingFromRemoteRef = useRef(false);
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';
  const canWriteRemote = isAdminRoute && !!auth?.currentUser;

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);

    const syncInitial = async () => {
      try {
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const remoteData = normalizeData(snapshot.data() as Partial<PortfolioData>);
          isHydratingFromRemoteRef.current = true;
          setData(remoteData);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        } else if (canWriteRemote) {
          // Seed Firestore with current local/default data when document does not exist yet.
          const sanitized = sanitizeForFirestore(data);
          await setDoc(docRef, sanitized, { merge: true });
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data from Firestore:', error);
      }
    };

    syncInitial();

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        // If the admin has unsaved changes in this tab, don't overwrite their draft
        if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
          try {
            if (window.localStorage.getItem('PORTFOLIO_HAS_UNSAVED_CHANGES')) {
              return;
            }
          } catch (e) {
            // non-fatal: localStorage may be unavailable; log and continue
            // eslint-disable-next-line no-console
            console.warn('Could not read unsaved flag from localStorage', e);
          }
        }

        const remoteData = normalizeData(snapshot.data() as Partial<PortfolioData>);
        isHydratingFromRemoteRef.current = true;
        setData(remoteData);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        } catch (e) {
          console.warn('Could not persist remote data to localStorage', e);
        }
      },
      (error) => {
        console.error('Realtime Firestore sync failed:', error);
      }
    );

    return () => unsubscribe();
    // We intentionally run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if (isHydratingFromRemoteRef.current) {
      isHydratingFromRemoteRef.current = false;
      return;
    }

    if (isFirebaseConfigured && db && canWriteRemote) {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      const sanitized = sanitizeForFirestore(data);
      console.log('🔥 Writing to Firestore:', {
        route: window.location.pathname,
        authenticated: !!auth?.currentUser,
        templateId: data.contact.emailjsTemplateId,
        sanitizedPreview: sanitized
      });

      const meta = {
        _meta: {
          uid: auth?.currentUser?.uid || null,
          origin: typeof window !== 'undefined' ? window.location.href : 'server',
          ts: Date.now()
        }
      } as Record<string, unknown>;

      console.log('🔥 Writing to Firestore with meta:', meta);

      setDoc(docRef, { ...sanitized, ...meta }, { merge: true })
        .then(() => {
          try {
            window.localStorage.removeItem('PORTFOLIO_HAS_UNSAVED_CHANGES');
          } catch (e) {
            console.warn('Could not clear unsaved flag after successful write', e);
          }
        })
        .catch((error) => {
          console.error('Failed to sync portfolio data to Firestore:', error, { sanitized, meta });
        });
    }
  }, [canWriteRemote, data]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        // Prevent treating this as a local edit that should be immediately written back
        isHydratingFromRemoteRef.current = true;
        const parsed = normalizeData(JSON.parse(event.newValue));
        console.log('Storage event: hydrating from other tab/localStorage', parsed);
        setData(parsed);
      } finally {
        // leave flag set; the next effect cycle will clear it after handling
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const resetData = () => {
    setData(cloneData(defaultPortfolioData));
  };

  return (
    <PortfolioContext.Provider value={{ data, setData, resetData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioData = () => {
  const context = useContext(PortfolioContext);

  if (!context) {
    throw new Error('usePortfolioData must be used inside a PortfolioProvider');
  }

  return context;
};
