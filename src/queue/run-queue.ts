type QueueTask = {
  id: string;
  run: () => Promise<void>;
};

// v1.5의 in-process queue다.
// 아직 외부 worker는 없지만, HTTP 요청 처리와 브라우저 실행 경로를 분리하는 첫 단계 역할을 한다.
export class RunQueue {
  private readonly pending: QueueTask[] = [];
  private activeTaskId: string | null = null;

  enqueue(task: QueueTask): void {
    this.pending.push(task);
    this.drain().catch((error: Error) => {
      console.error(`Run queue drain failed: ${error.message}`);
    });
  }

  getSnapshot(): { activeTaskId: string | null; pendingCount: number } {
    return {
      activeTaskId: this.activeTaskId,
      pendingCount: this.pending.length,
    };
  }

  private async drain(): Promise<void> {
    if (this.activeTaskId) {
      return;
    }

    const task = this.pending.shift();
    if (!task) {
      return;
    }

    this.activeTaskId = task.id;
    try {
      await task.run();
    } finally {
      this.activeTaskId = null;
      if (this.pending.length > 0) {
        await this.drain();
      }
    }
  }
}
