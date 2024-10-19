const mongoose = require("mongoose")
const Campground=require("../models/campground")
const cities = require("./cities");
const {places , descriptors} = require("./seedHelpers")

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db= mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("Databse connected");
});
  

const sample = array => array[Math.floor(Math.random()*array.length)];
function number() {
    return (Math.floor(Math.random() * 100) + 1);
}
const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0; i<50; i++)
    {
        const random1000 = Math.floor(Math.random() *1000);
        const city = cities[random1000];
        
        const camp = new Campground({
            location: `${city.city}, ${city.state}`,
            tittle: `${sample(descriptors)}, ${sample(places)}`,
            images:[
                {
                    url:'https://res.cloudinary.com/dsynvay9j/image/upload/v1728998670/YelpCamp/ftwiqirsjuoeca6gzeoh.jpg',
                    filename: 'YelpCamp/ftwiqirsjuoeca6gzeoh'
                }
            ],
            geometry:{
                type:"Point",
                coordinates: [city.longitude,city.latitude]

            },
            description:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolorem cumque itaque totam sed vitae quae tenetur minima quibusdam quisquam, sunt illum, nobis pariatur ipsa id deleniti repudiandae, temporibus saepe voluptates.",
            price: number(),
            author: "670a5c7cc612e82b5b8ffbfd",
        })
        await camp.save(); 
    }

}
seedDB().then(()=>{
    mongoose.connection.close();
})
