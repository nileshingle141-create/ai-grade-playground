import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__authenticated/lesson/$lessonId")({
  component: () => <Outlet />,
});
