import React from 'react';
import { Link } from 'react-router-dom';
import SkipLink from '../components/SkipLink';
import Header from '../components/Header';
import PhaseBanner from '../components/PhaseBanner';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Welcome to the Adoption Digital Platform</h1>
          <p className="govuk-body-l">
            This service helps manage adoption cases across England and Wales.
          </p>
          <p className="govuk-body">
            Use this service to:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>Submit adoption applications</li>
            <li>Track case progress</li>
            <li>Upload and manage documents</li>
            <li>Communicate with case workers</li>
          </ul>

          <Link to="/login" className="govuk-button govuk-button--start" data-module="govuk-button">
            Start now
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
            </svg>
          </Link>

        </main>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
