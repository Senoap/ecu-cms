declare module 'heic-decode' {
  export interface HeicDecoded {
    width: number
    height: number
    data: Uint8Array
  }

  export default function decode(options: {
    buffer: Uint8Array | Buffer
  }): Promise<HeicDecoded>
}
