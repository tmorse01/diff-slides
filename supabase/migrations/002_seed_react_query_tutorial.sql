-- Seed data for React Query Tutorial steps
-- Project ID: b2ac8743-290c-4af2-9cbe-914eec0bd63a
-- Focus: Progressive tutorial on useQuery hook - incremental changes

-- Clear any existing steps for this project (optional, comment out if you want to keep existing)
-- DELETE FROM steps WHERE project_id = 'b2ac8743-290c-4af2-9cbe-914eec0bd63a';

-- Insert steps
INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  0,
  '1. Basic useQuery',
  'Start with the simplest useQuery. Just pass a queryKey and queryFn.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  1,
  '2. Add variable to queryKey',
  'Include variables in the queryKey array. Each unique key gets its own cache entry.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoDetail({ todoId }: { todoId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetch(`/api/todos/${todoId}`).then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  2,
  '3. Add enabled option',
  'Use enabled to conditionally run the query. Prevents fetching when data is missing.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoDetail({ todoId }: { todoId: number | null }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetch(`/api/todos/${todoId}`).then(res => res.json()),
    enabled: !!todoId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  3,
  '4. Add staleTime',
  'Set staleTime to control how long data stays fresh. Fresh data won''t refetch automatically.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  4,
  '5. Add refetchInterval',
  'Set refetchInterval to automatically refetch data at regular intervals.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30, // Every 30 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  5,
  '6. Add second useQuery',
  'Add another useQuery that depends on the first. Use enabled to wait for the first query.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function UserTodos({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
  });

  const { data: todos } = useQuery({
    queryKey: ['users', userId, 'todos'],
    queryFn: () => fetch(`/api/users/${userId}/todos`).then(res => res.json()),
    enabled: !!user,
  });

  return <div>{JSON.stringify({ user, todos })}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  6,
  '7. Add retry options',
  'Configure retry behavior. React Query will automatically retry failed queries.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{JSON.stringify(data)}</div>;
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  7,
  '8. Use refetch function',
  'Destructure refetch from useQuery to manually trigger a refetch. Use isFetching to show loading state.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        Refresh
      </button>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}$code$
);

