// src/types/index.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface PurchaseRequest {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_by: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
  current_level: number;
  extraction_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  vendor_name: string;
  three_way_match_status: 'PENDING' | 'MATCHED' | 'DISCREPANCY';
}

export interface ApprovalAction {
  id: number;
  actor: {
    first_name: string;
    last_name: string;
  };
  action: 'APPROVED' | 'REJECTED';
  level: number;
  acted_at: string;
  comment?: string;
}