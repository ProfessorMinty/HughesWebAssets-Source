export type HubRecordType = "exploration" | "twwl" | "archive-doorway" | "video";
export type HubRecordStatus = "current" | "past" | "archived" | "coming-soon";

export interface HubPresentation {
  sectionKicker?: string;
  slotLabel?: string;
  visualBadge?: string;
  actionLabel?: string;
  statusLabel?: string;
}

export interface HubRecord {
  id: string;
  type: HubRecordType;
  status: HubRecordStatus;
  schoolYear: string;
  title: string;
  summary: string;
  pageUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  emoji: string;
  theme: string;
  animation: string;
  order: number;
  dates: { start?: string; end?: string; published?: string };
  learningPoints?: string[];
  tags?: string[];
  presentation?: HubPresentation;
  archiveSchoolYear?: string;
  completeness: "complete" | "incomplete" | "not-applicable";
  notice?: string;
  media?: {
    kind: "youtube";
    sourceUrl: string;
    embedUrl?: string;
  };
}

export interface HubManifest {
  schemaVersion: "1.0";
  contentVersion: string;
  page: {
    id: "classroom-explorations-hub";
    title: string;
    summary: string;
    routeUrl: string;
    currentSchoolYear: string;
    theme: string;
    museum: {
      kicker: string;
      pillars: string[];
      oathTitle: string;
      oath: string;
      footer: string;
      dividerImageUrl: string;
    };
  };
  schoolYears: Array<{
    id: string;
    display: string;
    status: "current" | "archived";
    order: number;
  }>;
  records: HubRecord[];
}

export interface HubMountOptions {
  manifestUrl?: string;
  layout?: "viewport" | "contained";
}
