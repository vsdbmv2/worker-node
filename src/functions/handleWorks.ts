import { IPayloadGeneric, IWork } from "@vsdbmv2/mapping-library";

import { fork } from "node:child_process";

export const handleWorks = async (works: IWork[]) => {
	if (!works.length) return;
	// console.table(
	// 	works.map((work) => ({
	// 		idSequence1: work.id1,
	// 		idSequence2: work.id2,
	// 		sequence1: work.sequence1.length,
	// 		sequence2: work.sequence2.length,
	// 		alignmentSize: work.sequence1.length * work.sequence2.length,
	// 	}))
	// );
	const promises = works.map((work, index) => {
		const promise = new Promise((resolve, reject) => {
			const worker = fork("./src/functions/process.js");
			worker.stdout?.resume();
			worker.stderr?.resume();
			const [seq1, seq2] = [
				Math.max(work.sequence1.length, (work.sequence2 as string).length),
				Math.min(work.sequence1.length, (work.sequence2 as string).length),
			];
			// console.log(
			// 	`asking work ${(index + 1).toString().padEnd(3, " ")} PID ${worker.pid} ${seq1
			// 		.toString()
			// 		.padEnd(5, " ")} x ${seq2.toString().padEnd(5, " ")} ${seq1 * seq2}`
			// );
			worker.on("message", (result: IPayloadGeneric) => {
				// @ts-ignore
				if (result.error) {
					console.log(result);
					return reject(result);
				}
				// console.log(`received work ${index + 1}`);
				// console.log(result);
				resolve(result);
			});

			worker.on("exit", (code: number) => {
				if (code !== 0) reject("something went wrong in the worker");
			});
			worker.send({ ...work, index });
		});
		return promise;
	});
	const responses = await Promise.all(promises);
	return responses;
};
