import { Track, TrackClassification } from '../types/Track';
import { validateTrack } from '../utils/trackValidation';

export class TrackService {
  private static instance: TrackService;
  private officialTracks: Track[] = [];
  private customTracks: Track[] = [];
  private readonly STORAGE_KEY = 'fittipaldi_custom_tracks';

  private constructor() {
    // Initialize tracks
    this.loadCustomTracks();
  }

  public static getInstance(): TrackService {
    if (!TrackService.instance) {
      TrackService.instance = new TrackService();
    }
    return TrackService.instance;
  }

  public loadCustomTracks(): Track[] {
    try {
      console.log('Loading custom tracks from localStorage...');
      const storedTracks = localStorage.getItem(this.STORAGE_KEY);
      if (!storedTracks) {
        console.log('No custom tracks found in localStorage');
        this.customTracks = [];
        return [];
      }

      const parsedTracks = JSON.parse(storedTracks);
      if (!Array.isArray(parsedTracks)) {
        console.warn('Invalid tracks data in localStorage');
        this.customTracks = [];
        return [];
      }

      this.customTracks = parsedTracks.map((track: Track) => ({
        ...track,
        classification: 'custom' as TrackClassification
      }));

      // Validate each track
      this.customTracks = this.customTracks.map(track => {
        const validation = validateTrack(track);
        if (!validation.isValid) {
          return {
            ...track,
            classification: 'invalid' as TrackClassification,
            validationErrors: validation.errors
          };
        }
        return track;
      });

      console.log(`Loaded ${this.customTracks.length} custom tracks`);
      return this.customTracks;
    } catch (error) {
      console.error('Failed to load custom tracks:', error);
      this.customTracks = [];
      return [];
    }
  }

  public async loadOfficialTracks(): Promise<Track[]> {
    try {
      console.log('Loading official tracks...');
      const tracksModule = await import('../data/tracks/official.json');
      const tracksData = (tracksModule as unknown as { default: Track[] }).default;
      
      this.officialTracks = tracksData.map(track => ({
        ...track,
        classification: 'official' as TrackClassification,
        createdAt: new Date(track.createdAt).toISOString()
      }));

      // Validate each track
      this.officialTracks = this.officialTracks.map(track => {
        const validation = validateTrack(track);
        if (!validation.isValid) {
          return {
            ...track,
            classification: 'invalid' as TrackClassification,
            validationErrors: validation.errors
          };
        }
        return track;
      });

      console.log(`Loaded ${this.officialTracks.length} official tracks`);
      return this.officialTracks;
    } catch (error) {
      console.error('Failed to load official tracks:', error);
      return [];
    }
  }

  public async loadAllTracks(): Promise<Track[]> {
    try {
      const officialTracks = await this.loadOfficialTracks();
      const customTracks = this.loadCustomTracks();
      return [...officialTracks, ...customTracks];
    } catch (error) {
      console.error('Failed to load all tracks:', error);
      return [];
    }
  }

  public saveCustomTrack(track: Track): void {
    try {
      // Load existing tracks
      const tracks = this.loadCustomTracks();
      
      // Check if track with same name exists
      const existingIndex = tracks.findIndex(t => t.name === track.name);
      if (existingIndex >= 0) {
        // Update existing track
        tracks[existingIndex] = track;
      } else {
        // Add new track
        tracks.push(track);
      }

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tracks));
      
      // Update in-memory tracks
      this.customTracks = tracks;
      
      console.log(`Successfully saved track: ${track.name}`);
    } catch (error) {
      console.error('Failed to save custom track:', error);
      throw error;
    }
  }

  public getCustomTracks(): Track[] {
    return this.customTracks;
  }

  public getAllTracks(): Track[] {
    return [...this.officialTracks, ...this.customTracks];
  }

  public getTrackById(id: string): Track | undefined {
    // First check custom tracks
    const customTrack = this.customTracks.find(track => track.id === id);
    if (customTrack) {
      return customTrack;
    }

    // Then check official tracks
    const officialTrack = this.officialTracks.find(track => track.id === id);
    if (officialTrack) {
      return officialTrack;
    }

    // Finally check debug tracks
    const debugTracks = this.loadDebugTracks();
    return debugTracks.find(track => track.id === id);
  }

  public loadDebugTracks(): Track[] {
    const debugTracks: Track[] = [
      {
        id: 'debug-oval',
        name: 'Debug Oval',
        segments: [
          { 
            id: 'straight-1',
            type: 'straight',
            startPoint: { x: 100, y: 100 },
            endPoint: { x: 500, y: 100 },
            width: 20,
            length: 400,
            position: { x: 100, y: 100 }
          },
          { 
            id: 'curve-1',
            type: 'curve',
            startPoint: { x: 500, y: 100 },
            endPoint: { x: 500, y: 300 },
            width: 20,
            length: 200,
            angle: 90,
            position: { x: 500, y: 100 }
          },
          { 
            id: 'straight-2',
            type: 'straight',
            startPoint: { x: 500, y: 300 },
            endPoint: { x: 100, y: 300 },
            width: 20,
            length: 400,
            position: { x: 500, y: 300 }
          },
          { 
            id: 'curve-2',
            type: 'curve',
            startPoint: { x: 100, y: 300 },
            endPoint: { x: 100, y: 100 },
            width: 20,
            length: 200,
            angle: 90,
            position: { x: 100, y: 300 }
          }
        ],
        checkpoints: [
          { id: 'cp-1', position: { x: 300, y: 100 }, angle: 0, order: 1 },
          { id: 'cp-2', position: { x: 500, y: 200 }, angle: 90, order: 2 },
          { id: 'cp-3', position: { x: 300, y: 300 }, angle: 180, order: 3 },
          { id: 'cp-4', position: { x: 100, y: 200 }, angle: 270, order: 4 }
        ],
        surface: 'asphalt',
        difficulty: 'beginner',
        commentary: 'Simple oval track for testing',
        classification: 'custom',
        createdAt: new Date().toISOString(),
        author: 'System'
      }
    ];
    return debugTracks;
  }
} 