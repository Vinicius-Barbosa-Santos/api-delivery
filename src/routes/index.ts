import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { deliveriesRoutes } from "./deliveries-routes";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use(ensureAuthenticated);
routes.use("/deliveries", deliveriesRoutes);

export { routes };
