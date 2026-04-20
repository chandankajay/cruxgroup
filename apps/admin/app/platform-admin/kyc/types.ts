/** Serializable row for the KYC approval queue (client + server). */
export interface KycQueuePartnerRow {
  id: string;
  companyName: string;
  address: string;
  baseLocation: string | null;
  maxRadius: number;
  updatedAt: string;
  panNumber: string | null;
  panDocUrl: string | null;
  aadhaarNumber: string | null;
  aadhaarDocUrl: string | null;
  gstNumber: string | null;
  bankAccountNumber: string | null;
  bankIfscCode: string | null;
  cancelledChequeUrl: string | null;
  user: {
    phoneNumber: string | null;
    name: string;
    email: string | null;
  };
  equipmentCount: number;
}
