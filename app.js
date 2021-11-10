const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const { float } = require("webidl-conversions");
const { double } = require("webidl-conversions");
const { userInfo } = require("os");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


//DB connecting then creating schema and there model
mongoose.connect('mongodb://localhost:27017/movieDB', { useNewUrlParser: true, useUnifiedTopology: true});

const movieSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    releasedate: String,
    numofrating:Number,
    description: String,
    img: String,
    genre: String
});

const Movie = new mongoose.model("movie", movieSchema);
var globallist=[]

//creating routes
app.get("/", (req, res) => {
    Movie.find({},(err,found)=>{
        if (err) {
            console.log(err);
        } else {
            if (found) {
                globallist=found;
                res.render("home",{movies:found});
            }
        }
    })
});

app.get("/admin",(req,res)=>{
    res.render("admin.ejs");
});

app.post("/addmovie",(req,res)=>{
    const name=req.body.name.toLowerCase();
    const genre=req.body.genre;
    const description=req.body.description;
    const imagelink=req.body.imagelink;
    const releasedate=req.body.releasedate;
    const rating=req.body.rating;
    const numofrating=req.body.numofrating;
    Movie.find({"name":name},(err,foundmovie)=>{
        if (err) {
            console.log(err);
        } else {
            if (foundmovie.length!=0) {
                res.send("<h1>Movie is already in list</h1>");
            }else{
                const arr={
                    name: name,
                    rating: rating,
                    description: description,
                    img: imagelink,
                    releasedate: releasedate,
                    numofrating:numofrating
                    };
                Movie.create(arr,(error,result)=>{
                    if (err){
                        console.log(err);
                    }else{
                        setTimeout(() => {
                            res.redirect("/admin")
                        }, 2000);
                    }
                });
            }
        }
    });
});

app.post("/submit",(req,res)=>{

    const moviename=req.body.moviename;
    const ratinginput= parseInt(req.body.ratinginput);
    Movie.find({"name":moviename.toLowerCase()},(err,foundmovie)=>{
        if (err) {
            console.log(err);
        } else {
            if (foundmovie) {
                console.log(foundmovie);
                const newrating=Math.ceil(((foundmovie[0].rating*foundmovie[0].numofrating)+ratinginput)/(foundmovie[0].numofrating+1));
                Movie.updateOne({"name":moviename.toLowerCase()},{
                    rating: newrating,
                    numofrating: foundmovie[0].numofrating+1
                    },error=>{
                        if(error){
                            res.send(error);
                        }else{
                            setTimeout(() => {
                                res.redirect("/")
                            }, 2000);
                        }
                    })
            }
        }
    });


});

app.get("/genre/:genrename",(req,res)=>{
    const para=req.params.genrename;
    Movie.find({genre:para},(err,found)=>{
        if (err) {
            console.log(err);
        } else {
            if (found) {
                globallist=found;
                res.render("movieviewer",{movies:found});
            }
        }
    })
});

app.get("/sortby",(req,res)=>{
    const found=globallist.sort((a, b) => Date.parse(b.releasedate) - Date.parse(a.releasedate));
    res.render("movieviewer",{movies:found});
})

app.get("/movie/:moviename",(req,res)=>{
    const moviename=req.params.moviename;
    Movie.find({"name":moviename},(err,foundmovie)=>{
        if (err) {
            console.log(err);
        } else {
            if (foundmovie) {
                res.render("indipage.ejs",{movies:foundmovie});
            }
        }
    });
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});

