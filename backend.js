import express from "express"
import mongoose from "mongoose"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

const URI = "mongodb://20235059:123123123@ac-q1wgd98-shard-00-00.m2z302z.mongodb.net:27017,ac-q1wgd98-shard-00-01.m2z302z.mongodb.net:27017,ac-q1wgd98-shard-00-02.m2z302z.mongodb.net:27017/it4409db?ssl=true&replicaSet=atlas-x4xpei-shard-0&authSource=admin&appName=it4409-20235059"


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên không được để trống'],
    minlength: [2, 'Tên phải có ít nhất 2 ký tự']
  },
  age: {
    type: Number,
    required: [true, 'Tuổi không được để trống'],
    min: [0, 'Tuổi phải >= 0']
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  address: {
    type: String
  }
});

const User = mongoose.model("User", UserSchema)

app.get("/users", async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 5
  const search = String(req.query.search || "")

  const skip = (page - 1) * limit

  const query = {
    $or: [
      {
        name: {
          $regex: search,
          $options: "i"
        }
      },
      {
        email: {
          $regex: search,
          $options: "i"
        }
      },
      {
        address: {
          $regex: search,
          $options: "i"
        }
      }
    ]
  }

  const total = await User.countDocuments(query)

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)

  const totalPages = Math.ceil(total / limit)

  res.json({
    users,
    total,
    totalPages
  })
})

app.post("/users", async (req, res) => {
  try {
    console.log(req.body)

    const data = {
      name: req.body.name?.trim(),
      age: Number.parseInt(req.body.age),
      email: req.body.email?.trim().toLowerCase(),
      address: req.body.address?.trim()
    }

    const errors = {}

    if (!data.name) errors.name = "Tên không được để trống"
    if (!data.email) errors.email = "Email không được để trống"
    if (!data.age && data.age !== 0) errors.age = "Tuổi không được để trống"

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors })
    }

    const exists = await User.findOne({ email: data.email })
    if (exists) {
      return res.status(400).json({
        errors: {
          email: "Email đã tồn tại"
        }
      })
    }

    const user = new User(data)
    await user.save()

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.put("/users/:id", async (req, res) => {
  try {
    const data = {
      name: req.body.name?.trim(),
      age: Number(req.body.age),
      email: req.body.email?.trim().toLowerCase(),
      address: req.body.address?.trim()
    }

    const errors = {}

    if (!data.name) errors.name = "Tên không được để trống"
    if (!data.email) errors.email = "Email không được để trống"
    if (!data.age && data.age !== 0) errors.age = "Tuổi không được để trống"

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors })
    }

    const exists = await User.findOne({
      email: data.email,
      _id: { $ne: req.params.id }
    })

    if (exists) {
      return res.status(400).json({
        errors: { email: "Email đã tồn tại" }
      })
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    )

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

mongoose.connect(URI)
  .then(() => {
    console.log("Connected to MongoDB")

    const PORT = process.env.PORT || 3001

  app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
  })
  })
  .catch(err => console.error(err))