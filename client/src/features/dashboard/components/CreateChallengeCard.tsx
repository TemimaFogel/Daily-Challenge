import { useNavigate } from "react-router-dom";

export function CreateChallengeCard() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl bg-white dark:bg-card shadow-md">
      <div className="rounded-t-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-3">
        <h3 className="font-bold text-white">Create Challenge</h3>
      </div>
      <div className="rounded-b-2xl p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Start a new daily challenge and motivate others.
        </p>
        <button
          type="button"
          onClick={() => navigate("/challenges/create")}
          className="w-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:from-purple-500 hover:to-fuchsia-400 hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Now
        </button>
      </div>
    </div>
  );
}
