import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const fakeExpenses: Expense[] = [
  { id: 1, title: "Groceries", amount: 50 },
  { id: 2, title: "Utilities", amount: 100 },
  { id: 3, title: "Rent", amount: 1000 },
];

type Expense = z.infer<typeof expenseSchema>;

const expenseSchema = z.object({
  id: z.number().int().positive().min(1),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
});

const createPostSchema = expenseSchema.omit({ id: true });

export const expensesRoute = new Hono()
  .get("/", (c) => c.json({ expenses: fakeExpenses }))
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const expense = await c.req.valid("json");
    fakeExpenses.push({ ...expense, id: fakeExpenses.length + 1 });
    console.log(expense);
    return c.json(expense);
  })
  .get("/total-spent", async (c) => {
    // await new Promise( (r) => setTimeout(r,2000))
    const total = fakeExpenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    return c.json({ total });
  });
