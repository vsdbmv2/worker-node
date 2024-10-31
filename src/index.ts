import { getArgParams } from "./functions/helpers.js";
import dotenv from "dotenv";
dotenv.config();

import { io } from "socket.io-client";
import { IWork } from "@vsdbmv2/mapping-library";
import { handleWorks } from "./functions/handleWorks.js";
import { availableParallelism } from "node:os";
const numCPUs = availableParallelism();

const params = getArgParams();

let worksAmount = params.worksAmount ?? (Number(process.env.CONCURRENT_PROCESS) || numCPUs);

console.log(`Starting worker, ${worksAmount} works per time`);

const socket = io(process.env.ORCHESTRATOR_ADDRESS as string);
let busy = false;
let retries = 0;
socket.on("ping", (data) => {
	socket.emit("pong", {
		// startTime: data.startTime,
		...(data.server_ts ? { server_ts: data.server_ts } : {}),
		...(data.server_ack_ts ? { server_ack_ts: data.server_ack_ts } : {}),
		client_ts: performance.now(),
	});
	if (busy) return;
	socket.emit("get-work", { worksAmount });
	retries++;
});

socket.on("work", async (works: IWork[]) => {
	if (!works) return;
	busy = true;
	retries = 0;
	const results = await handleWorks(works);
	await socket.emit("work-complete", results);
	busy = false;
});

socket.on("disconnect", () => {
	console.log("Disconnected...", socket.id);
	busy = false;
});
socket.on("connect", () => {
	socket.emit("get-work", { worksAmount });
});
socket.on("reconnect", () => {
	socket.emit("get-work", { worksAmount });
});
