import { IPayloadGeneric, IWork } from "@vsdbmv2/mapping-library/types/@types";
import path from "node:path";

import { fork } from 'node:child_process';

export const handleWorks = async (works: IWork[]) => {
	if (!works.length) return;
	const promises = works.map((work, index) => {
		const promise = new Promise((resolve, reject) => {
			console.log(`starting work ${index + 1}`)
			const worker = fork('./src/functions/process.js');
			worker.on('message', (result: IPayloadGeneric) => {
				console.log(`finished work ${index + 1}`)
				resolve(result);
			});

			worker.on('exit', (code: number) => {
				if(code !== 0) reject("something went wrong in the worker uaheuah")
			})
			worker.send(work);
		});
		return promise;
	});
	const responses = await Promise.all(promises);
	return responses;
}