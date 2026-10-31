import { useState, useEffect } from "react";

const STORAGE_KEY = "todo-list-items";

const fallbackImages = {
  coding:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
  food:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
  travel:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
  fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  music:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
  shopping:
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  study:
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
  home:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  health:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
  nature:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  default:
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=80"
};

const keywordCategoryMap = [
  {
    category: "coding",
    keywords: ["react", "code", "programming", "developer", "javascript", "html", "css", "learn", "study", "build", "app", "project"]
  },
  {
    category: "food",
    keywords: ["milk", "food", "eat", "breakfast", "lunch", "dinner", "coffee", "tea", "cook", "grocery", "meal"]
  },
  {
    category: "travel",
    keywords: ["travel", "trip", "flight", "beach", "mountain", "holiday", "vacation", "tour", "plane", "train", "airport"]
  },
  {
    category: "fitness",
    keywords: ["gym", "workout", "fitness", "run", "exercise", "health", "walking", "yoga", "sport", "jog", "training"]
  },
  {
    category: "music",
    keywords: ["music", "song", "playlist", "dance", "concert", "listen", "sing", "guitar"]
  },
  {
    category: "shopping",
    keywords: ["shop", "shopping", "buy", "purchase", "market", "store", "cart", "order", "clothes", "dress"]
  },
  {
    category: "study",
    keywords: ["read", "book", "study", "notes", "library", "write", "assignment", "essay", "exam"]
  },
  {
    category: "home",
    keywords: ["clean", "home", "house", "organize", "laundry", "wash", "tidy", "kitchen"]
  },
  {
    category: "health",
    keywords: ["doctor", "hospital", "appointment", "checkup", "health", "medicine", "therapy", "care"]
  },
  {
    category: "nature",
    keywords: ["garden", "plant", "nature", "forest", "park", "tree", "outdoor", "walk", "sunset"]
  }
];

function getBestCategory(taskText) {
  const text = taskText.toLowerCase();

  for (const item of keywordCategoryMap) {
    for (const keyword of item.keywords) {
      if (text.includes(keyword)) {
        return item.category;
      }
    }
  }

  return "default";
}

async function fetchUnsplashImage(taskText) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const category = getBestCategory(taskText);
  const fallback = fallbackImages[category] || fallbackImages.default;

  if (!accessKey) {
    return fallback;
  }

  try {
    const query = encodeURIComponent(taskText);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return fallback;
  } catch (error) {
    console.error("Unsplash fetch failed:", error);
    return fallback;
  }
}

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    return [
      { id: 1, text: "Learn React", completed: false, imageUrl: fallbackImages.coding },
      { id: 2, text: "Buy milk", completed: true, imageUrl: fallbackImages.food }
    ];
  });

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;

    const imageUrl = await fetchUnsplashImage(text);

    setTodos([
      ...todos,
      { id: Date.now(), text, completed: false, imageUrl }
    ]);

    setInput("");
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    const text = editText.trim();
    if (!text) return;

    const imageUrl = await fetchUnsplashImage(text);

    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text, imageUrl } : todo
      )
    );

    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>To-Do List</h1>

        <div style={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            placeholder="Add a task..."
            style={styles.input}
          />
          <button onClick={addTodo} style={styles.addButton}>
            Add
          </button>
        </div>

        <div style={styles.todos}>
          {todos.length === 0 ? (
            <p style={styles.emptyText}>No tasks yet</p>
          ) : (
            todos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <div key={todo.id} style={styles.todoCard}>
                  <img src={todo.imageUrl || fallbackImages.default} alt={todo.text} style={styles.todoImage} />

                  {isEditing ? (
                    <div style={styles.editBox}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={styles.editInput}
                      />

                      <div style={styles.editActions}>
                        <button onClick={() => saveEdit(todo.id)} style={styles.saveButton}>
                          Save
                        </button>
                        <button onClick={cancelEdit} style={styles.cancelButton}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.todoContent}>
                      <span
                        onClick={() => toggleTodo(todo.id)}
                        style={{
                          ...styles.todoText,
                          textDecoration: todo.completed ? "line-through" : "none",
                          color: todo.completed ? "#888" : "#222"
                        }}
                      >
                        {todo.text}
                      </span>

                      <div style={styles.actionButtons}>
                        <button onClick={() => startEditing(todo)} style={styles.modifyButton}>
                          Modify
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} style={styles.deleteButton}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={styles.footer}>
          <span>{todos.filter((todo) => !todo.completed).length} items left</span>
          <button onClick={clearCompleted} style={styles.clearButton}>
            Clear completed
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: "620px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)"
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
    fontSize: "36px"
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px"
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "16px"
  },
  addButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  todos: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  todoCard: {
    borderRadius: "14px",
    overflow: "hidden",
    background: "#f9f9f9",
    border: "1px solid #eee",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },
  todoImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block"
  },
  todoContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    gap: "12px"
  },
  todoText: {
    cursor: "pointer",
    flex: 1,
    fontSize: "18px",
    wordBreak: "break-word"
  },
  actionButtons: {
    display: "flex",
    gap: "8px"
  },
  modifyButton: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#22c55e",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  deleteButton: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  editBox: {
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  editInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px"
  },
  editActions: {
    display: "flex",
    gap: "8px"
  },
  saveButton: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  cancelButton: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#9ca3af",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  footer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#555",
    fontSize: "14px"
  },
  clearButton: {
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    fontWeight: "bold",
    cursor: "pointer"
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    margin: "20px 0"
  }
};

export default App;