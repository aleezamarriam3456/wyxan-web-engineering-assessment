'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import {
  ApiRequestError,
  createSite,
  createVisit,
  getPeople,
  getSites,
  getSite,
  getVisits,
  searchSites,
} from '@/components/lib/api';

import {
  isValidAddress,
  normalizeAddress,
} from '@/components/lib/address';

import {
  canGoBack,
  canGoForward,
  createInitialSession,
  getCurrentEntry,
  goBack,
  goForward,
  navigateTo,
  updateCurrentScroll,
} from '@/components/lib/session';

import type {
  BrowserEntry,
  BrowserSession,
  Person,
  SearchResult,
  Visit,
  VisitSource,
} from '@/components/types/miniweb';

import './miniweb.css';

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

type SidebarSection = 'history' | 'search' | 'publish';

const sidebarItems: {
  id: SidebarSection;
  label: string;
  description: string;
  symbol: string;
}[] = [
  {
    id: 'history',
    label: 'History',
    description: 'Your browsing history',
    symbol: '↺',
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Find words across websites',
    symbol: '⌕',
  },
  {
    id: 'publish',
    label: 'Publish',
    description: 'Add a website to MiniWeb',
    symbol: '+',
  },
];

/* -------------------------------------------------------------------------- */
/* Session validation                                                         */
/* -------------------------------------------------------------------------- */

function isValidSession(value: unknown): value is BrowserSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as BrowserSession;

  if (
    !Array.isArray(candidate.entries) ||
    !Number.isInteger(candidate.index)
  ) {
    return false;
  }

  if (candidate.entries.length === 0) {
    return candidate.index === -1;
  }

  return (
    candidate.index >= 0 &&
    candidate.index < candidate.entries.length
  );
}

/* -------------------------------------------------------------------------- */
/* Sandboxed website document                                                 */
/* -------------------------------------------------------------------------- */

function createSandboxDocument(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
  >

  <meta name="viewport" content="width=device-width, initial-scale=1">

  <style>
    :root {
      color-scheme: dark;
      --page-bg: #0b0713;
      --page-surface: #151022;
      --page-border: rgba(183, 148, 255, 0.16);
      --page-text: #eee7ff;
      --page-muted: #b4a6ca;
      --page-purple: #a77aff;
      --page-lavender: #d0b7ff;
    }

    * {
      box-sizing: border-box;
    }

    html {
      min-height: 100%;
      background: var(--page-bg);
      color: var(--page-text);
      scroll-behavior: smooth;
      scrollbar-color: #60418c #100a1d;
    }

    body {
      min-height: 100vh;
      max-width: 100%;
      margin: 0;
      padding: 48px clamp(22px, 7vw, 100px) 80px;
      overflow-wrap: break-word;

      background:
        radial-gradient(
          ellipse at 12% 0%,
          rgba(111, 65, 175, 0.20),
          transparent 42%
        ),
        radial-gradient(
          ellipse at 90% 30%,
          rgba(79, 43, 127, 0.13),
          transparent 38%
        ),
        var(--page-bg);

      color: var(--page-text);

      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      font-size: 15px;
      line-height: 1.85;
    }

    body > * {
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #f3ecff;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.035em;
      margin-top: 1.7em;
      margin-bottom: 0.65em;
    }

    h1 {
      margin-top: 0.55em;
      font-size: clamp(2.2rem, 6vw, 3.8rem);
      letter-spacing: -0.055em;
      line-height: 1.08;
      background: linear-gradient(
        110deg,
        #ffffff,
        #d5baff 65%,
        #a77aff
      );
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    h2 {
      font-size: clamp(1.7rem, 4vw, 2.35rem);
    }

    h3 {
      font-size: 1.4rem;
      color: var(--page-lavender);
    }

    p {
      margin: 0 0 1.35em;
      color: #c8bddb;
    }

    strong, b {
      color: #f1eaff;
      font-weight: 700;
    }

    small {
      color: var(--page-muted);
    }

    a {
      display: inline;
      color: var(--page-lavender);
      font-weight: 600;
      text-decoration: none;
      border-bottom: 1px solid rgba(167, 122, 255, 0.45);
      text-underline-offset: 5px;
      transition: color 160ms ease, border-color 160ms ease;
      cursor: pointer;
    }

    a:hover {
      color: #ffffff;
      border-color: #c5a1ff;
    }

    ul, ol {
      margin: 0 0 1.5em;
      padding-left: 1.6em;
      color: #c8bddb;
    }

    li {
      margin: 0.45em 0;
      padding-left: 0.25em;
    }

    li::marker {
      color: var(--page-purple);
    }

    blockquote {
      margin: 2em 0;
      padding: 18px 24px;
      border-left: 3px solid var(--page-purple);
      border-radius: 0 12px 12px 0;
      background: rgba(123, 77, 183, 0.10);
      color: #d9c9f4;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    hr {
      height: 1px;
      margin: 2.5em 0;
      border: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(183, 148, 255, 0.35),
        transparent
      );
    }

    code, pre {
      font-family: Consolas, "Courier New", monospace;
    }

    code {
      padding: 3px 7px;
      border: 1px solid var(--page-border);
      border-radius: 5px;
      background: var(--page-surface);
      color: var(--page-lavender);
    }

    pre {
      max-width: 100%;
      overflow-x: auto;
      padding: 20px;
      border: 1px solid var(--page-border);
      border-radius: 12px;
      background: #100a1b;
      color: #e6d9ff;
      white-space: pre-wrap;
    }

    pre code {
      padding: 0;
      border: 0;
      background: transparent;
    }

    table {
      width: 100%;
      max-width: 100%;
      margin: 1.5em 0;
      border-collapse: collapse;
      color: #d7cce8;
    }

    th, td {
      padding: 12px 15px;
      border: 1px solid var(--page-border);
      text-align: left;
    }

    th {
      background: #1d1430;
      color: var(--page-lavender);
    }

    td {
      background: rgba(23, 16, 39, 0.55);
    }

    img, iframe, video, audio, object, embed {
      display: none !important;
    }

    @media (max-width: 600px) {
      body {
        padding: 30px 20px 52px;
        font-size: 14px;
      }

      h1 {
        font-size: 2.25rem;
      }

      th, td {
        padding: 9px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>

<body>
  ${html}
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatVisitDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
}

/* -------------------------------------------------------------------------- */
/* Main application                                                           */
/* -------------------------------------------------------------------------- */

export default function MiniWebApp() {
  /* ------------------------------------------------------------------------ */
  /* Identity and browser session                                             */
  /* ------------------------------------------------------------------------ */

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');

  const [session, setSession] = useState<BrowserSession>(
    createInitialSession,
  );

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionOwner, setSessionOwner] = useState('');

  /* ------------------------------------------------------------------------ */
  /* Published websites                                                       */
  /* ------------------------------------------------------------------------ */

  const [sites, setSites] = useState<
    Awaited<ReturnType<typeof getSites>>
  >([]);

  const [sitesLoading, setSitesLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Interface state                                                          */
  /* ------------------------------------------------------------------------ */

  const [activeSection, setActiveSection] =
    useState<SidebarSection | 'browse'>('browse');

  const [address, setAddress] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* History                                                                  */
  /* ------------------------------------------------------------------------ */

  const [history, setHistory] = useState<Visit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Publishing                                                               */
  /* ------------------------------------------------------------------------ */

  const [publishAddress, setPublishAddress] = useState('');
  const [publishTitle, setPublishTitle] = useState('');
  const [publishHtml, setPublishHtml] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* References                                                               */
  /* ------------------------------------------------------------------------ */

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentEntry = getCurrentEntry(session);

  /* ------------------------------------------------------------------------ */
  /* Load browsing identities                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    async function loadPeople() {
      try {
        const availablePeople = await getPeople();

        if (!isMounted) {
          return;
        }

        setPeople(availablePeople);

        if (availablePeople.length > 0) {
          setSelectedPerson(availablePeople[0].name);
        } else {
          setNotice('No browsing identities are available.');
        }
      } catch {
        if (isMounted) {
          setNotice(
            'Unable to load browsing identities. Check the backend.',
          );
        }
      }
    }

    void loadPeople();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Load all published websites                                              */
  /* ------------------------------------------------------------------------ */

  const refreshSites = useCallback(async () => {
    setSitesLoading(true);

    try {
      const availableSites = await getSites();
      setSites(availableSites);
    } catch {
      setNotice(
        'Unable to load published websites. Check the backend.',
      );
    } finally {
      setSitesLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPublishedSites() {
      setSitesLoading(true);

      try {
        const availableSites = await getSites();

        if (isMounted) {
          setSites(availableSites);
        }
      } catch {
        if (isMounted) {
          setNotice(
            'Unable to load published websites. Check the backend.',
          );
        }
      } finally {
        if (isMounted) {
          setSitesLoading(false);
        }
      }
    }

    void loadPublishedSites();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Restore each person's independent session and history                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedPerson) {
      return;
    }

    let isMounted = true;

    setSessionReady(false);
    setHistoryLoading(true);

    const storageKey = `miniweb-session-${selectedPerson}`;

    let restoredSession = createInitialSession();

    try {
      const savedSession = sessionStorage.getItem(storageKey);

      if (savedSession) {
        const parsedSession: unknown = JSON.parse(savedSession);

        if (isValidSession(parsedSession)) {
          restoredSession = parsedSession;
        }
      }
    } catch {
      restoredSession = createInitialSession();
    }

    setSession(restoredSession);
    setSessionOwner(selectedPerson);
    setAddress('');
    setSessionReady(true);

    async function loadHistory() {
      try {
        const visits = await getVisits(selectedPerson);

        if (isMounted) {
          setHistory(visits);
        }
      } catch {
        if (isMounted) {
          setHistory([]);
          setNotice(
            'Unable to load this person’s browsing history.',
          );
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedPerson]);

  /* ------------------------------------------------------------------------ */
  /* Persist the current person's session                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !selectedPerson ||
      !sessionReady ||
      sessionOwner !== selectedPerson
    ) {
      return;
    }

    const storageKey = `miniweb-session-${selectedPerson}`;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      setNotice('The browser session could not be saved.');
    }
  }, [selectedPerson, session, sessionReady, sessionOwner]);

  /* ------------------------------------------------------------------------ */
  /* History helpers                                                          */
  /* ------------------------------------------------------------------------ */

  const refreshHistory = useCallback(async () => {
    if (!selectedPerson) {
      return;
    }

    try {
      const visits = await getVisits(selectedPerson);
      setHistory(visits);
    } catch {
      setNotice('Unable to refresh browsing history.');
    }
  }, [selectedPerson]);

  async function recordArrival(
    entry: BrowserEntry,
    via: VisitSource,
  ) {
    if (!selectedPerson || entry.kind === 'search') {
      return;
    }

    try {
      await createVisit({
        person: selectedPerson,
        address: entry.address,
        via,
        found: entry.kind === 'site',
      });

      await refreshHistory();
    } catch {
      setNotice(
        'The page opened, but its visit could not be recorded.',
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Capture scroll position                                                  */
  /* ------------------------------------------------------------------------ */

  function captureCurrentScroll(): BrowserSession {
    const currentScroll =
      iframeRef.current?.contentWindow?.scrollY ?? 0;

    return updateCurrentScroll(session, currentScroll);
  }

  /* ------------------------------------------------------------------------ */
  /* Address navigation                                                       */
  /* ------------------------------------------------------------------------ */

  async function navigateToAddress(
    rawAddress: string,
    via: VisitSource = 'typed',
  ) {
    const normalizedAddress = normalizeAddress(rawAddress);

    if (!isValidAddress(rawAddress)) {
      setNotice(
        'Enter a valid MiniWeb address, such as tidepool.zz.',
      );
      return;
    }

    if (!selectedPerson) {
      setNotice(
        'Select a browsing identity before opening a website.',
      );
      return;
    }

    const currentScroll =
      iframeRef.current?.contentWindow?.scrollY ?? 0;

    const savedSession = updateCurrentScroll(
      session,
      currentScroll,
    );

    setSession(savedSession);
    setIsLoading(true);
    setNotice('');
    setActiveSection('browse');
    setAddress(normalizedAddress);

    let newEntry: BrowserEntry;

    try {
      const site = await getSite(normalizedAddress);

      newEntry = {
        kind: 'site',
        address: site.address,
        site,
        scrollY: 0,
        via,
      };
    } catch (error) {
      if (
        error instanceof ApiRequestError &&
        error.status === 404
      ) {
        newEntry = {
          kind: 'nowhere',
          address: normalizedAddress,
          scrollY: 0,
          via,
        };
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : 'Unable to open this website.',
        );

        setIsLoading(false);
        return;
      }
    }

    const nextSession = navigateTo(savedSession, newEntry);

    setSession(nextSession);
    setIsLoading(false);

    await recordArrival(newEntry, via);
  }

  function handleAddressSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void navigateToAddress(address, 'typed');
  }

  /* ------------------------------------------------------------------------ */
  /* Back navigation                                                          */
  /* ------------------------------------------------------------------------ */

  function handleBack() {
    const savedSession = captureCurrentScroll();
    const nextSession = goBack(savedSession);

    if (nextSession === savedSession) {
      return;
    }

    setSession(nextSession);
    setActiveSection('browse');
    setNotice('');

    const destination = getCurrentEntry(nextSession);

    if (!destination) {
      return;
    }

    if (destination.kind === 'search') {
      setAddress(`search: ${destination.query}`);
      return;
    }

    setAddress(destination.address);
    void recordArrival(destination, 'back');
  }

  /* ------------------------------------------------------------------------ */
  /* Forward navigation                                                       */
  /* ------------------------------------------------------------------------ */

  function handleForward() {
    const savedSession = captureCurrentScroll();
    const nextSession = goForward(savedSession);

    if (nextSession === savedSession) {
      return;
    }

    setSession(nextSession);
    setActiveSection('browse');
    setNotice('');

    const destination = getCurrentEntry(nextSession);

    if (!destination) {
      return;
    }

    if (destination.kind === 'search') {
      setAddress(`search: ${destination.query}`);
      return;
    }

    setAddress(destination.address);
    void recordArrival(destination, 'forward');
  }

  /* ------------------------------------------------------------------------ */
  /* Sandboxed iframe navigation                                              */
  /* ------------------------------------------------------------------------ */

  function handleIframeLoad() {
    const iframeDocument = iframeRef.current?.contentDocument;
    const iframeWindow = iframeRef.current?.contentWindow;

    if (!iframeDocument || !iframeWindow) {
      return;
    }

    const entry = getCurrentEntry(session);

    if (!entry || entry.kind !== 'site') {
      return;
    }

    iframeWindow.scrollTo(0, entry.scrollY);

    iframeDocument.addEventListener('click', (event) => {
      const target = event.target as
        | (Element & { parentElement?: Element })
        | null;

      const link =
        target?.closest?.('a') ??
        target?.parentElement?.closest('a');

      if (!link) {
        return;
      }

      event.preventDefault();

      const destination = link.getAttribute('data-address');

      if (destination) {
        void navigateToAddress(destination, 'link');
      }
    });

    iframeWindow.addEventListener(
      'scroll',
      () => {
        const currentScroll = iframeWindow.scrollY;

        setSession((previousSession) =>
          updateCurrentScroll(previousSession, currentScroll),
        );
      },
      { passive: true },
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      setNotice('Enter a word or phrase to search.');
      return;
    }

    setSearchLoading(true);
    setNotice('');
    setActiveSection('search');

    try {
      const results = await searchSites(normalizedQuery);

      setSearchResults(results);

      const searchEntry: BrowserEntry = {
        kind: 'search',
        query: normalizedQuery,
        results,
        scrollY: 0,
      };

      const savedSession = updateCurrentScroll(
        session,
        iframeRef.current?.contentWindow?.scrollY ?? 0,
      );

      setSession(navigateTo(savedSession, searchEntry));
      setAddress(`search: ${normalizedQuery}`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Search could not be completed.',
      );
    } finally {
      setSearchLoading(false);
    }
  }

  function openSearchResult(result: SearchResult) {
    void navigateToAddress(result.address, 'search');
  }

  /* ------------------------------------------------------------------------ */
  /* Publish                                                                  */
  /* ------------------------------------------------------------------------ */

  async function handlePublish(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedPerson) {
      setNotice(
        'Select a browsing identity before publishing.',
      );
      return;
    }

    const normalizedAddress = normalizeAddress(publishAddress);

    if (!isValidAddress(publishAddress)) {
      setNotice('Enter a valid website address.');
      return;
    }

    if (!publishTitle.trim() || !publishHtml.trim()) {
      setNotice(
        'Provide a website title and HTML content.',
      );
      return;
    }

    if (publishHtml.length > 50000) {
      setNotice('HTML content must not exceed 50 KB.');
      return;
    }

    setPublishLoading(true);
    setNotice('');

    try {
      await createSite({
        address: normalizedAddress,
        title: publishTitle.trim(),
        html: publishHtml,
        author: selectedPerson,
      });

      await refreshSites();

      setPublishAddress('');
      setPublishTitle('');
      setPublishHtml('');

      await navigateToAddress(normalizedAddress, 'typed');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'The website could not be published.',
      );
    } finally {
      setPublishLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Person selection                                                         */
  /* ------------------------------------------------------------------------ */

  function handlePersonChange(person: string) {
    if (person === selectedPerson) {
      return;
    }

    setSelectedPerson(person);
    setActiveSection('browse');
    setAddress('');
    setNotice('');
    setSearchResults([]);
  }

  /* ------------------------------------------------------------------------ */
  /* Current browser content                                                  */
  /* ------------------------------------------------------------------------ */

  const currentTitle =
    currentEntry?.kind === 'site'
      ? currentEntry.site.title
      : currentEntry?.kind === 'nowhere'
        ? 'Nowhere'
        : currentEntry?.kind === 'search'
          ? `Search: ${currentEntry.query}`
          : 'Your browser is ready';

  const iframeDocument =
    currentEntry?.kind === 'site'
      ? createSandboxDocument(currentEntry.site.html)
      : '';

  /* ------------------------------------------------------------------------ */
  /* Search results display                                                   */
  /* ------------------------------------------------------------------------ */

  function renderSearchResults(results: SearchResult[]) {
    if (results.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">⌕</div>

          <h3>No matching websites found.</h3>

          <p className="empty-state-description">
            Try another word or phrase to search the published web.
          </p>
        </div>
      );
    }

    return (
      <div className="search-result-list">
        {results.map((result) => (
          <article
            key={result.address}
            className="search-result"
          >
            <button
              type="button"
              className="search-result-title"
              onClick={() => openSearchResult(result)}
            >
              {result.title}
            </button>

            <span className="search-result-address">
              {result.address}
            </span>

            {result.snippets.map((snippet, index) => (
              <p key={`${result.address}-${index}`}>
                {snippet.text}
              </p>
            ))}
          </article>
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Published website directory                                              */
  /* ------------------------------------------------------------------------ */

  function renderWebsiteDirectory() {
    return (
      <div className="website-directory">
        <div className="empty-state">
          <div className="empty-state-icon">⌘</div>

          <p className="eyebrow">
            YOUR JOURNEY STARTS HERE
          </p>

          <h2>Explore the little web.</h2>

          <p className="empty-state-description">
            Choose a published website below or enter its address
            above to start exploring MiniWeb.
          </p>
        </div>

        <div className="search-results">
          <p className="eyebrow">
            THE MINIWEB COLLECTION
          </p>

          <h2>Published websites</h2>

          {sitesLoading ? (
            <div className="empty-state">
              <p>Loading published websites...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="empty-state">
              <h3>No websites published yet.</h3>

              <p className="empty-state-description">
                Published websites will appear here.
              </p>
            </div>
          ) : (
            <div className="search-result-list">
              {sites.map((site) => (
                <article
                  key={site.address}
                  className="search-result"
                >
                  <button
                    type="button"
                    className="search-result-title"
                    onClick={() =>
                      void navigateToAddress(site.address, 'typed')
                    }
                    disabled={isLoading}
                  >
                    {site.title}
                  </button>

                  <span className="search-result-address">
                    {site.address}
                  </span>

                  <p>Published by {site.author}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="miniweb-shell">

      {/* Sidebar */}

      <aside className="miniweb-sidebar">

        <div className="brand">
          <div className="brand-mark">m.</div>

          <div className="brand-copy">
            <span className="brand-name">miniweb</span>

            <span className="brand-caption">
              A little world of websites
            </span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <label
          className="person-label"
          htmlFor="person-select"
        >
          BROWSING AS
        </label>

        <select
          id="person-select"
          className="person-select"
          value={selectedPerson}
          onChange={(event) =>
            handlePersonChange(event.target.value)
          }
          disabled={people.length === 0}
        >
          {people.map((person) => (
            <option key={person.name} value={person.name}>
              {person.name}
            </option>
          ))}
        </select>

        <nav
          className="sidebar-navigation"
          aria-label="MiniWeb navigation"
        >
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                activeSection === item.id ? 'active' : ''
              }`}
              aria-current={
                activeSection === item.id ? 'page' : undefined
              }
              onClick={() => {
                setActiveSection(item.id);
                setNotice('');
              }}
            >
              <span
                className="sidebar-link-symbol"
                aria-hidden="true"
              >
                {item.symbol}
              </span>

              <span className="sidebar-link-copy">
                <span className="sidebar-link-title">
                  {item.label}
                </span>

                <span className="sidebar-link-description">
                  {item.description}
                </span>
              </span>

              {activeSection === item.id && (
                <span className="sidebar-active-indicator" />
              )}
            </button>
          ))}
        </nav>

        {/* Search form */}

        {activeSection === 'search' && (
          <form
            className="sidebar-search-form"
            onSubmit={handleSearch}
          >
            <label htmlFor="sidebar-search">
              SEARCH PAGE CONTENT
            </label>

            <input
              id="sidebar-search"
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Try crab, ocean..."
            />

            <button
              type="submit"
              className="sidebar-search-button"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        {/* Sandbox information */}

        <div className="sidebar-bottom">
          <div className="sandbox-note">
            <span className="sandbox-indicator" />

            <div>
              <span className="sandbox-title">
                Sandboxed environment
              </span>

              <span className="sandbox-description">
                Website content stays contained
              </span>
            </div>
          </div>

          <span className="sidebar-version">
            MINIWEB · WEB ENGINEERING
          </span>
        </div>
      </aside>

      {/* Main browser workspace */}

      <section className="browser-workspace">

        <header className="browser-header">

          <div className="browser-heading">
            <div>
              <p className="eyebrow">
                YOUR PERSONAL WEB
              </p>

              <h1>Explore a smaller internet.</h1>
            </div>

            <span className="browser-status">
              <span className="status-dot" />

              {isLoading
                ? 'Opening website...'
                : 'MiniWeb is ready'}
            </span>
          </div>

          {/* Address bar and navigation controls */}

          <div className="browser-toolbar">

            <div className="navigation-controls">
              <button
                type="button"
                className="toolbar-button"
                aria-label="Go back"
                disabled={!canGoBack(session) || isLoading}
                onClick={handleBack}
              >
                ←
              </button>

              <button
                type="button"
                className="toolbar-button"
                aria-label="Go forward"
                disabled={!canGoForward(session) || isLoading}
                onClick={handleForward}
              >
                →
              </button>
            </div>

            <form
              className="address-form"
              onSubmit={handleAddressSubmit}
            >
              <span
                className="address-lock"
                aria-hidden="true"
              >
                ◇
              </span>

              <input
                aria-label="Website address"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter a website address, e.g. tidepool.zz"
              />

              <button
                type="submit"
                className="go-button"
                disabled={isLoading}
              >
                Go <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>
        </header>

        {/* Browser content */}

        <section className="browser-content">

          <div className="content-topline">
            <span className="content-section-name">
              {activeSection === 'history' &&
                'BROWSING HISTORY'}

              {activeSection === 'search' &&
                'SEARCH THE WEB'}

              {activeSection === 'publish' &&
                'PUBLISH A WEBSITE'}

              {activeSection === 'browse' &&
                currentTitle.toUpperCase()}
            </span>

            <span className="sandbox-badge">
              <span className="status-dot" />
              SANDBOXED
            </span>
          </div>

          <div className="browser-page">

            {/* Status and error messages */}

            {notice && (
              <div
                className="browser-notice"
                role="status"
              >
                <span>{notice}</span>

                <button
                  type="button"
                  aria-label="Dismiss message"
                  onClick={() => setNotice('')}
                >
                  ×
                </button>
              </div>
            )}

            {/* Website browser */}

            {activeSection === 'browse' && (
              <>
                {isLoading && (
                  <div className="empty-state loading-state">
                    <div className="empty-state-icon">◌</div>

                    <p className="eyebrow">
                      PLEASE WAIT
                    </p>

                    <h2>Opening your website...</h2>
                  </div>
                )}

                {!isLoading && !currentEntry &&
                  renderWebsiteDirectory()}

                {!isLoading &&
                  currentEntry?.kind === 'site' && (
                    <div className="website-view">

                      <div className="website-information">
                        <span>
                          {currentEntry.site.address}
                        </span>

                        <span>
                          By {currentEntry.site.author}
                        </span>
                      </div>

                      <iframe
                        key={`${currentEntry.address}-${session.index}`}
                        ref={iframeRef}
                        className="website-frame"
                        title={currentEntry.site.title}
                        srcDoc={iframeDocument}
                        sandbox="allow-same-origin"
                        onLoad={handleIframeLoad}
                      />
                    </div>
                  )}

                {!isLoading &&
                  currentEntry?.kind === 'nowhere' && (
                    <div className="empty-state nowhere-state">
                      <div className="empty-state-icon">
                        404
                      </div>

                      <p className="eyebrow">
                        ADDRESS NOT FOUND
                      </p>

                      <h2>
                        This little corner doesn't exist.
                      </h2>

                      <p className="empty-state-description">
                        No website is currently published at{' '}
                        <strong>
                          {currentEntry.address}
                        </strong>.
                        You can go back or try another address.
                      </p>
                    </div>
                  )}

                {!isLoading &&
                  currentEntry?.kind === 'search' && (
                    <div className="search-results">
                      <p className="eyebrow">
                        SEARCH RESULTS FOR "
                        {currentEntry.query}"
                      </p>

                      <h2>
                        {currentEntry.results.length}{' '}
                        matching websites
                      </h2>

                      {renderSearchResults(
                        currentEntry.results,
                      )}
                    </div>
                  )}
              </>
            )}

            {/* Per-person browsing history */}

            {activeSection === 'history' && (
              <div className="history-panel">
                <p className="eyebrow">
                  BROWSING AS {selectedPerson.toUpperCase()}
                </p>

                <h2>Your browsing history.</h2>

                <p className="empty-state-description">
                  Every recorded visit appears here. Select a
                  website to open it again.
                </p>

                {historyLoading ? (
                  <div className="empty-state">
                    <p>Loading browsing history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      ↺
                    </div>

                    <h3>No visits yet.</h3>

                    <p className="empty-state-description">
                      Websites visited by {selectedPerson} will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map((visit) => (
                      <button
                        key={
                          visit._id ??
                          `${visit.address}-${visit.at}`
                        }
                        type="button"
                        className="history-row"
                        onClick={() =>
                          void navigateToAddress(
                            visit.address,
                            'history',
                          )
                        }
                        disabled={isLoading}
                      >
                        <span className="history-address">
                          {visit.address}
                        </span>

                        <span className="history-metadata">
                          {formatVisitDate(visit.at)}
                        </span>

                        <span className="history-source">
                          {visit.via}
                        </span>

                        <span className="history-status">
                          {visit.found
                            ? 'Visited'
                            : 'Nowhere'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Full-text search */}

            {activeSection === 'search' && (
              <div className="search-results">
                <p className="eyebrow">
                  SEARCH MINIWEB
                </p>

                <h2>Find something interesting.</h2>

                <p className="empty-state-description">
                  Search for words inside published website
                  content, not just page titles.
                </p>

                {!searchQuery.trim() && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      ⌕
                    </div>

                    <h3>What are you looking for?</h3>

                    <p className="empty-state-description">
                      Enter a word or phrase in the sidebar search
                      field.
                    </p>
                  </div>
                )}

                {searchLoading && (
                  <p>Searching website content...</p>
                )}

                {!searchLoading && searchQuery.trim() && (
                  <>
                    <p className="search-result-count">
                      {searchResults.length} matching websites
                    </p>

                    {renderSearchResults(searchResults)}
                  </>
                )}
              </div>
            )}

            {/* Publish a website */}

            {activeSection === 'publish' && (
              <div className="publish-panel">
                <p className="eyebrow">
                  MAKE YOUR MARK
                </p>

                <h2>Give your website a home.</h2>

                <p className="empty-state-description">
                  Publish a page of HTML to the MiniWeb collection.
                </p>

                <form
                  className="publish-form"
                  onSubmit={handlePublish}
                >
                  <label htmlFor="publish-address">
                    WEBSITE ADDRESS
                  </label>

                  <input
                    id="publish-address"
                    type="text"
                    value={publishAddress}
                    onChange={(event) =>
                      setPublishAddress(event.target.value)
                    }
                    placeholder="e.g. mysite.zz"
                    maxLength={100}
                    required
                  />

                  <label htmlFor="publish-title">
                    PAGE TITLE
                  </label>

                  <input
                    id="publish-title"
                    type="text"
                    value={publishTitle}
                    onChange={(event) =>
                      setPublishTitle(event.target.value)
                    }
                    placeholder="Give your page a title"
                    maxLength={100}
                    required
                  />

                  <label htmlFor="publish-html">
                    HTML CONTENT
                  </label>

                  <textarea
                    id="publish-html"
                    value={publishHtml}
                    onChange={(event) =>
                      setPublishHtml(event.target.value)
                    }
                    placeholder="<h1>Hello, MiniWeb!</h1><p>My first website.</p>"
                    rows={10}
                    maxLength={50000}
                    required
                  />

                  <span className="publish-help">
                    Maximum HTML size: 50 KB. Scripts and unsafe
                    markup are removed by the server.
                  </span>

                  <button
                    type="submit"
                    className="go-button"
                    disabled={publishLoading}
                  >
                    {publishLoading
                      ? 'Publishing...'
                      : 'Publish website'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}