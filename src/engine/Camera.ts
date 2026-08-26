export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public zoom: number = 1.0;
  public targetZoom: number = 1.0;

  constructor() {}

  public follow(targetScreenX: number, targetScreenY: number, smooth: boolean = true) {
    this.targetX = targetScreenX;
    this.targetY = targetScreenY;

    if (!smooth) {
      this.x = this.targetX;
      this.y = this.targetY;
    }
  }

  public update(deltaTime: number) {
    const lerpFactor = Math.min(1, deltaTime * 6);
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;
    this.zoom += (this.targetZoom - this.zoom) * lerpFactor;
  }

  public setZoom(zoom: number) {
    this.targetZoom = Math.max(0.6, Math.min(1.6, zoom));
  }

  public applyTransform(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  public screenToWorld(
    clientX: number,
    clientY: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    const centeredX = clientX - canvasWidth / 2;
    const centeredY = clientY - canvasHeight / 2;
    const worldX = centeredX / this.zoom + this.x;
    const worldY = centeredY / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }
}
