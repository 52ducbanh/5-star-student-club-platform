export interface MediaStorage {
  saveFile(buffer: Buffer, originalName: string): Promise<string>;
}
