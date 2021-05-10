var express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  User = require("../models/userSchema");
patientStats = require("../models/statsSchema/patientStatsSchema");
doctorStats = require("../models/statsSchema/doctorStatsSchema");

//Login get requests
router.get("/userLogin", function (req, res) {
  // console.log(req.flash(error));
  res.render("auth/login");
});
//login post requests

router.post(
  "/userLogin",
  passport.authenticate("local", {
    failureRedirect: "/userlogin",
    failureFlash: true,
  }),
  function (req, res) {
    if (req.user.role == "patient") {
      req.flash("success", "Welcome to MedBuddy! " + req.user.username);
      res.redirect("/userDocSection/patientDashboard");
    } else if (req.user.role == "doctor") {
      req.flash("success", "Welcome to MedBuddy! " + req.user.username);
      res.redirect("/userDocSection/docDashboards");
    } else if (req.user.role == "hospAdmin") {
      req.flash("success", "Welcome to MedBuddy! " + req.user.username);
      res.redirect("/user/hospAdmin/dashboard");
    } else res.send(404);
  }
);

//logout
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Logged Out Successfully! ");
  res.redirect("/");
});

//Signup get requests
router.get("/register", function (req, res) {
  res.render("auth/signup");
});

//Signup post request
router.post("/register", function (req, res) {
  // console.log("post in /register");
  var newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: {
      street: req.body.streetAddress,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    },
    gender: req.body.gender,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.contactNumber,
    avatar: req.body.avatar,
    role: req.body.userRole,
  });

  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Welcome to MedBuddy " + user.username);
        if (req.user.role == "patient") {
          var defaultPatientStats = {
            expenditure: 0,
            handler: {
              id: req.user._id,
              username: req.user.username,
            },
            activeDoctors: 0,
            surgeries: 0,
            appointment: 0,
          };
          patientStats.create(
            defaultPatientStats,
            function (err, defaultStats) {
              if (err) {
                console.log(err);
              } else {
                res.redirect("/userDocSection/patientDashboard");
              }
            }
          );
        } else if (req.user.role == "doctor") {
          var defaultDoctorStats = {
            earnings: 0,
            handler: {
              id: req.user._id,
              username: req.user.username,
            },
            newPatients: 0,
            operations: 0,
            appointment: 0,
          };
          doctorStats.create(defaultDoctorStats, function (err, defaultStats) {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/userDocSection/docDashboard");
            }
          });
        } else if (req.user.role == "hospAdmin")
          res.redirect("/user/hospAdmin/dashboard");
        else res.send(404);
      });
    }
  });
});
module.exports = router;
