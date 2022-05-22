import { IWork } from "@vsdbmv2/mapping-library/types/@types";
import { handleWork } from "./functions/handleWorks";

class Workbench {
	__works: IWork[] = [];
	__finishedWorks: IWork[] = [];

	constructor(_works?: IWork[]) {
		this.__works = _works ?? ([] as IWork[]);
	}

	addWork(works: IWork[], notify: (finishedWorks: IWork[]) => void) {
		this.__works.concat([...works]);
		this.run(notify);
	}

	get hasFinishedWorks(): boolean {
		return this.__works.length === 0;
	}

	clearFinishedWorks() {
		while (this.__finishedWorks.length > 0) {
			this.__finishedWorks.pop();
		}
	}

	private async run(notify: (finishedWorks: IWork[]) => void) {
		// const newJobs = await Promise.all(this._works.map(async work => handleWorkAsync(work)));
		while (!this.hasFinishedWorks) {
			const work = this.__works.pop() as IWork;
			const payload = handleWork(work);
			work.payload = payload;
			work.status = "DONE";
			this.__finishedWorks.push(work);
		}
		notify?.(this.__finishedWorks);
	}
}

export class WorkbenchSingleton {
	static __instance: Workbench = new Workbench();
	__singletonEnforcer = Symbol();

	constructor(enforce: any) {
		if (enforce !== this.__singletonEnforcer) {
			throw new Error("Do not use the constructor for this class!");
		}
	}

	static getInstance(): Workbench {
		if (!this.__instance) {
			this.__instance = new Workbench();
		}
		return this.__instance as Workbench;
	}
}
