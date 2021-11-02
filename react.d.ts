import { Dimensions, Supercluster, Viewport } from ".";

export function useClusteredMapData<T>(
  supercluster: Supercluster,
  dimensions: Dimensions,
  viewport: Viewport,
  getUrl: () => string,
  deps: unknown[] = []
): Clusterable<T> | undefined
