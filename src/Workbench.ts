import { IWork } from "@vsdbmv2/mapping-library/types/@types";
import { handleWork } from "./functions/handleWorks";

class Workbench {
	__works: IWork[] = [];
	__finishedWorks: IWork[] = [];

	constructor(_works?: IWork[]) {
		this.__works = _works ?? ([] as IWork[]);
	}

	addWorks(works: IWork[], notify: (finishedWorks: IWork[]) => void) {
		this.__works = this.__works.concat(works);
		this.run(notify);
	}

	async addWorksAsync(works: IWork[]): Promise<IWork[]> {
		this.__works = this.__works.concat(works);
		// return new Promise((resolve) => this.run(resolve));
		return this.runAsync();
	}

	get finishedWorks(): boolean {
		return this.__works.length === 0;
	}

	clearFinishedWorks() {
		while (this.__finishedWorks.length) this.__finishedWorks.pop();
	}

	private run(notify?: (finishedWorks: IWork[]) => void) {
		while (!this.finishedWorks) {
			const work = this.__works.pop() as IWork;
			const payload = handleWork(work);
			work.payload = payload;
			work.status = "DONE";
			this.__finishedWorks.push(work);
		}
		notify?.(this.__finishedWorks);
	}
	private async runAsync(): Promise<IWork[]> {
		const works = await Promise.all(this.__works.map(async (work: IWork) => ({
			...work,
			payload : handleWork(work),
			status: "DONE"
		}) as IWork));
		this.__finishedWorks = works;
		while(!this.finishedWorks) this.__works.pop();
		return this.__finishedWorks;
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
