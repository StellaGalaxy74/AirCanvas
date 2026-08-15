import { create } from 'zustand';

export type AppMode = 'HOME' | 'CALIBRATION' | 'WORKSPACE';
export type WorkspaceMode = '2D' | '3D' | 'PARTICLES';
export type Tool = 'select' | 'draw' | 'circle' | 'rect' | 'triangle' | 'star' | 'line' | 'eraser';
export type Gesture = 'IDLE' | 'DRAWING' | 'PINCHING' | 'ERASING' | 'OBJECT_MODE' | 'PAUSED' | 'MENU' | 'TWO_HAND_3D' | 'THUMBS_UP' | 'THUMBS_DOWN';

export interface Point { x: number; y: number; z?: number; }

export interface BaseObject {
  id: string;
  type: string;
  layerId: string;
  x: number; 
  y: number;
  z?: number;
  rotation: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scaleX: number;
  scaleY: number;
  scaleZ?: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  opacity: number;
}

export interface PathObject extends BaseObject {
  type: 'path';
  points: Point[];
}

export interface RectObject extends BaseObject {
  type: 'rect';
  width: number;
  height: number;
}

export interface CircleObject extends BaseObject {
  type: 'circle';
  radius: number;
}

export interface LineObject extends BaseObject {
  type: 'line';
  x2: number;
  y2: number;
}

export type CanvasObject = PathObject | RectObject | CircleObject | LineObject;

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

interface AppState {
  appMode: AppMode;
  workspaceMode: WorkspaceMode;
  objects: CanvasObject[];
  layers: Layer[];
  activeLayerId: string;
  selectedObjectId: string | null;
  tool: Tool;
  color: string;
  brushSize: number;
  fillColor: string;
  opacity: number;
  
  // Hand tracking state
  handMode: boolean;
  cameraReady: boolean;
  cameraOn: boolean;
  gesture: Gesture;
  cursor: Point | null; // normalized 0-1
  secondaryCursor: Point | null;
  
  // Undo/Redo
  history: CanvasObject[][];
  historyIndex: number;

  // Settings
  cursorSmoothing: number;
  gestureConfidenceFrames: number;
  pinchThreshold: number;

  setSettings: (settings: Partial<{ cursorSmoothing: number, gestureConfidenceFrames: number, pinchThreshold: number }>) => void;

  // Actions
  setAppMode: (mode: AppMode) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setHandMode: (mode: boolean) => void;
  setCameraReady: (ready: boolean) => void;
  setCameraOn: (on: boolean) => void;
  setGesture: (gesture: Gesture) => void;
  setCursor: (cursor: Point | null) => void;
  setSecondaryCursor: (cursor: Point | null) => void;
  
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  setSelectedObject: (id: string | null) => void;
  
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  appMode: 'HOME',
  workspaceMode: '2D',
  objects: [],
  layers: [{ id: 'layer-1', name: 'Background', visible: true }],
  activeLayerId: 'layer-1',
  selectedObjectId: null,
  tool: 'draw',
  color: '#ffffff',
  brushSize: 5,
  fillColor: 'transparent',
  opacity: 1,
  
  handMode: false,
  cameraReady: false,
  cameraOn: false,
  gesture: 'IDLE',
  cursor: null,
  secondaryCursor: null,

  history: [[]],
  historyIndex: 0,

  cursorSmoothing: 0.6,
  gestureConfidenceFrames: 5,
  pinchThreshold: 0.05,

  setSettings: (settings) => set(settings),
  setAppMode: (mode) => set({ appMode: mode }),
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),

  setTool: (tool) => set({ tool, selectedObjectId: tool === 'select' ? get().selectedObjectId : null }),
  setColor: (color) => {
    set({ color });
    const { selectedObjectId, objects } = get();
    if (selectedObjectId) {
      get().updateObject(selectedObjectId, { stroke: color });
    }
  },
  setFillColor: (fillColor) => {
    set({ fillColor });
    const { selectedObjectId } = get();
    if (selectedObjectId) {
      get().updateObject(selectedObjectId, { fill: fillColor });
    }
  },
  setBrushSize: (brushSize) => {
    set({ brushSize });
    const { selectedObjectId } = get();
    if (selectedObjectId) {
      get().updateObject(selectedObjectId, { strokeWidth: brushSize });
    }
  },
  setOpacity: (opacity) => {
    set({ opacity });
    const { selectedObjectId } = get();
    if (selectedObjectId) {
      get().updateObject(selectedObjectId, { opacity });
    }
  },
  setHandMode: (handMode) => set({ handMode }),
  setCameraReady: (cameraReady) => set({ cameraReady }),
  setCameraOn: (cameraOn) => set({ cameraOn }),
  setGesture: (gesture) => set({ gesture }),
  setCursor: (cursor) => set({ cursor }),
  setSecondaryCursor: (cursor) => set({ secondaryCursor: cursor }),
  
  addObject: (obj) => {
    set((state) => ({ objects: [...state.objects, obj] }));
    get().saveHistory();
  },
  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)) as CanvasObject[],
    }));
  },
  deleteObject: (id) => {
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
    }));
    get().saveHistory();
  },
  setSelectedObject: (id) => set({ selectedObjectId: id }),
  
  saveHistory: () => {
    const { objects, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(objects);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ historyIndex: historyIndex - 1, objects: history[historyIndex - 1] });
    }
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1, objects: history[historyIndex + 1] });
    }
  }
}));
