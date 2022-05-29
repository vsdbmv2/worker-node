import { computeGlobalAlignment, computeLocalAlignment, epitopeMap } from "@vsdbmv2/mapping-library";
import { IWork } from "../../@types/Work";
import { promisify } from "util";

const asyncComputeGlobalAlignment = promisify(computeGlobalAlignment);
const asyncComputeLocalAlignment = promisify(computeLocalAlignment);
const asyncEpitopeMap = promisify(epitopeMap);

export const handleWork = (work: IWork) => {
	switch (work.type) {
		case "global-mapping": {
			// Faz o mapeamento global
			return computeGlobalAlignment(work.sequence1, work.sequence2 as string, work.id1);
		}
		case "local-mapping": {
			// faz a subtipagem
			return computeLocalAlignment(work.sequence1, work.sequence2 as string);
		}
		case "epitope-mapping": {
			// faz o mapeamento do epitopo
			return epitopeMap(work.sequence1, work.epitopes);
		}
		default: {
			console.error("Something wrong with the work, the payload type was incorrect or inexistent");
			console.table(work);
		}
	}
};

const handleWorks = (works: IWork[]) => {
	return works.map((work: IWork) => handleWork(work));
};

export default handleWorks;
