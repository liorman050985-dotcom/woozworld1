export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class Pathfinding {
  public static findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isWalkable: (x: number, y: number) => boolean,
    gridWidth: number,
    gridHeight: number
  ): { x: number; y: number }[] {
    if (startX === targetX && startY === targetY) {
      return [];
    }

    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, targetX, targetY),
      f: this.heuristic(startX, startY, targetX, targetY),
      parent: null
    };

    openSet.push(startNode);
    const key = (x: number, y: number) => `${x},${y}`;

    while (openSet.length > 0) {
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet.splice(lowestIndex, 1)[0];
      closedSet.add(key(current.x, current.y));

      if (current.x === targetX && current.y === targetY) {
        const path: { x: number; y: number }[] = [];
        let curr: PathNode | null = current;
        while (curr && curr.parent) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      const neighbors = [
        { x: current.x + 1, y: current.y, cost: 1 },
        { x: current.x - 1, y: current.y, cost: 1 },
        { x: current.x, y: current.y + 1, cost: 1 },
        { x: current.x, y: current.y - 1, cost: 1 },
        { x: current.x + 1, y: current.y + 1, cost: 1.414 },
        { x: current.x - 1, y: current.y - 1, cost: 1.414 },
        { x: current.x + 1, y: current.y - 1, cost: 1.414 },
        { x: current.x - 1, y: current.y + 1, cost: 1.414 }
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x < 0 ||
          neighbor.x >= gridWidth ||
          neighbor.y < 0 ||
          neighbor.y >= gridHeight
        ) {
          continue;
        }

        if (closedSet.has(key(neighbor.x, neighbor.y))) {
          continue;
        }

        const isGoal = neighbor.x === targetX && neighbor.y === targetY;
        if (!isGoal && !isWalkable(neighbor.x, neighbor.y)) {
          continue;
        }

        if (neighbor.x !== current.x && neighbor.y !== current.y) {
          const adj1 = isWalkable(neighbor.x, current.y);
          const adj2 = isWalkable(current.x, neighbor.y);
          if (!adj1 && !adj2) {
            continue;
          }
        }

        const gScore = current.g + neighbor.cost;
        let existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existing) {
          const hScore = this.heuristic(neighbor.x, neighbor.y, targetX, targetY);
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h: hScore,
            f: gScore + hScore,
            parent: current
          };
          openSet.push(newNode);
        } else if (gScore < existing.g) {
          existing.g = gScore;
          existing.f = gScore + existing.h;
          existing.parent = current;
        }
      }
    }

    return [];
  }

  private static heuristic(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return Math.sqrt(dx * dx + dy * dy);
  }
}
