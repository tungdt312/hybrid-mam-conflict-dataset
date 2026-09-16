type ModalityType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'MIX';
type LanguageType = 'vi' | 'en';
export type DecisionType = 'PASS' | 'REVIEW' | 'BLOCK';
export type LabelType = 0 | 1 | 2;

export interface EvaluationItem {
  label: LabelType | null;
  note: string;
}
export interface SampleMetadata {
  language: LanguageType;
}

export interface RawInputs {
  text: string | null;
  image_path: string | null;
  audio_path: string | null;
  video_path: string | null;
}

export interface VisionContext {
  ocr_text: string;
  image_caption: string;
  detected_objects: string[];
}

export interface AudioContext {
  duration_seconds: number;
  transcript: string;
}

export interface VideoContext {
  duration_seconds: number;
  video_caption: string;
}

export interface AgentExtractedContext {
  vision_context: VisionContext | null;
  audio_context: AudioContext | null;
  video_context: VideoContext | null;
}

export interface EvidenceSource {
  modality: ModalityType | 'OCR';
  locator_type: 'char_range' | 'bbox_2d' | 'timestamp';
  locator: {
    char_start: string | null;
    char_end: string | null;
    box_2d: number[] | null;
    start_second: number | null;
    end_second: number | null;
  },
  supports_label: LabelType;
}

export interface ReasoningLogItem {
  time_stamp: string;
  node: string;
  input: string;
  output: string;
  action: string;
}

export interface GoldAnnotation {
  decision: DecisionType;
  label: LabelType | null;
  evidence_sources: EvidenceSource[];
  reasoning_log: ReasoningLogItem[];
  explanation_vi: string;
}

export interface SampleData {
  _id: string;
  modality_type: ModalityType;
  metadata: SampleMetadata;
  raw_inputs: RawInputs;
  agent_extracted_context: AgentExtractedContext;
  gold_annotation: GoldAnnotation;
  eval1: EvaluationItem;
  eval2: EvaluationItem;
}
export interface MediaData {
  type: "image" | "video";
  url: string;
  name: string;
  size?: number;
  description?: string;
}