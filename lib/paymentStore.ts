/**
 * Academic Agent Studio - Real QRIS Payment & Subscription Store
 * Merchant: OXID PROJECT | NMID: ID1026598652240 | Kota Jambi
 */

import { 
  UserProfile, 
  getStoredUser, 
  saveStoredUser, 
  getRegisteredUsers, 
  saveRegisteredUsers 
} from "./supabase";

export interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan-mahasiswa",
    name: "Paket Skripsi & Magang Pro",
    badge: "Terpopuler Mahasiswa",
    price: 49000,
    period: "Akses Penuh / Semester",
    description: "Buka semua bab dokumen akademik tanpa batas halaman terkunci, bebas kuota judul, dan ekspor instan.",
    popular: true,
    features: [
      "Semua bab naskah terbuka 100% (Tanpa gembok)",
      "Akses Format Skripsi & PKL/Magang Semua Kampus",
      "Generator Judul AI Tanpa Batas (Unlimited)",
      "Ekspor DOCX A4 Standar Dikti & Kampus",
      "Pemeriksaan Konsistensi Bab & Sitasi Otomatis",
      "Bypass Batas 3 Trial Percobaan"
    ]
  },
  {
    id: "plan-peneliti",
    name: "Paket Peneliti & Dosen Unlimited",
    badge: "Fitur Terlengkap",
    price: 99000,
    period: "Akses Selamanya (Lifetime)",
    description: "Dukungan penuh untuk penulisan skripsi tingkat lanjut, tesis S2, laporan magang industri, dan jurnal publikasi.",
    features: [
      "Semua fitur Paket Mahasiswa Pro",
      "Ekspor PPTX Sidang Ujian Akademik Otomatis",
      "Analisis Bebas Plagiarisme & Parafrase AI",
      "Custom Format Guideline Kampus Mandiri",
      "Prioritas Komputasi AI Generatif Cepat",
      "Dukungan Konsultasi Akademik Superadmin"
    ]
  }
];

export interface PaymentTransaction {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: "QRIS";
  qrisNmid: string;
  qrisMerchant: string;
  senderName: string;
  senderBankOrWallet: string;
  senderPhone?: string;
  proofImageUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export const QRIS_MERCHANT_INFO = {
  merchantName: "OXID PROJECT",
  nmid: "ID1026598652240",
  city: "Kota Jambi",
  postalCode: "36142",
  staticPayload: "00020101021126570011ID.DANA.WWW011893600915303526827802090352682780303UMI51440014ID.CO.QRIS.WWW0215ID10265986522400303UMI5204899953033605802ID5912OXID PROJECT6010Kota Jambi6105361426304ABF4",
  imagePath: "/qris.jpeg"
};

const STORAGE_KEY = "academic_qris_transactions_v1";

// Helper CRC16 for EMVCo QRIS dynamic generation
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Generate Dynamic QRIS payload string with embedded exact amount
 */
export function buildDynamicQRISPayload(amount: number): string {
  let raw = QRIS_MERCHANT_INFO.staticPayload.trim();
  if (raw.includes("6304")) {
    raw = raw.substring(0, raw.lastIndexOf("6304"));
  }
  // Change tag 01 from 11 (static) to 12 (dynamic)
  raw = raw.replace("010211", "010212");

  // Tag 54: Amount in IDR
  const amtStr = Math.round(amount).toString();
  const amtLen = amtStr.length.toString().padStart(2, "0");
  const tag54 = `54${amtLen}${amtStr}`;

  // Insert before country tag (5802ID)
  const countryIdx = raw.indexOf("5802ID");
  if (countryIdx !== -1) {
    raw = raw.slice(0, countryIdx) + tag54 + raw.slice(countryIdx);
  } else {
    raw += tag54;
  }

  // Calculate CRC16 checksum
  const toChecksum = raw + "6304";
  const checksum = calculateCRC16(toChecksum);
  return toChecksum + checksum;
}

/**
 * Retrieve all payment transactions
 */
export function getStoredTransactions(): PaymentTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with sample verified transaction for superadmin dashboard preview
      const initialSeed: PaymentTransaction[] = [
        {
          id: "tx-sample-01",
          orderCode: "ORD-20261027-8812",
          userId: "user-demo-mahasiswa",
          userName: "Ahmad Rizky Pratama (UNP)",
          userEmail: "ahmad.rizky@student.unp.ac.id",
          planId: "plan-mahasiswa",
          planName: "Paket Skripsi & Magang Pro",
          amount: 49000,
          uniqueCode: 142,
          totalAmount: 49142,
          paymentMethod: "QRIS",
          qrisNmid: QRIS_MERCHANT_INFO.nmid,
          qrisMerchant: QRIS_MERCHANT_INFO.merchantName,
          senderName: "Ahmad Rizky",
          senderBankOrWallet: "Bank Mandiri Livin",
          senderPhone: "081234567890",
          proofImageUrl: "/qris.jpeg",
          status: "approved",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          approvedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read transactions from storage:", err);
    return [];
  }
}

/**
 * Save transactions to storage
 */
export function saveTransactions(transactions: PaymentTransaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error("Failed to save transactions to storage:", err);
  }
}

/**
 * Create a new QRIS payment transaction
 */
export function createQRISTransaction(params: {
  user: UserProfile;
  plan: PricingPlan;
  senderName: string;
  senderBankOrWallet: string;
  senderPhone?: string;
  proofImageUrl: string;
}): PaymentTransaction {
  const transactions = getStoredTransactions();
  
  // Random 3-digit unique code for easy transfer verification
  const uniqueCode = Math.floor(100 + Math.random() * 899);
  const totalAmount = params.plan.price + uniqueCode;
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const orderCode = `ORD-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTx: PaymentTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderCode,
    userId: params.user.id,
    userName: params.user.name || "Mahasiswa / User",
    userEmail: params.user.email,
    planId: params.plan.id,
    planName: params.plan.name,
    amount: params.plan.price,
    uniqueCode,
    totalAmount,
    paymentMethod: "QRIS",
    qrisNmid: QRIS_MERCHANT_INFO.nmid,
    qrisMerchant: QRIS_MERCHANT_INFO.merchantName,
    senderName: params.senderName,
    senderBankOrWallet: params.senderBankOrWallet,
    senderPhone: params.senderPhone,
    proofImageUrl: params.proofImageUrl,
    status: "pending",
    createdAt: now.toISOString()
  };

  transactions.unshift(newTx);
  saveTransactions(transactions);
  return newTx;
}

/**
 * Approve a transaction (Superadmin Action)
 * Automatically activates user's Pro subscription status and resets trial counters!
 */
export function approveQRISTransaction(txId: string): { success: boolean; tx?: PaymentTransaction } {
  const transactions = getStoredTransactions();
  const idx = transactions.findIndex(t => t.id === txId);
  if (idx === -1) return { success: false };

  const tx = transactions[idx];
  tx.status = "approved";
  tx.approvedAt = new Date().toISOString();
  saveTransactions(transactions);

  // Upgrade user in storage
  const users = getRegisteredUsers();
  const userIdx = users.findIndex((u: UserProfile) => u.id === tx.userId || u.email.toLowerCase() === tx.userEmail.toLowerCase());
  if (userIdx !== -1) {
    users[userIdx].isSubscribed = true;
    users[userIdx].subscriptionPlan = "pro_unlimited";
    users[userIdx].trialGeneratesLeft = 999999;
    users[userIdx].restrictedGeneratesLeft = 999999;
    saveRegisteredUsers(users);
  }

  // Also update active session if it matches
  const active = getStoredUser();
  if (active && (active.id === tx.userId || active.email.toLowerCase() === tx.userEmail.toLowerCase())) {
    active.isSubscribed = true;
    active.subscriptionPlan = "pro_unlimited";
    active.trialGeneratesLeft = 999999;
    active.restrictedGeneratesLeft = 999999;
    saveStoredUser(active);
  }

  return { success: true, tx };
}

/**
 * Reject a transaction (Superadmin Action)
 */
export function rejectQRISTransaction(txId: string, reason: string): { success: boolean; tx?: PaymentTransaction } {
  const transactions = getStoredTransactions();
  const idx = transactions.findIndex(t => t.id === txId);
  if (idx === -1) return { success: false };

  const tx = transactions[idx];
  tx.status = "rejected";
  tx.rejectionReason = reason;
  saveTransactions(transactions);
  return { success: true, tx };
}
