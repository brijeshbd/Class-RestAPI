require('dotenv').config();
const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;
app.use(express.json());
require("./db/conn");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Assignment = require("./models/assignment");
const Assignassignment = require("./models/assignassignment");

const tdate = new Date();
function verifytoken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        res.data = decode;
        next();
    }
    catch (e) {
        return res.status(401).json({ status: true, message: "Chal chal have", data: e });
    }
}
app.post("/addsubmission", verifytoken, (req, res) => {
    const trole = res.data.role;
    if (trole == "Student") {
        const studid = res.data.id;
        const assid = req.body.aid;
        Assignassignment.find({ "sid": studid, "aid": assid }, function (err1, docs) {
            if (err1) {
                console.log(err1);
            }
            else {
                var ddate;
                Assignment.find({ "id": assid }, function (err2, assdata) {
                    if (err2) { console.log(err2) }
                    else {
                        ddate = new Date(assdata.deadlinedate);
                    }
                });
                if (docs.status == "SUBMITTED") { res.send("Sorry, Your Assignment is already submitted"); }
                else if (ddate < tdate) {
                    Assignassignment.updateOne({ sid: studid, aid: assid }, { $set: { status: "OVERDUE" } }, function (err3, r) {
                        if (err3) {
                            console.warn(err.message);
                        }
                        else { res.send("Your Submission is OverDue"); }
                    });
                }
                else {
                    Assignassignment.updateOne({ sid: studid, aid: assid }, { $set: { status: "SUBMITTED" } }, function (err4, r) {
                        if (err4) {
                            console.log(err4);
                        } else { res.send("Your Assignment sucessfully submitted"); }
                    });
                }
            }
        });
    }
    else { res.send("You are Not Student"); }
});


app.get("/addassignment", verifytoken, (req, res) => {
    const trole = res.data.role;
    if (trole == "Tutor") {
        const sdate = new Date(req.body.publishedat);
        var finalstatus;
        if (sdate > tdate) {
            finalstatus = "SCHEDULED"
        }
        else {
            finalstatus = "ONGOING"
        }
        for (const type of req.body.students) {
            const assign = new Assignassignment({
                sid: type,
                tid: res.data.id,
                aid: req.body.id,
                status: "PENDING"
            });
            assign.save();
            // console.log(`A JavaScript type is: ${type}`)
        }
        const ass = new Assignment({
            id: req.body.id,
            tid: res.data.id,
            description: req.body.description,
            publishedat: req.body.publishedat,
            deadlinedate: req.body.deadlinedate,
            status: finalstatus
        });
        ass.save().then(() => {
            res.status(201).send(ass);
        }).catch((e) => {
            res.status(400).send(e);
        });
    }
    else {
        res.send("You haven not permission");
    }
});


app.post("/deleteassignment", verifytoken, async function (req, res) {
    const trole = res.data.role;
    if (trole == "Tutor") {
        Assignment.deleteOne({ tid: res.data.id, id: req.body.aid }, function (err, r) {
            if (err) { console.warn(err) }
            else {
                if (r.n == 0) res.send("You have not permission to delete")
                else { res.send("deleted") }
            }
        });
    }
});


app.get("/updateassignment", verifytoken, function (req, res) {
    const trole = res.data.role;
    if (trole == "Tutor") {
        Assignment.updateOne({ id: req.body.aid, tid: res.data.id }, {
            $set: {
                description: req.body.description,
                publishedat: req.body.publishedat,
                deadlinedate: req.body.deadlinedate
            }
        }, function (err, r) {
            if (err) {
                console.warn(err.message);
            }
            else { res.send("Your Assignment is updated"); }
        });
    }
    else {
        result.send("You Do not have permission");
    }
});


app.get("/showassignment", verifytoken, (req, res) => {
    const trole = res.data.role;

    if (trole == "Tutor") {
        const tid = res.data.id;
        Assignment.find({ tid: tid }, function (err, assdata) {
            if (err) { console.log(err) }
            else {
                res.send(assdata);
            }
        });
    }
    else if (trole == "Student") {
        // const sid = ;
        Assignassignment.find({ sid: res.data.id }, function (r, asdata) {
            if (r) { console.log(r) }
            else {
                var fid = [];
                for (var i in asdata) {
                    fid[i] = asdata[i].aid;
                }
                Assignment.find({ id: fid }, function (er, resdata) {
                    res.send(resdata);
                });
            }
        });
    }
    else {
        res.send("Unvalid");
    }
});


app.post("/signin", (req, res) => {
    User.find({ id: req.body.id })
        .exec()
        .then((user) => {
            if (user.length < 1) alert("Data is not present");
            else {
                bcrypt.compare(
                    req.body.password,
                    user[0].password,
                    (err, result) => {
                        //   if (!res) alert("No result");
                        if (result) {
                            const token = jwt.sign(
                                {
                                    id: user[0].id,
                                    name: user[0].name,
                                    role: user[0].role,
                                },
                                process.env.SECRET_KEY,
                                {
                                    expiresIn: "10h",
                                }
                            );
                            res.status(200).send({
                                token: token,
                            });
                        }
                    }
                );
            }
        })
        .catch((e) => {
            //   alert(e);
        });
});



app.post("/signup", (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) alert("Data not saved");
        else {
            const user = new User({
                id: req.body.id,
                name: req.body.name,
                role: req.body.role,
                password: hash,
            });
            user
                .save()
                .then(() => {
                    res.status(201).send(user);
                })
                .catch((e) => {
                    res.status(400).send(e);
                });
        }
    });
});

app.listen(port, () => {
    console.log("Backend server is running..");
});