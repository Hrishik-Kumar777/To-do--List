import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  CheckCircle2,
  Circle,
  ListTodo,
} from "lucide-react";

// Simple utility to create unique ids
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const STORAGE_KEY = "todos-v1";

const filters = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function TodoApp() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remaining = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);

  const visibleTodos = useMemo(() => {
    let list = [...todos];
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.text.toLowerCase().includes(q));
    }
    return list;
  }, [todos, filter, search]);

  function addTodo() {
    const val = text.trim();
    if (!val) return;
    setTodos((prev) => [
      { id: uid(), text: val, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setText("");
    inputRef.current?.focus();
  }

  function toggle(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function remove(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditingText(t.text);
  }

  function saveEdit(id) {
    const val = editingText.trim();
    if (!val) return cancelEdit();
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: val } : t)));
    cancelEdit();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  function toggleAll() {
    const allDone = todos.every((t) => t.completed);
    setTodos((prev) => prev.map((t) => ({ ...t, completed: !allDone })));
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header / Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white shadow-sm">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">To‑Do List</h1>
            <p className="text-sm text-slate-600">Lightweight, fast, and stored locally in your browser.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          {/* Add bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <button
                onClick={toggleAll}
                className="shrink-0 rounded-lg px-2 py-1 text-sm border border-slate-300 hover:bg-slate-100"
                title="Toggle all"
              >
                ✓
              </button>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                }}
                placeholder="Add a task and press Enter…"
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={addTodo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium shadow-sm border border-slate-200 hover:bg-slate-50"
            >
              <Plus className="h-5 w-5" /> Add
            </button>
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${
                    filter === f.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="mt-4 divide-y">
            <AnimatePresence initial={false}>
              {visibleTodos.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-slate-500 py-8 text-center"
                >
                  No tasks to show. Add something above ✨
                </motion.div>
              ) : (
                visibleTodos.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 py-3"
                  >
                    <button
                      onClick={() => toggle(t.id)}
                      className="p-1 rounded-full hover:bg-slate-100"
                      aria-label={t.completed ? "Mark as active" : "Mark as completed"}
                    >
                      {t.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    {editingId === t.id ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(t.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                      />
                    ) : (
                      <div className={`flex-1 text-sm ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {t.text}
                      </div>
                    )}

                    {editingId === t.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-1"
                        >
                          <Save className="h-4 w-4" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-1"
                        >
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => remove(t.id)}
                          className="px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-sm inline-flex items-center gap-1 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-sm text-slate-600">
            <div>
              {remaining} {remaining === 1 ? "task" : "tasks"} remaining
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCompleted}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Clear completed
              </button>
              <button
                onClick={() => setTodos([])}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 text-xs text-slate-500">
          <p>Tips: Press <kbd className="border px-1 rounded">Enter</kbd> to add, click the circle to toggle, and double‑tap Edit to cancel.</p>
        </div>
      </div>
    </div>
  );
}
