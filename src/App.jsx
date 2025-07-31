import { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://playground.4geeks.com/todo'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [username] = useState('alejandra_user') // Usuario para la API
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Crear usuario si no existe
  const createUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok && response.status !== 400) {
        throw new Error('Failed to create user')
      }
    } catch (err) {
      console.error('Error creating user:', err)
    }
  }

  // Cargar tareas desde la API (GET)
  const loadTodos = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/users/${username}`)
      
      if (response.status === 404) {
        // El usuario no existe, crearlo
        await createUser()
        setTodos([])
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load todos')
      }
      
      const data = await response.json()
      setTodos(data.todos || [])
    } catch (err) {
      setError('Error loading todos: ' + err.message)
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Agregar nueva tarea (POST + GET para actualizar)
  const addTodo = async (label) => {
    if (!label.trim()) return

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/todos/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: label.trim(),
          is_done: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add todo')
      }

      // Recargar tareas después de agregar
      await loadTodos()
      setInputValue('')
    } catch (err) {
      setError('Error adding todo: ' + err.message)
      console.error('Error adding todo:', err)
    } finally {
      setLoading(false)
    }
  }

  // Eliminar tarea (DELETE + GET para actualizar)
  const deleteTodo = async (todoId) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      // Recargar tareas después de eliminar
      await loadTodos()
    } catch (err) {
      setError('Error deleting todo: ' + err.message)
      console.error('Error deleting todo:', err)
    } finally {
      setLoading(false)
    }
  }

  // Limpiar todas las tareas (DELETE múltiple + GET para actualizar)
  const clearAllTodos = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Eliminar todas las tareas una por una
      const deletePromises = todos.map(todo => 
        fetch(`${API_BASE_URL}/todos/${todo.id}`, {
          method: 'DELETE'
        })
      )
      
      await Promise.all(deletePromises)
      
      // Recargar tareas después de limpiar todas
      await loadTodos()
    } catch (err) {
      setError('Error clearing todos: ' + err.message)
      console.error('Error clearing todos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Manejar tecla Enter para agregar tarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo(inputValue)
    }
  }

  // Cargar tareas al iniciar la aplicación (useEffect)
  useEffect(() => {
    loadTodos()
  }, [])

  return (
    <div className="todo-app">
      <div className="todo-container">
        <h1 className="todo-title">TODO List</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="todo-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Qué necesitas hacer?"
            className="todo-input"
            disabled={loading}
          />
          <button
            onClick={() => addTodo(inputValue)}
            className="add-button"
            disabled={loading || !inputValue.trim()}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="todo-list">
          {loading && todos.length === 0 ? (
            <div className="loading">Cargando tareas...</div>
          ) : todos.length === 0 ? (
            <div className="no-todos">No hay tareas, añadir tareas</div>
          ) : (
            <>
              {todos.map((todo) => (
                <div key={todo.id} className="todo-item">
                  <span className="todo-text">{todo.label}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="todo-footer">
                <span className="todo-count">
                  {todos.length} {todos.length === 1 ? 'tarea' : 'tareas'}
                </span>
                {todos.length > 0 && (
                  <button
                    onClick={clearAllTodos}
                    className="clear-all-button"
                    disabled={loading}
                  >
                    Limpiar todas las tareas
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App