interface LeadPayload {
  email: string;
  name: string;
  company: string;
  jobTitle: string;
  toolUsed: string | null;
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  const formId = process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID;

  const [firstName, ...rest] = payload.name.trim().split(" ");
  const lastName = rest.join(" ") || "";
  const toolLabel = payload.toolUsed ?? "unknown";

  // Log always (visible en consola del navegador / analytics)
  console.log("[WTA_LEAD]", {
    email: payload.email,
    name: payload.name,
    company: payload.company,
    jobTitle: payload.jobTitle,
    toolUsed: toolLabel,
    submittedAt: new Date().toISOString(),
  });

  if (!portalId || !formId) return;

  await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [
          { name: "email", value: payload.email },
          { name: "firstname", value: firstName },
          { name: "lastname", value: lastName },
          { name: "company", value: payload.company },
          { name: "jobtitle", value: payload.jobTitle },
          { name: "message", value: `Herramienta: ${toolLabel}` },
        ],
        context: { pageUri: window.location.href, pageName: document.title },
      }),
    }
  );
}
