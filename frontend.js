const API = "http://localhost:3001/users"

function App() {
  const [users, setUsers] = React.useState([])
  const [search, setSearch] = React.useState("")
  const [form, setForm] = React.useState({
    name: "",
    age: "",
    email: "",
    address: ""
  })

  const [editingId, setEditingId] = React.useState(null)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [limit, setLimit] = React.useState(3)
  const [showModal, setShowModal] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [serverError, setServerError] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)

    return () => clearTimeout(timer)
  }, [page, search, limit])

  async function fetchUsers() {
    try {
      setServerError("")

      const res = await fetch(
        API + `?page=${page}&limit=${limit}&search=${search}`
      )

      if (!res.ok) throw new Error("Server error")

      const data = await res.json()

      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
    } catch (e) {
      console.log(e)
      setUsers([])
      setTotalPages(1)
      setServerError(" Mất kết nối server")
    }
  }

  async function addUser() {
    try {
      setErrors({})
      setServerError("")

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      let data = {}

      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setErrors(data.errors || {})
        return false
      }

      setUsers(prev => [...prev, data])

      setForm({
        name: "",
        age: "",
        email: "",
        address: ""
      })

      return true
    } catch (err) {
      console.log(err)
      setServerError(" Mất kết nối server")
      return false
    }
  }

  async function deleteUser(id) {
    try {
      await fetch(API + "/" + id, {
        method: "DELETE"
      })

      setUsers(users.filter(u => u._id !== id))
    } catch {
      setServerError(" Mất kết nối server")
    }
  }

  async function updateUser(id) {
    try {
      setErrors({})

      const res = await fetch(API + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors(data.errors || {})
        return
      }

      setUsers(users.map(u => (u._id === id ? data : u)))

      setEditingId(null)

      setForm({
        name: "",
        age: "",
        email: "",
        address: ""
      })
    } catch {
      setServerError(" Mất kết nối server")
    }
  }

  return (
    <div>
      <h2>CRUD Users</h2>
      {serverError && (
        <div style={{
          background: "#ffdddd",
          color: "red",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px"
        }}>
          {serverError}
        </div>
      )}
      <input
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <button
        onClick={() => {
          setShowModal(true)
          setServerError("")
          setErrors({})
        }}
      >
        Thêm người dùng
      </button>

      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            width: "300px",
            borderRadius: "8px"
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px"
            }}>
              <h3>Thêm người dùng</h3>
              <button onClick={() => setShowModal(false)}>X</button>
            </div>

            {serverError && (
              <p style={{ color: "red", marginBottom: "10px" }}>
                {serverError}
              </p>
            )}

            <p>Họ tên:</p>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <p style={{ color: "red" }}>{errors.name}</p>

            <p>Tuổi:</p>
            <input
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
            />
            <p style={{ color: "red" }}>{errors.age}</p>

            <p>Email:</p>
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <p style={{ color: "red" }}>{errors.email}</p>

            <p>Địa chỉ:</p>
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
            <p style={{ color: "red" }}>{errors.address}</p>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={async () => {
                  const ok = await addUser()
                  if (ok) setShowModal(false)
                }}
              >
                Lưu
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{ marginLeft: "10px" }}
              >
                Hủy
              </button>
            </div>

          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, index) => (
            <tr key={u._id}>
              <td>{(page - 1) * limit + index + 1}</td>
              <td>{u.name}</td>
              <td>{u.age}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>
                <button onClick={() => {
                  setEditingId(u._id)
                  setForm(u)
                  setShowModal(true)
                }}>
                  Edit
                </button>

                <button onClick={() => deleteUser(u._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <select
          value={limit}
          onChange={e => {
            setLimit(Number(e.target.value))
            setPage(1)
          }}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>

        {" "}dòng/trang │

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        {" "}Trang {page}/{totalPages}{" "}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)  