// app/routes/index.tsx
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const filePath = "count.txt";

async function readCount() {
	return Number.parseInt(
		await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
	);
}

const getCount = createServerFn({
	method: "GET",
}).handler(() => {
	return readCount();
});

const greetings = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler((ctx) => ctx.data);

const updateCount = createServerFn({ method: "POST" })
	.validator((d: number) => d)
	.handler(async ({ data }) => {
		const count = await readCount();
		await fs.promises.writeFile(filePath, `${count + data}`);
	});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => {
		const count = await getCount();
		const userName = await greetings({ data: `tes - ${count}` });
		console.log(userName);
		return count;
	},
});

function Home() {
	const router = useRouter();
	const state = Route.useLoaderData();

	return (
		<button
			type="button"
			onClick={() => {
				updateCount({ data: 1 }).then(() => {
					router.invalidate();
				});
			}}
		>
			Add 1 to {state}?
		</button>
	);
}
