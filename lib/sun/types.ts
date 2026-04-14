export type SunStatus = 'sunny' | 'partly' | 'shade' | 'night';

export interface SunPosition {
  altitude: number;  // degrees above horizon
  azimuth: number;   // degrees from North, clockwise
}

export interface SunScore {
  score: number;      // 0-100
  status: SunStatus;
  sunPosition: SunPosition;
  weatherFactor: number;
  cloudCover: number;
}

export interface HourlySunForecast {
  hour: number;       // 0-23
  time: string;       // ISO string
  score: number;
  status: SunStatus;
  cloudCover: number;
  temperature: number;
}

export interface Cafe {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  seatingOrientation?: string;
  sunScore?: SunScore;
  bestSunWindow?: { startHour: number; endHour: number; avgScore: number };
  hourlySunForecast?: HourlySunForecast[];
  votesSunny?: number;
  votesShade?: number;
}
