import express, { Router } from "express";
import { scrapeLatestDOM, fetchApps, fetchApp } from "./api/apps";

const appRouter = Router();

appRouter.post("/apps.json", scrapeLatestDOM);
appRouter.get("/apps.json", fetchApps);
appRouter.get("/apps/:pkg.json", fetchApp);
// appRouter.get("/apps/details.json", fetchAppDetails);

export default appRouter;
