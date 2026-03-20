import fs from "node:fs";
import path from "node:path";

// 스크린샷 같은 실행 산출물을 파일로 저장하는 최소 단위 저장소다.
export class ArtifactStore {
  private readonly artifactDir = path.join(process.cwd(), "artifacts");

  constructor() {
    if (!fs.existsSync(this.artifactDir)) {
      fs.mkdirSync(this.artifactDir, { recursive: true });
    }
  }

  getAbsolutePath(fileName: string): string {
    return path.join(this.artifactDir, fileName);
  }

  toPublicPath(fileName: string): string {
    return `/artifacts/${fileName}`;
  }
}
