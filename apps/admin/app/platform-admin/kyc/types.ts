/** Serializable row for the KYC approval queue (client + server). */
export interface KycQueuePartnerRow {
  id: string;
  companyName: string;
  address: string;
  baseLocation: string | null;
  maxRadius: number;
  updatedAt: string;
  panNumber: string | null;
  aadhaarNumber: string | null;
  gstNumber: string | null;
  bankAccountNumber: string | null;
  bankIfscCode: string | null;
  /** Signed proxy paths — never raw Vercel Blob URLs in the browser. */
  panDocViewPath: string | null;
  aadhaarDocViewPath: string | null;
  cancelledChequeViewPath: string | null;
  user: {
    phoneNumber: string | null;
    name: string;
    email: string | null;
  };
  equipmentCount: number;
}
