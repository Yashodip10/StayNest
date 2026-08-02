const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://localhost:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
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