import type { Finding } from "../domain/contracts";

// v1 검증기는 단순하지만, 최종 리포트에 high severity가 바로 올라가는 것을 통제한다.
export class Verifier {
  verify(findings: Finding[]): Finding[] {
    return findings.map((finding) => ({
      ...finding,
      verified: finding.severity === "high" || finding.confidence >= 0.78,
    }));
  }
}
