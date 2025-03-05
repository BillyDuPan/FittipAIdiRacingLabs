export type TrackClassification = 'official' | 'custom' | 'invalid';
export type TrackSurface = 'asphalt' | 'dirt' | 'mixed';
export type TrackDifficulty = 'beginner' | 'intermediate' | 'expert' | 'master';

export interface Point2D {
  x: number;
  y: number;
}

export interface TrackSegment {
  id: string;
  type: 'straight' | 'curve' | 'chicane';
  width: number;
  startPoint: Point2D;
  endPoint: Point2D;
  controlPoint1?: Point2D;  // For curves (Bezier control point)
  controlPoint2?: Point2D;  // For curves (Bezier control point)
  length: number;
  position: Point2D;
  angle?: number;  // For curves
  direction?: 'left' | 'right';  // For curves and chicanes
  sectorColor?: string;  // Color indicating the sector
}

export interface TrackCheckpoint {
  id: string;
  position: Point2D;
  angle: number;
  order: number;
  sectorColor?: string;  // Color indicating the sector
}

export interface Track {
  id: string;
  name: string;
  segments: TrackSegment[];
  checkpoints: TrackCheckpoint[];
  surface: TrackSurface;
  difficulty: TrackDifficulty;
  author: string;
  createdAt: string;
  commentary?: string;
  classification: TrackClassification;
  validationErrors?: string[];
  sectors?: number;  // Number of sectors in the track
} 