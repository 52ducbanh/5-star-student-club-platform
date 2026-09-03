export interface MediaStorage {
  saveFile(buffer: Buffer, identifier?: string): Promise<string>;
}
