export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export interface LogMetadata {
  [key: string]: unknown;
}