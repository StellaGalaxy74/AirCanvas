import { Point, CanvasObject } from '../store/useStore';

export function recognizeShape(points: Point[], color: string, brushSize: number, layerId: string): Partial<CanvasObject> | null {
  if (points.length < 10) return null; // Too short to be a shape

  const start = points[0];
  const end = points[points.length - 1];
  
  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const width = maxX - minX;
  const height = maxY - minY;
  
  // Is it closed?
  const isClosed = Math.hypot(start.x - end.x, start.y - end.y) < Math.max(width, height) * 0.3;
  
  if (isClosed) {
    const aspectRatio = width / height;
    // Check if it's roughly a circle
    if (aspectRatio > 0.7 && aspectRatio < 1.3) {
      // Could be a circle or square. Let's default to circle for this simplified heuristic.
      return {
        type: 'circle',
        x: minX + width / 2,
        y: minY + height / 2,
        radius: (width + height) / 4,
        stroke: color,
        strokeWidth: brushSize,
        fill: 'transparent',
        opacity: 1,
        layerId,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      };
    } else {
      // Rectangle
      return {
        type: 'rect',
        x: minX,
        y: minY,
        width,
        height,
        stroke: color,
        strokeWidth: brushSize,
        fill: 'transparent',
        opacity: 1,
        layerId,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      };
    }
  }

  return null;
}
