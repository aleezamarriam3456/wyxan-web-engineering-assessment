
/*
 * File: MiniWebApp.tsx
 *
 * Purpose:
 * Provides the main application shell for MiniWeb.
 *
 * Responsibilities:
 * - Organise the browser workspace and sidebar.
 * - Provide the person selector and application navigation.
 * - Establish the address bar, navigation controls and browser viewport.
 * - Provide the layout into which browser features will be integrated.
 *
 * Architecture:
 * This is the top-level client component for the MiniWeb interface.
 * API communication, browser session management and individual
 * interface panels will be separated into dedicated modules.
 */

'use client';

import { useState } from 'react';
import './miniweb.css';

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
    description: 'Your browsing trail',
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

export default function MiniWebApp() {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>('history');

  const [selectedPerson, setSelectedPerson] = useState('Aleeza');
  const [address, setAddress] = useState('');

  return (
    <main className="miniweb-shell">
      {/* Application sidebar */}
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

        {/* The selected person determines whose history is displayed. */}
        <label className="person-label" htmlFor="person-select">
          BROWSING AS
        </label>

        <select
          id="person-select"
          className="person-select"
          value={selectedPerson}
          onChange={(event) => setSelectedPerson(event.target.value)}
        >
          <option value="Aleeza">Aleeza</option>
          <option value="Bilal">Bilal</option>
          <option value="Hina">Hina</option>
          <option value="Omar">Omar</option>
          <option value="Sara">Sara</option>
        </select>

        {/* Switch between the three assessment-required panels. */}
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
              onClick={() => setActiveSection(item.id)}
            >
              <span className="sidebar-link-symbol" aria-hidden="true">
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

        {/* Visual indication of the isolated website environment. */}
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
              <p className="eyebrow">YOUR PERSONAL WEB</p>
              <h1>Explore a smaller internet.</h1>
            </div>

            <span className="browser-status">
              <span className="status-dot" />
              MiniWeb is ready
            </span>
          </div>

          {/* Browser navigation controls and address input. */}
          <div className="browser-toolbar">
            <div className="navigation-controls">
              <button
                type="button"
                className="toolbar-button"
                aria-label="Go back"
                disabled
              >
                ←
              </button>

              <button
                type="button"
                className="toolbar-button"
                aria-label="Go forward"
                disabled
              >
                →
              </button>
            </div>

            <form
              className="address-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <span className="address-lock" aria-hidden="true">
                ◇
              </span>

              <input
                aria-label="Website address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter a website address, e.g. tidepool.zz"
              />

              <button type="submit" className="go-button">
                Go <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>

          {/* The actual navigation trail will be connected later. */}
          <div className="navigation-trail">
            <span className="trail-label">YOUR TRAIL</span>

            <span className="trail-empty">
              Your visited websites will appear here.
            </span>
          </div>
        </header>

        <section className="browser-content">
          <div className="content-topline">
            <span className="content-section-name">
              {activeSection === 'history' && 'BROWSING HISTORY'}
              {activeSection === 'search' && 'SEARCH THE WEB'}
              {activeSection === 'publish' && 'PUBLISH A WEBSITE'}
            </span>

            <span className="sandbox-badge">
              <span className="status-dot" />
              SANDBOXED
            </span>
          </div>

          {/* Temporary panel content; real panels will replace these states. */}
          <div className="browser-page">
            {activeSection === 'history' && (
              <div className="empty-state">
                <div className="empty-state-icon">↺</div>

                <p className="eyebrow">
                  YOUR JOURNEY STARTS HERE
                </p>

                <h2>Every little visit leaves a trail.</h2>

                <p className="empty-state-description">
                  Enter a website address above to start exploring.
                  Your browsing history will be collected here.
                </p>
              </div>
            )}

            {activeSection === 'search' && (
              <div className="empty-state">
                <div className="empty-state-icon">⌕</div>

                <p className="eyebrow">
                  DISCOVER SOMETHING NEW
                </p>

                <h2>Search beyond the headlines.</h2>

                <p className="empty-state-description">
                  Find words and information inside the websites
                  stored in MiniWeb.
                </p>
              </div>
            )}

            {activeSection === 'publish' && (
              <div className="empty-state">
                <div className="empty-state-icon">+</div>

                <p className="eyebrow">MAKE YOUR MARK</p>

                <h2>Give your website a home.</h2>

                <p className="empty-state-description">
                  Publish a website by providing its address
                  and HTML content.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
