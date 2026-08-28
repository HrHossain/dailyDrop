export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T | null;
  public readonly meta?: Record<string, unknown>;

  constructor({
    statusCode = 200,
    message = 'Success',
    data = null,
    meta,
  }: {
    statusCode?: number;
    message?: string;
    data?: T | null;
    meta?: Record<string, unknown>;
  }) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}
