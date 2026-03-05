"use client";

import Script from "next/script";

/**
 * Simulated tracking scripts for IP intelligence and conversational AI.
 * In production, replace with real API keys and endpoints.
 */
export function TrackingScripts() {
  return (
    <>
      {/* Leadfeeder (Dealfront) - IP-based company identification */}
      <Script
        id="leadfeeder-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // [MOCK] Leadfeeder / Dealfront Tracker
            // Replace with real Dealfront snippet in production
            (function() {
              window.__dealfront = {
                initialized: true,
                trackPageView: function() {},
                identifyCompany: function() {
                  return { company: 'Mock Corp', industry: 'Manufacturing', country: 'ES' };
                }
              };
            })();
          `,
        }}
      />

      {/* Knock AI - Conversational lead capture in real-time */}
      <Script
        id="knock-ai-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // [MOCK] Knock AI - Real-time conversational capture
            // Replace with real Knock AI snippet in production
            (function() {
              window.__knockAI = {
                initialized: true,
                triggerConversation: function() {},
                trackEngagement: function() {}
              };
            })();
          `,
        }}
      />
    </>
  );
}
