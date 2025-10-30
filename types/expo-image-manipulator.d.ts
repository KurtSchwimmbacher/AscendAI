declare module 'expo-image-manipulator' {
  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
    WEBP = 'webp',
  }

  export type Action =
    | { rotate: number }
    | { flip: { vertical?: boolean; horizontal?: boolean } }
    | { resize: { width?: number; height?: number } };

  export interface ManipulateOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export interface ManipulateResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export function manipulateAsync(
    uri: string,
    actions?: Action[],
    options?: ManipulateOptions
  ): Promise<ManipulateResult>;

  export const SaveFormat: typeof SaveFormat;
}

