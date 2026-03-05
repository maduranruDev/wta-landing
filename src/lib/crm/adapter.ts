import type { QualifiedLead, CRMSyncResult } from "@/lib/types";

/**
 * Simulates syncing a qualified lead to Zoho CRM.
 * Zoho is preferred for complex customs flows using Blueprints and Deluge scripts.
 */
export async function syncToZoho(lead: QualifiedLead): Promise<CRMSyncResult> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const externalId = `ZOHO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      provider: "zoho",
      externalId,
      message: `Lead synced to Zoho CRM. Blueprint triggered for ${lead.source}. ID: ${externalId}`,
    };
  } catch {
    return {
      success: false,
      provider: "zoho",
      message: `Failed to sync lead (${lead.lead.email}) to Zoho CRM.`,
    };
  }
}

/**
 * Simulates syncing a qualified lead to HubSpot CRM.
 * HubSpot is used for simpler inbound marketing flows.
 */
export async function syncToHubSpot(lead: QualifiedLead): Promise<CRMSyncResult> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    const externalId = `HS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      provider: "hubspot",
      externalId,
      message: `Lead synced to HubSpot. Inbound workflow activated. Contact ID: ${externalId}`,
    };
  } catch {
    return {
      success: false,
      provider: "hubspot",
      message: `Failed to sync lead (${lead.lead.email}) to HubSpot.`,
    };
  }
}

/**
 * Determines which CRM to sync based on lead complexity and source.
 * Complex customs flows → Zoho (Blueprints + Deluge)
 * Simple inbound → HubSpot
 */
export async function syncLead(lead: QualifiedLead): Promise<CRMSyncResult[]> {
  const results: CRMSyncResult[] = [];

  // Always sync to HubSpot for inbound tracking
  const hubspotResult = await syncToHubSpot(lead);
  results.push(hubspotResult);

  // Sync to Zoho for high-intent leads or complex customs scenarios
  if (
    lead.source === "landed_cost" ||
    lead.source === "risk_assessment" ||
    lead.score >= 70
  ) {
    const zohoResult = await syncToZoho(lead);
    results.push(zohoResult);
  }

  return results;
}
