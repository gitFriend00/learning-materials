export interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string[] }[];
}

export interface SyncItem {
  _id?: string;
  fileName: string;
  ConstructionCode: string;
  filingMark: string;
  existsInDb: boolean;
  existsInFs: boolean;
  isMissing: boolean;
}