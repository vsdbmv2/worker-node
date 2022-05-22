export const logMemory = () => {
	const used: any = process.memoryUsage();
	let memo = [];
	for (let key in used) {
		memo.push({ key, size: `${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`.padStart(8, " ") });
	}
	console.table(memo);
	console.log("".padStart(50, "-"));
};

type params = {
	worksAmount?: number;
};

export const getArgParams = () => {
	const params: params = {
		worksAmount: undefined,
	};
	for (const arg of process.argv) {
		if (arg && /(--)?(work|process|child|instance|amount)/gi.test(arg)) {
			const newValue = arg.match(/\d+/g);
			if (newValue) {
				if (!isNaN(Number(newValue[0] as string))) {
					params.worksAmount = Number(newValue[0]);
				}
			}
		}
	}
	return params;
};
