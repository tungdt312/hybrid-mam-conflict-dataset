export type LabelType = "SAFE" | "OFFENSIVE" | "HATE";

export interface Evaluation {
  label: LabelType | null;
  note: string;
}

export interface MediaData {
  type: "image" | "video";
  url: string;
  name: string;
  size?: number;
  description?: string;
}

export interface DatasetItem {
  _id: string;
  text: string;
  mediaDescription?: string;
  media?: MediaData | null;
  eval1: Evaluation;
  eval2: Evaluation;
  createdAt: string;
  updatedAt?: string;
}
