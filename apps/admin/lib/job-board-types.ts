export interface LiveTripJobDto {
  id: string;
  status: string;
  scheduledDate: string;
  expectedEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  machine: { name: string; category: string };
  operator: { name: string; phone: string };
  customer: { name: string; phone: string };
  partnerCompany: string;
  locationLabel: string;
}

export interface LiveJobsPayload {
  live: LiveTripJobDto[];
  recentCompleted: LiveTripJobDto[];
}
