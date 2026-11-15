declare module "qrcode" {
  export interface QRCode {
    version: number;
    modules: { size: number };
  }

  export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface RenderOptions {
    errorCorrectionLevel?: ErrorCorrectionLevel;
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }

  export function create(
    text: string,
    options?: { errorCorrectionLevel?: ErrorCorrectionLevel },
  ): QRCode;

  export function toDataURL(text: string, options?: RenderOptions): Promise<string>;
}
