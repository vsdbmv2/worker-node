import { getArgParams } from "./functions/helpers";
import dotenv from "dotenv";
import os from "os";
dotenv.config();

import { io } from "socket.io-client";
import { WorkbenchSingleton } from "./Workbench";
import { IWork } from "@vsdbmv2/mapping-library/types/@types";

const workBench = WorkbenchSingleton.getInstance();

const totalMemory = Math.ceil(os.totalmem() / (1024 * 1024 * 1024));
const params = getArgParams();

let worksAmount = params.worksAmount ?? (Number(process.env.CONCURRENT_PROCESS) || totalMemory);

console.log(`Starting worker, ${worksAmount} works per time`);

const socket = io(process.env.ORCHESTRATOR_ADDRESS as string);

socket.on("pong", () => {
	if (workBench.hasFinishedWorks) {
		socket.emit("get-work", { worksAmount });
	}
});

socket.on("work", (work?: IWork[]) => {
	if (work) {
		console.log(`getting ${work.length} works`);
		workBench.addWork(work, (finishedWorks: IWork[]) => {
			console.log(`finishing ${finishedWorks.length} works`);
			socket.emit("work-complete", finishedWorks);
			workBench.clearFinishedWorks();
		});
	}
});

socket.on("disconnect", () => {
	console.log("Disconected...", socket.id);
});

socket.on("bem-vindo", (data: any) => console.table({ data, id: socket.id }));
