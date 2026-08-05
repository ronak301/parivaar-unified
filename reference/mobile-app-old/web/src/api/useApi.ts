import { useCallback, useState } from "react";

export function useApi<TArgs extends unknown[], TResult>(
  apiFunc: (...args: TArgs) => Promise<TResult>
) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError("");
      try {
        const result = await apiFunc(...args);
        if (result && typeof result === "object" && "data" in result) {
          setData((result as { data: unknown }).data);
        }
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected Error!!";
        console.error(err);
        setError(message);
        return message;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return {
    loading,
    data,
    error,
    request,
  };
}
