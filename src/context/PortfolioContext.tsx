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
  const removeUndefinedAndContact = (obj: unknown, isTopLevel = false): unknown => {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    if (Array.isArray(obj)) {
      return obj
        .map((item) => removeUndefinedAndContact(item, false))
        .filter((item) => item !== undefined);
    }
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        // ALLOW data URLs through (we're storing files as base64 in Firestore)
        // Remove contact from nested objects (only keep at top level)
        if (key === 'contact' && !isTopLevel) {
          continue;
        }
        const cleaned = removeUndefinedAndContact(value, false);
        if (cleaned !== undefined) {
          result[key] = cleaned;
        }
      }
      return result;
    }
    return obj;
  };

  const cleaned = removeUndefinedAndContact(data, true) as Record<string, unknown>;
  
  // Ensure contact object exists at top level only
  if (!cleaned.contact) {
    cleaned.contact = data.contact;
  }
  
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

        const remoteData = normalizeData(snapshot.data() as Partial<PortfolioData>);
        isHydratingFromRemoteRef.current = true;
        setData(remoteData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
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
        templateId: data.contact.emailjsTemplateId
      });
      setDoc(docRef, sanitized, { merge: true }).catch((error) => {
        console.error('Failed to sync portfolio data to Firestore:', error);
      });
    }
  }, [canWriteRemote, data]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      setData(normalizeData(JSON.parse(event.newValue)));
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
