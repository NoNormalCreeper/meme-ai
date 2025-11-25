export type MemeResult =
  | "🍭"
  | "艾斯比"
  | "无敌了"
  | "何意味"
  | "爆了"
  | "[续标识]"
  | "6"
  | string;

export interface AnalysisResponse {
  result: MemeResult;
  timestamp?: string;
}

export interface AnalysisError {
  error: string;
}

export type BackendResponse = AnalysisResponse | AnalysisError;
