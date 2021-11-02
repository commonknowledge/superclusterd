import { Dimensions, Superclusterd, Viewport, ClusteredFeature } from ".";

export function useClusteredMapData<T>(
  supercluster: Superclusterd,
  dimensions: Dimensions,
  viewport: Viewport,
  url: string,
): ClusteredFeature<T>[] | undefined
