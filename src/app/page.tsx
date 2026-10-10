import { WorkspacePreview } from "@/features/workspace/components/workspace-preview";

export default function BuilderPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-brand">
          Workspace Builder
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Design your workspace, rent it in minutes.
        </h1>
      </div>
      <WorkspacePreview className="max-w-5xl" />
    </section>
  );
}
