-- Seed data for React Query Tutorial steps
-- Project ID: b2ac8743-290c-4af2-9cbe-914eec0bd63a

-- Clear any existing steps for this project (optional, comment out if you want to keep existing)
-- DELETE FROM steps WHERE project_id = 'b2ac8743-290c-4af2-9cbe-914eec0bd63a';

-- Insert steps
INSERT INTO steps (project_id, index, title, notes, language, code) VALUES
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  0,
  '1. Setup and Installation',
  'First, install TanStack Query and set up the QueryClient provider in your app.',
  'typescript',
  $code$// Install dependencies
// npm install @tanstack/react-query

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  1,
  '2. Basic Query Hook',
  'Create a simple query to fetch data. This example fetches a list of todos.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  2,
  '3. Query with Variables',
  'Use query variables to fetch specific data. This example fetches a single todo by ID.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodo(id: number): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch todo');
  }
  return response.json();
}

function TodoDetail({ todoId }: { todoId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetchTodo(todoId),
    enabled: !!todoId, // Only run query if todoId exists
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{data?.title}</h2>
      <p>Completed: {data?.completed ? 'Yes' : 'No'}</p>
    </div>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  3,
  '4. Creating Mutations',
  'Use mutations to create, update, or delete data. This example creates a new todo.',
  'typescript',
  $code$import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface CreateTodoInput {
  title: string;
  completed?: boolean;
}

async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to create todo');
  }
  return response.json();
}

function CreateTodoForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      title: formData.get('title') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Todo title" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Todo'}
      </button>
      {mutation.isError && (
        <div>Error: {mutation.error.message}</div>
      )}
    </form>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  4,
  '5. Updating with Mutations',
  'Update existing data using mutations. This example toggles a todo''s completed status.',
  'typescript',
  $code$import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  return response.json();
}

function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();
  
  const toggleMutation = useMutation({
    mutationFn: (completed: boolean) => 
      updateTodo(todo.id, { completed }),
    onSuccess: () => {
      // Invalidate both the list and this specific todo
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', todo.id] });
    },
  });

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => toggleMutation.mutate(e.target.checked)}
        disabled={toggleMutation.isPending}
      />
      <span>{todo.title}</span>
    </div>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  5,
  '6. Optimistic Updates',
  'Update the UI immediately before the server responds, then rollback on error. This provides instant feedback.',
  'typescript',
  $code$import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  return response.json();
}

function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();
  
  const toggleMutation = useMutation({
    mutationFn: (completed: boolean) => 
      updateTodo(todo.id, { completed }),
    
    // Optimistically update the cache
    onMutate: async (newCompleted) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', todo.id] });
      
      // Snapshot previous value
      const previousTodo = queryClient.getQueryData<Todo>(['todos', todo.id]);
      
      // Optimistically update
      queryClient.setQueryData<Todo>(['todos', todo.id], (old) => ({
        ...old!,
        completed: newCompleted,
      }));
      
      return { previousTodo };
    },
    
    // Rollback on error
    onError: (err, newCompleted, context) => {
      if (context?.previousTodo) {
        queryClient.setQueryData(['todos', todo.id], context.previousTodo);
      }
    },
    
    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', todo.id] });
    },
  });

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => toggleMutation.mutate(e.target.checked)}
        disabled={toggleMutation.isPending}
      />
      <span>{todo.title}</span>
    </div>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  6,
  '7. Error Handling and Retry Logic',
  'Configure error handling and retry behavior for better user experience.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

function TodoList() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Exponential backoff: 1s, 2s, 4s, max 30s
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (isError) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['todos'] })}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <ul>
      {data?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}$code$
),
(
  'b2ac8743-290c-4af2-9cbe-914eec0bd63a',
  7,
  '8. Dependent Queries',
  'Chain queries where one depends on the result of another. This example fetches user details, then their todos.',
  'typescript',
  $code$import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

async function fetchUserTodos(userId: number): Promise<Todo[]> {
  const response = await fetch(`/api/users/${userId}/todos`);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

function UserTodos({ userId }: { userId: number }) {
  // First, fetch the user
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });

  // Then, fetch todos for that user (only runs after user is loaded)
  const { data: todos, isLoading } = useQuery({
    queryKey: ['users', userId, 'todos'],
    queryFn: () => fetchUserTodos(userId),
    enabled: !!user, // Only run when user data is available
  });

  if (isLoading) return <div>Loading todos...</div>;

  return (
    <div>
      <h2>{user?.name}''s Todos</h2>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}$code$
);

