const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const connect = async () => {
  return await mongoose.connect("mongodb://127.0.0.1:27017/mongoStudent", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
};

//batch Schema
const batchSchema = new mongoose.Schema(
  {
    batch_name: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const Batch = mongoose.model("batch", batchSchema);

//batch post
app.post("/batches", async (req, res) => {
  try {
    //console.log(req.body);
    const batch = await Batch.create(req.body);
    return res.status(200).json({ batch });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});
//batch get
app.get("/batches", async (req, res) => {
  try {
    const batch = await Batch.find().lean().exec();
    return res.status(200).json({ batch });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//teacher schema
const teacherSchema = new mongoose.Schema(
  {
    teacher_name: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Teacher = mongoose.model("teacher", teacherSchema);

//teacher post
app.post("/teachers", async (req, res) => {
  try {
    //console.log(req.body);
    const teacher = await Teacher.create(req.body);
    return res.status(200).json({ teacher });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});
//teacher get
app.get("/teachers", async (req, res) => {
  try {
    const teacher = await Teacher.find().lean().exec();
    return res.status(200).json({ teacher });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});
//student schema
const studentSchema = new mongoose.Schema(
  {
    s_name: { type: String, required: true },
    s_age: { type: Number, required: true },
    s_gender: { type: String, required: true },
    s_course: { type: String, required: true },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "batch",
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const Student = mongoose.model("student", studentSchema);

//student post
app.post("/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    return res.status(200).json({ student });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});
//finding all student
app.get("/students", async (req, res) => {
  try {
    const student = await Student.find()
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res.status(200).json({ student });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//finding students whoose age is greater than 18

app.get("/age18students", async (req, res) => {
  try {
    const student = await Student.find({ s_age: { $gt: 18 } })
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res
      .status(200)
      .json({ totalStudentFoundAge18plus: student.length, students: student });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//finding students who applied for FWD
app.get("/FWD", async (req, res) => {
  try {
    const student = await Student.find({ s_course: "FWD" })
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res.status(200).json({
      totalStudentFoundPersuingFullStackWebDevelopment: student.length,
      students: student,
    });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//find the number of students that are men
app.get("/male", async (req, res) => {
  try {
    const student = await Student.find({ s_gender: "male" })
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res
      .status(200)
      .json({ totalMaleStudents: student.length, students: student });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//number of students that are women.
app.get("/female", async (req, res) => {
  try {
    const student = await Student.find({ s_gender: "female" })
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res
      .status(200)
      .json({ totalFeMaleStudents: student.length, students: student });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//find the total number of students
app.get("/total", async (req, res) => {
  try {
    const student = await Student.find()
      .populate("batch_id")
      .populate("teacher_id")
      .lean()
      .exec();
    return res.status(200).json({ TotalStudents: student.length });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//find the total number of students
app.get("/total", async (req, res) => {
  try {
    const student = await Student.find().lean().exec();
    return res.status(200).json({ TotalStudents: student.length });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//find the batch which has the most students.
app.get("/batchWithMoreStudent", async (req, res) => {
  try {
    const student = await Student.find().lean().exec();
    const batches = {};

    for (let i = 0; i < student.length; i++) {
      if (batches[student[i].batch_id]) {
        batches[student[i].batch_id]++;
      } else {
        batches[student[i].batch_id] = 1;
      }
    }

    let max = 0;
    let output = "";
    for (let item in batches) {
      if (max < batches[item]) {
        max = batches[item];
        output = item;
      }
    }
    const batch = await Batch.find({ _id: output }).lean().exec();
    return res.status(200).json({ batch: batch, students: max });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

//find the instructor who is currently teaching most number of students

app.get("/teacherWithMoreStudent", async (req, res) => {
  //console.log("hi");
  try {
    const student = await Student.find().lean().exec();
    const teachers = {};

    for (let i = 0; i < student.length; i++) {
      if (teachers[student[i].teacher_id]) {
        teachers[student[i].teacher_id]++;
      } else {
        teachers[student[i].teacher_id] = 1;
      }
    }

    let max = 0;
    let output = "";
    for (let item in teachers) {
      if (max < teachers[item]) {
        max = teachers[item];
        output = item;
      }
    }
    const teacher = await Teacher.find({ _id: output }).lean().exec();
    return res.status(200).json({ teacher: teacher, students: max });
  } catch (err) {
    res.status(400).send("some error happened in post batch");
  }
});

app.listen("8020", async () => {
  await connect();
  console.log("App responded sucessfully");
});
