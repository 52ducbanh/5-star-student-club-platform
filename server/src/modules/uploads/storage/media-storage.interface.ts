export interface MediaStorage {
  saveFile(buffer: Buffer, identifier?: string): Promise<string>;
  saveCardFile?(publicStarId: string, nickname: string, buffer: Buffer): Promise<string>;
  deleteCardFileByStarId?(publicStarId: string): Promise<void>;
}
