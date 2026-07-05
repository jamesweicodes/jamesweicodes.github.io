import {
  contactContent,
  executionPlaybookContent,
  experienceContent,
  mediaContent,
  projectsContent,
  siteConfig,
  techStack,
} from "@/lib/site-data";

function formatBlock(title: string, body: string): string {
  return `**${title}**\n${body}`;
}

function teslaResponse(): string {
  const role = experienceContent.roles[0];
  return [
    formatBlock(
      "Role",
      `${role.title} — ${experienceContent.company}, ${experienceContent.division} (${role.period})`
    ),
    formatBlock(
      "Problem",
      "Manual AR workflows, spreadsheet-driven collections ops, and fragmented reporting at enterprise scale."
    ),
    formatBlock(
      "Execution",
      role.highlights.map((h) => `• ${h}`).join("\n")
    ),
    formatBlock(
      "Yield / Impact",
      "Systemized collections platform, centralized compliance reporting, measurable AR reduction via behavioral analytics, and customer-facing payment features at scale."
    ),
  ].join("\n\n");
}

function projectsResponse(): string {
  const blocks = projectsContent.map((p) => {
    const status =
      p.status === "live" ? "Live demo available" : p.status === "pipeline" ? "Pipeline" : "Blueprint";
    const link = p.href ? `\nDemo: ${p.href}` : "";
    return formatBlock(
      p.title,
      `**Problem:** ${p.description.split("—")[0]?.trim() || p.description}\n**Execution:** Built with ${p.stack.join(", ")}.\n**Yield / Impact:** ${status}.${link}`
    );
  });
  return ["**Engineering & AI Portfolio**", ...blocks].join("\n\n");
}

function playbookResponse(): string {
  const missions = executionPlaybookContent.missions
    .map((mission) => {
      const phases = mission.phases.map((phase) => phase.name).join(" -> ");
      return `• **${mission.label}** — ${mission.headline}. Signal: ${mission.signal}. Loop: ${phases}. Yield: ${mission.outcome}`;
    })
    .join("\n");

  return [
    formatBlock(executionPlaybookContent.title, executionPlaybookContent.description),
    formatBlock("Mission Profiles", missions),
    formatBlock(
      "How to use it",
      "Open the Execution Playbook section, choose a mission type, and copy the generated briefing for a concise Problem / Execution / Yield summary."
    ),
  ].join("\n\n");
}

function mediaResponse(): string {
  const ventures = mediaContent.ventures
    .map((v) => `• **${v.title}** — ${v.description} (${v.platforms.join(", ")})`)
    .join("\n");
  return [
    formatBlock("Media Operations", ventures),
    formatBlock("Gear Stack", mediaContent.gear.join(" · ")),
    formatBlock(
      "Yield / Impact",
      "Premium brand storytelling and finance-focused content optimized for YouTube, TikTok, and commercial delivery."
    ),
  ].join("\n\n");
}

function contactResponse(): string {
  return [
    formatBlock("Direct Contact", `${siteConfig.email}`),
    formatBlock(
      "Links",
      `• LinkedIn: ${siteConfig.links.linkedin}\n• GitHub: ${siteConfig.links.github}\n• YouTube: ${siteConfig.links.youtube}`
    ),
    formatBlock("Credentials", `${contactContent.education}\n${contactContent.certifications}`),
    formatBlock("Location", siteConfig.location),
  ].join("\n\n");
}

function aboutResponse(): string {
  return [
    formatBlock("Profile", `${siteConfig.name} — ${siteConfig.tagline}`),
    formatBlock("Methodology", siteConfig.theme),
    formatBlock("Core Stack", techStack.join(" · ")),
    formatBlock(
      "Yield / Impact",
      "Converts unstructured operational problems into durable, automated systems across enterprise finance, AI tooling, and media production."
    ),
  ].join("\n\n");
}

function fallbackResponse(): string {
  return [
    "**Nexus Context AI**",
    "I can provide structured briefings on:",
    "• Tesla Financial Services program delivery",
    "• James's Execution Playbook methodology",
    "• AI / automation project portfolio",
    "• Videography & content operations",
    "• Contact and credentials",
    "",
    "Try: \"What does James do at Tesla?\" or \"Walk me through his AI projects\"",
    "",
    "Live demo: /lab/script-generator/",
  ].join("\n");
}

export function generateNexusResponse(query: string): string {
  const q = query.toLowerCase();

  if (/tesla|ar |accounts receivable|compliance|reporting|captive|financial services|program manager/.test(q)) {
    return teslaResponse();
  }
  if (/playbook|method|methodology|execution|systemize|operating mode|mission/.test(q)) {
    return playbookResponse();
  }
  if (/project|ai |automation|python|gemini|n8n|lab|script|real estate|event space|pipeline/.test(q)) {
    return projectsResponse();
  }
  if (/video|media|cinematography|wealth engine|youtube|tiktok|sony|dji|gear/.test(q)) {
    return mediaResponse();
  }
  if (/contact|email|reach|hire|linkedin|connect|recruit/.test(q)) {
    return contactResponse();
  }
  if (/who|about|james|background|summary|overview/.test(q)) {
    return aboutResponse();
  }

  return fallbackResponse();
}

export async function queryNexus(message: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_NEXUS_API_URL;

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/nexus/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const data = (await res.json()) as { status: string; message: string };
        return data.message;
      }
    } catch {
      /* fall through to local engine */
    }
  }

  return generateNexusResponse(message);
}
