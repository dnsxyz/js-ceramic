/**
 * Enum describing different modes for syncing a stream.
 */
export enum SyncOptions {
  /**
   *  If the stream is found in the node's in-memory cache or pin store, then return the cached version
   *  without performing any query to the pubsub network for the current tip.
   */
  PREFER_CACHE,

  /**
   *  Always query pubsub for the current tip for the stream and wait up to 'syncTimeoutSeconds'
   *   for the response, regardless of whether or not the stream is found in the node's cache
   */
  SYNC_ALWAYS,

  /**
   * Do not query pubsub for the new tip in any circumstance. This means that if the stream
   * is not in cache or the pin store, then only the genesis commit for the stream will be returned
   */
  NEVER_SYNC,
}

interface BasicLoadOpts {
  /**
   * Controls the behavior related to syncing a stream to the most recent tip.
   */
  sync?: SyncOptions

  /**
   * How long to wait for a response from pubsub when syncing a stream.
   */
  syncTimeoutSeconds?: number
}

/**
 * Extra options passed as part of operations that load a stream
 */
export interface LoadOpts extends BasicLoadOpts {
  /**
   * Load a previous version of the stream based on unix timestamp
   */
  atTime?: number
}

/**
 * Extra options passed as part of operations that perform updates to streams
 */
export interface UpdateOpts {
  /**
   * Whether or not to request an anchor after performing the operation.
   */
  anchor?: boolean

  /**
   * Whether or not to publish the current tip commit to the pubsub channel after performing
   * the operation.
   */
  publish?: boolean
}

/**
 * Extra options passed as part of operations that create streams
 */
export interface CreateOpts extends UpdateOpts, BasicLoadOpts {}
