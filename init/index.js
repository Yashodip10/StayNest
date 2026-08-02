if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("connection sucessfull..");
}).catch((err)=>{
    console.log(err)
}); 

const initDB = async () => {

    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6a6ebc85b4e8b17e281cd42d"
    }));

    await Listing.insertMany(initData.data);

    console.log("Data was initialized");
};
initDB();