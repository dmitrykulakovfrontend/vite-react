import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  // hard refresh
  window.location.reload();
  return <div>Hello admin!</div>;
}
